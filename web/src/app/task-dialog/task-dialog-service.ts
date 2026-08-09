import { Injectable, signal } from '@angular/core';
import type { Task } from '../tasks/task.model';

export interface TaskDialogState {
  readonly task: Task | null;
  readonly title: string;
}

@Injectable({ providedIn: 'root' })
export class TaskDialogService {
  private readonly state = signal<TaskDialogState | null>(null);

  readonly current = this.state.asReadonly();

  create(title = ''): void {
    this.state.set({ task: null, title });
  }

  refine(task: Task): void {
    this.state.set({ task, title: task.title });
  }

  close(): void {
    this.state.set(null);
  }
}
