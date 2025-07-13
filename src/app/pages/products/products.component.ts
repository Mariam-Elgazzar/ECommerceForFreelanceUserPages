import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import {
  Product,
  ProductParams,
  statusEnum,
} from '../../interfaces/product.interface';
import { Category, CategoryParams } from '../../interfaces/category.interface';
import { HighlightPipe } from '../../pipes/highlight.pipe';
import { Brand, BrandService } from '../../services/brand.service';

interface AttributeFilter {
  key: string;
  values: { value: string; count: number }[];
}

interface Status {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HighlightPipe],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  // Data
  products: Product[] = [];
  categories: Category[] = [];
  categoryId: number | null = null;
  filteredProducts: Product[] = [];
  loading = false;
  errorMessage: string | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;
  totalItems = 0;

  // Filters (aligned with original HTML)
  categoryFilter = '';
  searchTerm = '';
  brandFilter = '';
  statusFilter = '';
  modelFilter = '';
  quantityFilter: number | null = null;
  attributeFilters: Record<string, string[]> = {};
  sortColumn = 'name';
  sortDirection: 0 | 1 = 0;
  sortBy: string = 'name';

  // Filter search terms
  statusSearchTerm = '';
  categorySearchTerm = '';
  attributeSearchTerms: Record<string, string> = {};

  // Available attributes and statuses
  availableAttributes: AttributeFilter[] = [];
  statuses: Status[] = [
    { value: '', label: 'الكل', icon: 'fa-globe' },
    { value: statusEnum.purchase, label: 'شراء', icon: 'fa-shopping-cart' },
    { value: statusEnum.lease, label: 'إيجار', icon: 'fa-key' },
  ];

  // Memoization caches
  private categoryCache: Category[] | null = null;
  private statusCache: string[] | null = null;

  // RxJS subjects for debouncing
  private searchSubject = new Subject<string>();
  private brandSubject = new Subject<string>();
  private modelSubject = new Subject<string>();
  private statusSubject = new Subject<string>();
  private quantitySubject = new Subject<number | null>();
  private searchSubscription: Subscription;
  private brandSubscription: Subscription;
  private modelSubscription: Subscription;
  private statusSubscription: Subscription;
  brands!: Brand[];
  error!: string;

  constructor(
    private productService: ApiService,
    private categoryService: ApiService,
    private brandService: BrandService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term: string) => {
        this.onSearchChange(term);
      });
    this.brandSubscription = this.brandSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((brand: string) => {
        this.onBrandFilterChange(brand);
      });
    this.modelSubscription = this.modelSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((model: string) => {
        this.onModelFilterChange(model);
      });
    this.statusSubscription = this.statusSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((status: string) => {
        this.onStatusFilterChange(status);
      });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.categoryId = params['id'] ? Number(params['id']) : null;
      this.searchTerm = params['search'] || '';
      this.categoryFilter = params['id'] ? params['id'] : '';
      this.brandFilter = params['brand'] || '';
      this.statusFilter = params['status'] || '';
      this.modelFilter = params['model'] || '';
      this.pageSize = 12;
      this.loadBrands();
      this.loadCategories();
      this.loadProducts(
        params['id']
          ? {
              categoryId: Number(params['id']),
              pageIndex: 1,
              pageSize: this.pageSize,
            }
          : undefined
      );
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
    this.brandSubscription.unsubscribe();
    this.modelSubscription.unsubscribe();
  }

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: Event): void {
  //   const target = event.target as HTMLElement;
  //   if (!target.closest('.searchable-select')) {
  //     this.activeDropdown = null;
  //   }
  // }
  private loadBrands(): void {
    this.brandService.getAllBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
      },
      error: (err) => {
        this.error = 'Failed to load brands. Please try again later.';
        console.error('Error fetching brands:', err);
      },
    });
  }
  // Filter methods (aligned with original HTML)
  onCategoryFilterChange(category: string): void {
    this.categoryFilter = category;
    this.currentPage = 1;
    if (category) {
      this.loadProducts({
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
        categoryId: Number(category),
        search: this.searchTerm || '',
        status: this.statusFilter || '',
        brand: this.brandFilter || '',
      });
    } else {
      this.loadProducts({
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
      });
    }
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
    this.searchTerm = term;
    // this.categoryFilter = '';
    // this.brandFilter = '';

    this.currentPage = 1;
    this.loadProducts({
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
      search: term,
      status: this.statusFilter || '',
      categoryId:
        this.categoryFilter && this.categoryFilter !== '0'
          ? Number(this.categoryFilter)
          : undefined,
      brand: this.brandFilter || '',
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.loadProducts();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch('');
  }

  onBrandFilterChange(brand: string): void {
    this.brandFilter = brand;
    this.currentPage = 1;

    this.loadProducts({
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
      brand: brand || '',
      search: this.searchTerm || '',
      status: this.statusFilter || '',
      categoryId:
        this.categoryFilter && this.categoryFilter !== '0'
          ? Number(this.categoryFilter)
          : 0,
    });
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.loadProducts({
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm || '',
      status: status,
      categoryId:
        this.categoryFilter && this.categoryFilter !== '0'
          ? Number(this.categoryFilter)
          : undefined,
      brand: this.brandFilter || '',
    });
  }

  onModelFilterChange(model: string): void {
    this.modelFilter = model;
    this.currentPage = 1;
    this.loadProducts();
  }

  // Dismiss function to reset all filters and search
  dismiss(): void {
    this.categoryFilter = '';
    this.brandFilter = '';
    this.statusFilter = '';
    this.searchTerm = '';
    this.modelFilter = '';
    this.quantityFilter = null;
    this.attributeFilters = {};
    this.currentPage = 1;
    this.loadProducts();
  }

  // Other methods (unchanged)
  loadCategories(): void {
    this.loading = true;
    this.errorMessage = null;
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
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.errorMessage = 'فشل في تحميل الفئات. الرجاء المحاولة لاحقاً.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadProducts(productParams?: ProductParams): void {
    this.loading = true;
    this.errorMessage = null;
    const params: ProductParams = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm || '',
      status: this.statusFilter || '',
      categoryId:
        productParams && productParams.categoryId !== 0
          ? productParams.categoryId
          : this.categoryFilter
          ? Number(this.categoryFilter)
          : undefined,
      brand: this.brandFilter || '',
      model: this.modelFilter || '',
    };

    this.productService.getAllProducts(params).subscribe({
      next: (response) => {
        this.products = response.data.map((product: Product) => ({
          ...product,
          status: product.status ?? '',
          brand: product.brand ?? '',
          model: product.model ?? '',
          quantity: product.quantity ?? 0,
          createdAt: product.createdAt ?? '',
          productMedia: product.productMedia ?? [],
        }));
        this.filteredProducts = this.products;
        this.totalItems = response.totalCount;
        this.totalPages = Math.ceil(response.totalCount / this.pageSize);
        this.extractAvailableAttributes();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        this.filteredProducts = [];
        this.totalItems = 0;
        this.cdr.markForCheck();
      },
    });
  }

  private extractAvailableAttributes(): void {
    const attributesMap = new Map<string, Map<string, number>>();

    this.products.forEach((product) => {
      if (product.additionalAttributes) {
        let attributes: Record<string, string>;
        try {
          attributes =
            typeof product.additionalAttributes === 'string'
              ? JSON.parse(product.additionalAttributes)
              : product.additionalAttributes;
        } catch (error) {
          console.error('Error parsing additional attributes:', error);
          return;
        }

        Object.entries(attributes).forEach(([key, value]) => {
          if (!attributesMap.has(key)) {
            attributesMap.set(key, new Map());
            if (!this.attributeSearchTerms[key]) {
              this.attributeSearchTerms[key] = '';
            }
          }
          const valueMap = attributesMap.get(key)!;
          const stringValue = String(value);
          valueMap.set(stringValue, (valueMap.get(stringValue) || 0) + 1);
        });
      }
    });

    this.availableAttributes = Array.from(attributesMap.entries())
      .map(([key, valueMap]) => ({
        key,
        values: Array.from(valueMap.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => a.value.localeCompare(b.value)),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
    this.cdr.markForCheck();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadProducts();
  }

  getPaginationRange(): number[] {
    const maxPages = 5;
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxPages - 1);

    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  showEllipsisEnd(): boolean {
    return this.totalPages > 5 && this.currentPage < this.totalPages - 2;
  }

  addToCart(product: Product): void {
    console.log('Product added to cart:', product);
  }

  getTotalProductsCount(): number {
    return this.products.length;
  }

  get paginatedProducts(): Product[] {
    return this.filteredProducts;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case statusEnum.lease:
        return 'إيجار وشراء';
      case statusEnum.purchase:
        return 'الشراء';
      case statusEnum.both:
        return 'الايجار والشراء';
      default:
        return 'status-default';
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/product-fallback.png';
  }

  hasActiveAttributeFilters(): boolean {
    return Object.keys(this.attributeFilters).length > 0;
  }

  retryLoad(): void {
    this.errorMessage = null;
    this.loadProducts(
      this.categoryId
        ? {
            pageIndex: this.currentPage,
            pageSize: this.pageSize,
            categoryId: this.categoryId,
            search: this.searchTerm || '',
            status: this.statusFilter || '',
            brand: this.brandFilter || '',
          }
        : undefined
    );
  }

  clearError(): void {
    this.errorMessage = null;
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
  confirm(id: number, status: string): void {
    if (id) {
      this.router.navigate(['/checkout'], {
        queryParams: { productId: id, status: status },
      });
    } else {
      console.error('No product selected for lease confirmation');
      //  {
      //   queryParams: { productId: this.product.id },
      // }
    }
  }
  private activeDropdown: string | null = null;
}
