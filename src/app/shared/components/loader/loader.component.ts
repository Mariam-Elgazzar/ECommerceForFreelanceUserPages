import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LoaderService } from "../../../services/loader.service"

@Component({
  selector: "app-loader",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-overlay" *ngIf="loaderService.isLoading()">
      <div class="spinner-container">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">جاري التحميل...</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .spinner-container {
      background-color: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .spinner-border {
      width: 3rem;
      height: 3rem;
    }
  `,
  ],
})
export class LoaderComponent {
  constructor(public loaderService: LoaderService) {}
}
