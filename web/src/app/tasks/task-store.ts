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
}

const INITIAL: TaskState = { tasks: [], loading: false, failure: null };

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

      remove(id: string): void {
        service.remove(id).subscribe({
          next: () =>
            patchState(store, {
              tasks: store.tasks().filter((task) => task.id !== id),
              failure: null,
            }),
          error: (response: HttpErrorResponse) =>
            fail(response, 'Não foi possível remover a tarefa.'),
        });
      },
    };
  }),
);
