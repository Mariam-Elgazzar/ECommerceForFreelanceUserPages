import { Injectable, signal } from "@angular/core"

export interface Toast {
  id?: number
  message: string
  type: "success" | "error" | "info" | "warning"
  timeout?: number
}

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private toasts = signal<Toast[]>([])
  readonly activeToasts = this.toasts.asReadonly()

  private counter = 0

  show(toast: Toast): void {
    const id = ++this.counter
    const timeout = toast.timeout || 3000

    // Add toast with ID
    this.toasts.update((toasts) => [...toasts, { ...toast, id }])

    // Auto-remove after timeout
    setTimeout(() => {
      this.remove(id)
    }, timeout)
  }

  remove(id: number): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id))
  }
}
