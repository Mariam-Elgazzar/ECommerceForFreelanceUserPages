import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { Product, ProductParams } from '../../interfaces/product.interface';
import { Category, CategoryParams } from '../../interfaces/category.interface';
import { FormsModule } from '@angular/forms';
// import { Product } from '../../models/product';
// import { Category } from '../../models/category';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  loading = false;
  // Data
  products: Product[] = [];
  categoryId: string | null = null; // New: To store selected category ID
  filteredProducts: Product[] = [];
  errorMessage: string | null = null; // New: To display errors to the user

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalItems = 0;

  // Filters
  searchQuery = '';

  searchTerm = '';
  statusFilter = ''; // Default to 'both'
  categoryFilter = '';
  attributeFilters: Record<string, string[]> = {};
  sortColumn = 'name';
  sortDirection: 0 | 1 = 0;
  activeFilter: string | null = null;
  constructor(
    private productService: ApiService,
    private categoryService: ApiService,
    private route: ActivatedRoute, // Use RouterModule to access route parameters
    private router: Router
  ) {}
  ngOnInit(): void {
    const idParam = this.route.snapshot.queryParamMap.get('id');
    const id = idParam ? Number(idParam) : 0;
    this.loadCategories();
    this.loadProducts(id);
  }

  loadCategories(): void {
    this.loading = true;
    const params: CategoryParams = {
      pageIndex: 1,
      pageSize: 100,
    };

    this.categoryService.getAllCategories(params).subscribe({
      next: (response) => {
        this.categories = response.data.map((cat: any) => ({
          ...cat,
          imagePublicId: cat.imagePublicId ?? '',
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('errorMessageloading categories:', error);
        this.loading = false;
      },
    });
  }

  loadProducts(cat: number): void {
    this.loading = true;
    const params: ProductParams = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm,
      status: this.statusFilter,
      categoryId:
        cat != 0
          ? cat
          : this.categoryFilter
          ? Number(this.categoryFilter)
          : undefined,
      sortProp: this.sortColumn as any,
      sortDirection: this.sortDirection as any,
    };

    this.productService.getAllProducts(params).subscribe({
      next: (response) => {
        this.products = response.data.map((product: Product) => ({
          ...product,
          status: product.status ?? '', // Default to 'both' if not provided
          brand: product.brand ?? '',
          model: product.model ?? '',
          createdAt: product.createdAt ?? '',
          productMedia: product.productMedia ?? [],
        }));
        // this.filteredProducts = this.applyClientSideFilters(this.products);
        this.totalItems = response.totalCount;
        this.totalPages = Math.ceil(response.totalCount / this.pageSize);
        // this.extractAvailableAttributes();
        this.loading = false;
        console.log('Products loaded successfully', this.products);
        // Clear any previous errorMessagemessages
      },
      error: (error) => {
        console.error('errorMessageloading products:', error);
        this.loading = false;
      },
    });
  }

  // addToCart(product: Product): void {
  //   this.cartService.addToCart(product);
  // }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchQuery.trim() },
      });
      this.searchQuery = '';
    }
  }
}
