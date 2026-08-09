import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Navigation } from '../navigation/navigation';
import { TaskCard } from '../task-card/task-card';
import { TaskStore } from '../tasks/task-store';

@Component({
  selector: 'app-board',
  imports: [Navigation, TaskCard, ReactiveFormsModule],
  templateUrl: './board.html',
})
export class Board {
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

    this.store.create({ title });
    this.form.reset();
  }
}
