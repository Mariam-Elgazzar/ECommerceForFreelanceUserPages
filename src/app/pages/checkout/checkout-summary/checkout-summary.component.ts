import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { ApiService } from '../../../services/api.service';
import { Product } from '../../../interfaces/product.interface';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-checkout-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-summary.component.html',
  styleUrls: ['./checkout-summary.component.scss'],
})
export class CheckoutSummaryComponent {
  @Input() id: string | null = null; // Product ID to fetch details
  product!: Product;

  constructor(private productService: ApiService) {}

  ngOnInit() {
    if (!this.id) {
      console.error('Product ID is not provided');
      return;
    }
    this.productService.readProductById(Number(this.id)).subscribe(
      (response) => {
        this.product = response;
      },
      catchError((error) => {
        console.error('Error loading product:', error);
        throw error;
      })
    );
  }
}
