import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { apiMessage } from '../core/http/api-error';
import type { NewTask, Task, TaskChanges } from './task.model';
import { TaskService } from './task-service';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  failure: string | null;
  leaving: Task[];
}

const INITIAL: TaskState = { tasks: [], loading: false, failure: null, leaving: [] };

function ordered(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => Number(a.done) - Number(b.done) || b.createdAt.localeCompare(a.createdAt),
  );
}

export const TaskStore = signalStore(
  { providedIn: 'root' },

  withState<TaskState>(INITIAL),

  withComputed(({ tasks }) => ({
    pending: computed(() => tasks().filter((task) => !task.done).length),
    completed: computed(() => tasks().filter((task) => task.done).length),
  })),

  withMethods((store, service = inject(TaskService)) => {
    const fail = (response: HttpErrorResponse, fallback: string): void => {
      patchState(store, { loading: false, failure: apiMessage(response, fallback) });
    };

    const replace = (task: Task): void => {
      patchState(store, {
        tasks: ordered(store.tasks().map((current) => (current.id === task.id ? task : current))),
        failure: null,
      });
    };

    return {
      reset(): void {
        patchState(store, INITIAL);
      },

      load(): void {
        patchState(store, { loading: true, failure: null });

        service.list().subscribe({
          next: (tasks) => patchState(store, { tasks: ordered(tasks), loading: false }),
          error: (response: HttpErrorResponse) =>
            fail(response, 'Não foi possível carregar as tarefas.'),
        });
      },

      create(task: NewTask): void {
        service.create(task).subscribe({
          next: (created) =>
            patchState(store, { tasks: ordered([created, ...store.tasks()]), failure: null }),
          error: (response: HttpErrorResponse) =>
            fail(response, 'Não foi possível criar a tarefa.'),
        });
      },

      update(id: string, changes: TaskChanges): void {
        service.update(id, changes).subscribe({
          next: replace,
          error: (response: HttpErrorResponse) =>
            fail(response, 'Não foi possível salvar a tarefa.'),
        });
      },

      toggle(task: Task): void {
        service.update(task.id, { done: !task.done }).subscribe({
          next: replace,
          error: (response: HttpErrorResponse) =>
            fail(response, 'Não foi possível alterar a tarefa.'),
        });
      },

      scheduleRemoval(task: Task): void {
        patchState(store, {
          tasks: store.tasks().filter((current) => current.id !== task.id),
          leaving: [...store.leaving(), task],
          failure: null,
        });
      },

      cancelRemoval(id: string): void {
        const task = store.leaving().find((current) => current.id === id);

        if (!task) return;

        patchState(store, {
          tasks: ordered([...store.tasks(), task]),
          leaving: store.leaving().filter((current) => current.id !== id),
        });
      },

      commitRemoval(id: string): void {
        const task = store.leaving().find((current) => current.id === id);

        if (!task) return;

        patchState(store, { leaving: store.leaving().filter((current) => current.id !== id) });

        service.remove(id).subscribe({
          error: (response: HttpErrorResponse) => {
            patchState(store, { tasks: ordered([...store.tasks(), task]) });
            fail(response, 'Não foi possível remover a tarefa.');
          },
        });
      },
    };
  }),
);
