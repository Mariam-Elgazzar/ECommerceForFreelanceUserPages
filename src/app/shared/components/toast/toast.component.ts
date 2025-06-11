import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ToastService } from "../../../services/toast.service"

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3">
      <div
        *ngFor="let toast of toastService.activeToasts()"
        class="toast show"
        [ngClass]="getToastClass(toast.type)"
        role="alert"
        aria-live="assertive"
        aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">{{ getToastTitle(toast.type) }}</strong>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            (click)="toastService.remove(toast.id!)">
          </button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .toast-container {
      z-index: 1100;
    }

    .toast {
      min-width: 300px;
    }
  `,
  ],
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  getToastClass(type: string): string {
    switch (type) {
      case "success":
        return "bg-success text-white"
      case "error":
        return "bg-danger text-white"
      case "warning":
        return "bg-warning text-dark"
      case "info":
        return "bg-info text-dark"
      default:
        return ""
    }
  }

  getToastTitle(type: string): string {
    switch (type) {
      case "success":
        return "نجاح"
      case "error":
        return "خطأ"
      case "warning":
        return "تحذير"
      case "info":
        return "معلومات"
      default:
        return ""
    }
  }
}
