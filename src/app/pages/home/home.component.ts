import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';
import { Category } from '../../models/category';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';

  constructor(
    private apiService: ApiService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    // Load products and categories
    Promise.all([
      this.apiService.getProducts().toPromise(),
      this.apiService.getCategories().toPromise()
    ]).then(([products, categories]) => {
      this.featuredProducts = products?.slice(0, 4) || [];
      this.categories = categories || [];
      this.loading = false;
    }).catch(error => {
      this.error = 'حدث خطأ في تحميل البيانات';
      this.loading = false;
      console.error('Error loading data:', error);
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
