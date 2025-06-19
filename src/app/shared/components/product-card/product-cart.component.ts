import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
// import { Product } from "../../../models/product"
import { CartService } from '../../../services/cart.service';
import { Product } from '../../../interfaces/product.interface';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card h-100 product-card">
      <img
        [src]="product.mainImageURL"
        [alt]="product.name"
        class="card-img-top"
      />
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">{{ product.name }}</h5>
        <p class="card-text text-muted small flex-grow-1">
          {{ product.description | slice : 0 : 100 }}...
        </p>
        <div class="mt-auto">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <small class="text-muted">{{ product.categoryName }}</small>
          </div>
          <div class="d-grid gap-2">
            <button class="btn btn-warning">إضافة للسلة</button>
            <a
              [routerLink]="['/products', product.id]"
              class="btn btn-outline-secondary btn-sm"
            >
              عرض التفاصيل
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .product-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: none;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .card-img-top {
          height: 200px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        &:hover .card-img-top {
          transform: scale(1.05);
        }

        .card-body {
          padding: 1.25rem;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .btn {
          transition: all 0.3s ease;
        }
      }
    `,
  ],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  constructor(private cartService: CartService) {}

  // addToCart(): void {
  //   this.cartService.addToCart(this.product)
  // }
}
