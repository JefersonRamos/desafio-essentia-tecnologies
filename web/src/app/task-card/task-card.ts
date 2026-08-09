import { DatePipe } from "@angular/common";
import { Component, inject, input, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import type { Task, TaskChanges } from "../tasks/task.model";

@Component({
  selector: "app-task-card",
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: "./task-card.html",
  styleUrl: "./task-card.css",
})
export class TaskCard {
  readonly task = input.required<Task>();

  readonly toggle = output<void>();
  readonly remove = output<void>();
  readonly save = output<TaskChanges>();

  protected readonly editing = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ["", [Validators.required, Validators.maxLength(255)]],
    description: ["", [Validators.maxLength(5000)]],
  });

  protected startEdit(): void {
    const task = this.task();

    this.form.setValue({ title: task.title, description: task.description ?? "" });
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }

  protected submitEdit(): void {
    const { title, description } = this.form.getRawValue();

    if (!title.trim()) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit({ title, description: description.trim() ? description : null });
    this.editing.set(false);
  }
}
