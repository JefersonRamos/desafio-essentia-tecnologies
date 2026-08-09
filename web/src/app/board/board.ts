import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmService } from '../confirm-dialog/confirm-service';
import { Navigation } from '../navigation/navigation';
import { TaskCard } from '../task-card/task-card';
import { TaskDialogService } from '../task-dialog/task-dialog-service';
import { ToastService } from '../toast-host/toast-service';
import type { Task, TaskChanges } from '../tasks/task.model';
import { TaskStore } from '../tasks/task-store';

@Component({
  selector: 'app-board',
  imports: [Navigation, TaskCard, ReactiveFormsModule],
  templateUrl: './board.html',
})
export class Board {
  private readonly confirm = inject(ConfirmService);
  private readonly toasts = inject(ToastService);
  private readonly dialog = inject(TaskDialogService);

  protected readonly store = inject(TaskStore);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
  });

  constructor() {
    this.store.load();
  }

  protected add(): void {
    const title = this.form.getRawValue().title.trim();

    if (!title) {
      this.form.markAllAsTouched();
      return;
    }

    this.store.create({ title }, (created) => this.dialog.refine(created));
    this.form.reset();
  }

  protected compose(): void {
    this.dialog.create(this.form.getRawValue().title.trim());
    this.form.reset();
  }

  protected toggle(task: Task): void {
    this.store.toggle(task);

    this.toasts.show(task.done ? 'Tarefa reaberta' : 'Tarefa concluída', {
      action: { label: 'Desfazer', run: () => this.store.update(task.id, { done: task.done }) },
    });
  }

  protected async save(task: Task, changes: TaskChanges): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Salvar alterações',
      message: `O conteúdo atual de "${task.title}" será substituído.`,
      action: 'Salvar',
    });

    if (!confirmed) return;

    const previous: TaskChanges = { title: task.title, description: task.description };

    this.store.update(task.id, changes);

    this.toasts.show('Tarefa atualizada', {
      action: { label: 'Desfazer', run: () => this.store.update(task.id, previous) },
    });
  }

  protected async remove(task: Task): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Remover tarefa',
      message: `"${task.title}" sai da sua lista.`,
      action: 'Remover',
      danger: true,
    });

    if (!confirmed) return;

    this.store.scheduleRemoval(task);

    this.toasts.show('Tarefa removida', {
      action: { label: 'Desfazer', run: () => this.store.cancelRemoval(task.id) },
      onExpire: () => this.store.commitRemoval(task.id),
    });
  }
}
