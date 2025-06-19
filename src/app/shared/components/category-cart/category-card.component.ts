import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Category } from '../../../interfaces/category.interface';
// import { Category } from "../../../models/category"

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="category-card">
      <div class="card h-100 border-0 shadow-sm">
        <div class="card-img-wrapper">
          <img
            [src]="category.imageURL"
            [alt]="category.name"
            class="card-img-top"
          />
          <div class="card-img-overlay d-flex align-items-end">
            <div class="category-info">
              <h5 class="card-title text-white mb-1">{{ category.name }}</h5>
              <!-- <p class="card-text text-white-50 small mb-0">{{ category. }} منتج</p> -->
            </div>
          </div>
        </div>

        <div class="card-body">
          <p class="card-text text-muted">{{ category.description }}</p>
          <div class="d-grid">
            <a
              [routerLink]="['/products']"
              [queryParams]="{ id: category.id }"
              class="btn btn-warning"
            >
              عرض المنتجات
              <i class="fas fa-arrow-left ms-2"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .category-card {
        transition: transform 0.3s ease;

        &:hover {
          transform: translateY(-10px);
        }

        .card {
          overflow: hidden;
          border-radius: 15px;
        }

        .card-img-wrapper {
          position: relative;
          overflow: hidden;

          .card-img-top {
            height: 250px;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .card-img-overlay {
            background: linear-gradient(
              to top,
              rgba(0, 0, 0, 0.7),
              transparent
            );
            padding: 1.5rem;
          }

          &:hover .card-img-top {
            transform: scale(1.1);
          }
        }

        .category-info {
          .card-title {
            font-size: 1.25rem;
            font-weight: 600;
          }
        }

        .card-body {
          padding: 1.5rem;
        }
      }
    `,
  ],
})
export class CategoryCardComponent {
  @Input({ required: true }) category!: Category;
}
