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
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { Product, ProductParams } from '../../interfaces/product.interface';
import { Category, CategoryParams } from '../../interfaces/category.interface';
import { HighlightPipe } from '../../pipes/highlight.pipe';

interface AttributeFilter {
  key: string;
  values: { value: string; count: number }[];
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
  pageSize = 10;
  totalPages = 1;
  totalItems = 0;

  // Filters
  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';
  brandFilter = ''; // Added
  modelFilter = ''; // Added
  quantityFilter: number | null = null; // Added
  attributeFilters: Record<string, string[]> = {};
  sortColumn = 'name';
  sortDirection: 0 | 1 = 0;
  activeFilter: string | null = null;
  sortBy: string = 'name';

  // Filter panel state
  showFilters = false;
  activeDropdown: string | null = null;

  // Filter search terms
  statusSearchTerm = '';
  categorySearchTerm = '';
  attributeSearchTerms: Record<string, string> = {};

  // Available attributes for filtering
  availableAttributes: AttributeFilter[] = [];

  // Modal state
  isModalOpen = false;
  isDetailsModalOpen = false;
  editingProduct: Product | null = null;
  selectedProduct: Product | null = null;
  deleteConfirm: { isOpen: boolean; productId: number | null } = {
    isOpen: false,
    productId: null,
  };

  // Memoization caches
  private categoryCache: Category[] | null = null;
  private statusCache: string[] | null = null;

  private searchSubject = new Subject<string>();
  private brandSubject = new Subject<string>();
  private modelSubject = new Subject<string>();
  private quantitySubject = new Subject<number | null>();
  private searchSubscription: Subscription;
  private brandSubscription: Subscription;
  private modelSubscription: Subscription;
  private quantitySubscription: Subscription;

  constructor(
    private productService: ApiService,
    private categoryService: ApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term: string) => {
        this.onSearch(term);
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
    this.quantitySubscription = this.quantitySubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((quantity: number | null) => {
        this.onQuantityFilterChange(quantity);
      });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.categoryId = params['id'] ? Number(params['id']) : null;
      this.loadCategories();
      this.loadProducts(this.categoryId || 0);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
    this.brandSubscription.unsubscribe();
    this.modelSubscription.unsubscribe();
    this.quantitySubscription.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.searchable-select')) {
      this.activeDropdown = null;
    }
  }

  // Filter panel methods
  toggleFiltersPanel(): void {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) {
      this.activeDropdown = null;
    } else {
      setTimeout(() => {
        const firstFilter = document.querySelector(
          '.collapse.show input'
        ) as HTMLElement;
        firstFilter?.focus();
      }, 0);
    }
  }

  closeFiltersPanel(): void {
    this.showFilters = false;
    this.activeDropdown = null;
  }

  toggleDropdown(dropdown: string): void {
    this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
  }

  selectStatus(status: string): void {
    this.onStatusFilterChange(status);
    this.activeDropdown = null;
  }

  selectCategory(categoryId: string): void {
    this.onCategoryFilterChange(categoryId);
    this.activeDropdown = null;
  }

  applyFilters(): void {
    this.closeFiltersPanel();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.statusFilter) count++;
    if (this.categoryFilter) count++;
    if (this.brandFilter) count++;
    if (this.modelFilter) count++;
    if (this.quantityFilter !== null) count++;
    count += Object.values(this.attributeFilters).reduce(
      (sum, values) => sum + values.length,
      0
    );
    return count;
  }

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
  loadProducts(cat: number): void {
    this.loading = true;
    this.errorMessage = null;
    const params: ProductParams = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      status: this.statusFilter || undefined,
      categoryId:
        cat !== 0
          ? cat
          : this.categoryFilter
          ? Number(this.categoryFilter)
          : undefined,
      brand: this.brandFilter || undefined,
      model: this.modelFilter || undefined,
      quantity: this.quantityFilter !== null ? this.quantityFilter : undefined,
      sortDirection: this.sortDirection,
    };

    this.productService.getAllProducts(params).subscribe({
      next: (response) => {
        this.products = response.data.map((product: any) => ({
          ...product,
          status: product.status ?? '',
          brand: product.brand ?? '',
          model: product.model ?? '',
          quantity: product.quantity ?? 0,
          createdAt: product.createdAt ?? '',
          productMedia: product.productMedia ?? [],
        }));
        this.filteredProducts = this.products; // Rely on server-side filtering
        this.totalItems = response.totalCount;
        this.totalPages = Math.ceil(response.totalCount / this.pageSize);
        this.extractAvailableAttributes();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage = 'فشل في تحميل المنتجات. الرجاء المحاولة لاحقاً.';
        this.loading = false;
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

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.loadProducts(0);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch('');
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    switch (sortBy) {
      case 'name':
        this.sortColumn = 'name';
        this.sortDirection = 0;
        break;
      case 'price-low':
        this.sortColumn = 'price';
        this.sortDirection = 0;
        break;
      case 'price-high':
        this.sortColumn = 'price';
        this.sortDirection = 1;
        break;
    }
    this.currentPage = 1;
    this.loadProducts(0);
  }

  onStatusSearchChange(term: string): void {
    this.statusSearchTerm = term;
    this.toggleDropdown('status');
  }

  onBrandFilterChange(brand: string): void {
    this.brandFilter = brand;
    this.currentPage = 1;
    this.loadProducts(0);
  }

  onModelFilterChange(model: string): void {
    this.modelFilter = model;
    this.currentPage = 1;
    this.loadProducts(0);
  }

  onQuantityFilterChange(quantity: number | null): void {
    this.quantityFilter = quantity;
    this.currentPage = 1;
    this.loadProducts(0);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts(0);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.loadProducts(0);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadProducts(0);
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

  onRowClick(product: Product): void {
    this.viewDetails(product);
  }

  toggleFilter(filterType: string): void {
    this.activeFilter = this.activeFilter === filterType ? null : filterType;
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.activeFilter = null;
    this.currentPage = 1;
    this.loadProducts(0);
  }

  getFilteredStatuses(): string[] {
    if (this.statusCache && this.statusSearchTerm === '') {
      return this.statusCache;
    }
    const allStatuses = [...new Set(this.products.map((p) => p.status))];
    const filtered = this.statusSearchTerm
      ? allStatuses.filter((status) =>
          status.toLowerCase().includes(this.statusSearchTerm.toLowerCase())
        )
      : allStatuses;
    if (this.statusSearchTerm === '') {
      this.statusCache = filtered;
    }
    return filtered;
  }

  getStatusCount(status: string): number {
    return this.products.filter((p) => p.status === status).length;
  }

  getTotalProductsCount(): number {
    return this.products.length;
  }

  get paginatedProducts(): Product[] {
    return this.filteredProducts; // Server-side pagination
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'الايجار':
        return 'الايجار';
      case 'البيع':
        return 'البيع';
      case 'الاتنين':
        return 'الاتنين';
      default:
        return 'status-default';
    }
  }

  onCategoryFilterChange(category: string): void {
    this.categoryFilter = category;
    this.activeFilter = null;
    this.currentPage = 1;
    this.loadProducts(category ? Number(category) : 0);
  }

  getFilteredCategories(): Category[] {
    if (this.categoryCache && this.categorySearchTerm === '') {
      return this.categoryCache;
    }
    const filtered = this.categories.filter((category) =>
      category.name
        ?.toLowerCase()
        .includes(this.categorySearchTerm.toLowerCase())
    );
    if (this.categorySearchTerm === '') {
      this.categoryCache = filtered;
    }
    return filtered;
  }

  getCategoryCount(categoryId: number): number {
    return this.products.filter((p) => p.categoryId === categoryId).length;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(
      (c) => c.id.toString() === categoryId
    );
    return category?.name || 'غير محدد';
  }

  getFilteredAttributeValues(
    attribute: AttributeFilter
  ): { value: string; count: number }[] {
    const searchTerm = this.attributeSearchTerms[attribute.key] || '';
    if (!searchTerm) return attribute.values;
    return attribute.values.filter((v) =>
      v.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  toggleAttributeValue(key: string, value: string): void {
    if (!this.attributeFilters[key]) {
      this.attributeFilters[key] = [];
    }
    const index = this.attributeFilters[key].indexOf(value);
    if (index > -1) {
      this.attributeFilters[key].splice(index, 1);
      if (this.attributeFilters[key].length === 0) {
        delete this.attributeFilters[key];
      }
    } else {
      this.attributeFilters[key].push(value);
    }
    this.currentPage = 1;
    this.loadProducts(0);
  }

  isAttributeValueSelected(key: string, value: string): boolean {
    return this.attributeFilters[key]?.includes(value) || false;
  }

  hasActiveAttributeFilters(): boolean {
    return Object.keys(this.attributeFilters).length > 0;
  }

  getActiveAttributeFiltersText(): string {
    const count = Object.values(this.attributeFilters).reduce(
      (sum, values) => sum + values.length,
      0
    );
    return `${count} فلتر نشط`;
  }

  getActiveAttributeFilters(): { key: string; values: string[] }[] {
    return Object.entries(this.attributeFilters).map(([key, values]) => ({
      key,
      values,
    }));
  }

  clearAttributeFilter(key: string): void {
    delete this.attributeFilters[key];
    this.currentPage = 1;
    this.loadProducts(0);
  }

  clearAllAttributeFilters(): void {
    this.attributeFilters = {};
    this.currentPage = 1;
    this.loadProducts(0);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.statusFilter ||
      this.categoryFilter ||
      this.brandFilter ||
      this.modelFilter ||
      this.quantityFilter !== null ||
      this.hasActiveAttributeFilters()
    );
  }

  clearAllFilters(): void {
    this.statusFilter = '';
    this.categoryFilter = '';
    this.brandFilter = '';
    this.modelFilter = '';
    this.quantityFilter = null;
    this.attributeFilters = {};
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadProducts(0);
  }

  openAddModal(): void {
    this.editingProduct = null;
    this.isModalOpen = true;
    this.errorMessage = null;
  }

  openEditModal(product: Product): void {
    this.editingProduct = { ...product };
    this.isModalOpen = true;
    this.errorMessage = null;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingProduct = null;
    this.errorMessage = null;
  }

  saveProduct(productData: any): void {
    this.errorMessage = null;
    const formattedAttributes = JSON.stringify(
      productData.additionalAttributes || {}
    );
  }

  openDeleteConfirm(product: Product): void {
    this.deleteConfirm = {
      isOpen: true,
      productId: product.id,
    };
  }

  closeDeleteConfirm(): void {
    this.deleteConfirm = {
      isOpen: false,
      productId: null,
    };
  }

  viewDetails(product: Product): void {
    this.selectedProduct = { ...product };
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedProduct = null;
  }

  openEditModalFromDetails(product: Product): void {
    this.editingProduct = { ...product };
    this.isModalOpen = true;
  }

  openDeleteConfirmFromDetails(product: Product): void {
    this.deleteConfirm = {
      isOpen: true,
      productId: product.id,
    };
  }

  retryLoad(): void {
    this.errorMessage = null;
    this.loadProducts(this.categoryId || 0);
  }

  clearError(): void {
    this.errorMessage = null;
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}
