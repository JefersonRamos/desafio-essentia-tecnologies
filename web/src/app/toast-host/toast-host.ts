import { Component, inject } from '@angular/core';
import { ToastService, type Toast } from './toast-service';

@Component({
  selector: 'app-toast-host',
  imports: [],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.css',
})
export class ToastHost {
  protected readonly toasts = inject(ToastService);

  protected run(toast: Toast): void {
    this.toasts.run(toast);
  }

  protected dismiss(toast: Toast): void {
    this.toasts.dismiss(toast.id);
  }
}
