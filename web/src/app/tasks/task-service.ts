import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { NewTask, Task, TaskChanges, TaskPage } from './task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  list(cursor?: string): Observable<TaskPage> {
    return this.http.get<TaskPage>('/api/tasks', {
      params: cursor ? { cursor } : {},
    });
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
