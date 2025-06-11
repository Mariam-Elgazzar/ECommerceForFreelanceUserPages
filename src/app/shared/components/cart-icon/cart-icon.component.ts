import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { CartService } from "../../../services/cart.service"

@Component({
  selector: "app-cart-icon",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a routerLink="/cart" class="btn btn-link nav-icon position-relative">
      <i class="fas fa-shopping-cart"></i>
      <span
        class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
        *ngIf="cartService.getItemCount() > 0">
        {{ cartService.getItemCount() }}
        <span class="visually-hidden">منتجات في السلة</span>
      </span>
    </a>
  `,
  styles: [
    `
    .nav-icon {
      color: #333;
      font-size: 1.2rem;
      padding: 0.5rem;
      transition: color 0.3s ease;

      &:hover {
        color: #ffc107;
      }
    }

    .badge {
      font-size: 0.7rem;
      min-width: 1.2rem;
      height: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.1); }
      100% { transform: translate(-50%, -50%) scale(1); }
    }
  `,
  ],
})
export class CartIconComponent {
  constructor(public cartService: CartService) {}
}
