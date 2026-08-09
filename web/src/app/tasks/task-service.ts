import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { NewTask, Task, TaskChanges } from './task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  list(): Observable<Task[]> {
    return this.http.get<{ tasks: Task[] }>('/api/tasks').pipe(map((body) => body.tasks));
  }

  create(task: NewTask): Observable<Task> {
    return this.http.post<{ task: Task }>('/api/tasks', task).pipe(map((body) => body.task));
  }

  update(id: string, changes: TaskChanges): Observable<Task> {
    return this.http
      .patch<{ task: Task }>(`/api/tasks/${id}`, changes)
      .pipe(map((body) => body.task));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/tasks/${id}`);
  }
}
