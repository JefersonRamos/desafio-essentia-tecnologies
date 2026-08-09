import { Injectable, signal } from '@angular/core';

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface Toast {
  readonly id: number;
  readonly message: string;
  readonly duration: number;
  readonly action?: ToastAction;
}

export interface ToastOptions {
  action?: ToastAction;
  onExpire?: () => void;
  duration?: number;
}

const DEFAULT_DURATION = 6000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly items = signal<Toast[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private sequence = 0;

  readonly toasts = this.items.asReadonly();

  show(message: string, options: ToastOptions = {}): void {
    const id = ++this.sequence;
    const duration = options.duration ?? DEFAULT_DURATION;

    this.items.update((toasts) => [...toasts, { id, message, duration, action: options.action }]);

    this.timers.set(
      id,
      setTimeout(() => {
        this.dismiss(id);
        options.onExpire?.();
      }, duration),
    );
  }

  run(toast: Toast): void {
    this.dismiss(toast.id);
    toast.action?.run();
  }

  dismiss(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this.items.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
