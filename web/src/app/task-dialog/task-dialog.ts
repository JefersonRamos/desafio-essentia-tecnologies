import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../toast-host/toast-service';
import { TaskStore } from '../tasks/task-store';
import { TaskDialogService } from './task-dialog-service';

@Component({
  selector: 'app-task-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './task-dialog.html',
})
export class TaskDialog {
  private readonly element = viewChild.required<ElementRef<HTMLDialogElement>>('element');
  private readonly store = inject(TaskStore);
  private readonly toasts = inject(ToastService);

  protected readonly dialog = inject(TaskDialogService);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(5000)]],
  });

  constructor() {
    effect(() => {
      const current = this.dialog.current();
      const element = this.element().nativeElement;

      if (!current) {
        if (element.open) element.close();
        return;
      }

      this.form.setValue({
        title: current.title,
        description: current.task?.description ?? '',
      });

      if (!element.open) element.showModal();
    });
  }

  protected submit(): void {
    const current = this.dialog.current();

    if (!current) return;

    const { title, description } = this.form.getRawValue();

    if (!title.trim()) {
      this.form.markAllAsTouched();
      return;
    }

    const changes = { title, description: description.trim() ? description : null };
    const task = current.task;

    if (!task) {
      this.store.create(changes);
      this.dialog.close();
      return;
    }

    const previous = { title: task.title, description: task.description };

    this.store.update(task.id, changes);
    this.dialog.close();

    this.toasts.show('Tarefa atualizada', {
      action: { label: 'Desfazer', run: () => this.store.update(task.id, previous) },
    });
  }

  protected close(): void {
    this.dialog.close();
  }
}
