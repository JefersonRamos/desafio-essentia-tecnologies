import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  action: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly pending = signal<ConfirmRequest | null>(null);
  private settle: ((confirmed: boolean) => void) | null = null;

  readonly request = this.pending.asReadonly();

  ask(request: ConfirmRequest): Promise<boolean> {
    this.resolve(false);
    this.pending.set(request);

    return new Promise<boolean>((resolve) => {
      this.settle = resolve;
    });
  }

  answer(confirmed: boolean): void {
    this.pending.set(null);
    this.resolve(confirmed);
  }

  private resolve(confirmed: boolean): void {
    const settle = this.settle;

    this.settle = null;
    settle?.(confirmed);
  }
}
