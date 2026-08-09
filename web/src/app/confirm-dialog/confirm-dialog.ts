import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { ConfirmService } from './confirm-service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly confirm = inject(ConfirmService);

  constructor() {
    effect(() => {
      const element = this.dialog().nativeElement;
      const open = this.confirm.request() !== null;

      if (open && !element.open) element.showModal();
      if (!open && element.open) element.close();
    });
  }

  protected answer(confirmed: boolean): void {
    this.confirm.answer(confirmed);
  }
}
