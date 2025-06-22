import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';
import { Subject, takeUntil, catchError, of, forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Category } from '../../interfaces/category.interface';
import {
  Product,
  ProductMedia,
  ProductParams,
  PaginatedResponse,
  SortProp,
  SortDirection,
  statusEnum,
} from '../../interfaces/product.interface';
import { environment } from '../../../enviroments/enviroment';
import { query } from '@angular/animations';
@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() categories: Category[] = [];

  product: Product | null = null;
  relatedProducts: Product[] = [];
  loading = false;
  imageLoading = true;
  error: string | null = null;
  showImageZoom = false;
  zoomedImageUrl = '';
  quantity = 1;
  selectedMediaIndex = -1;
  isMobile = false;
  isTablet = false;
  activeMediaTab: 'images' | 'videos' | 'documents' = 'images';

  private destroy$ = new Subject<void>();
  private platformId: Object;
  private isBrowser: boolean;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private meta: Meta,
    private title: Title,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.platformId = platformId;
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.checkScreenSize();
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      window.addEventListener('resize', this.checkScreenSize.bind(this));
      window.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : 0;
    if (id) {
      this.loadProductAndRelated(id);
    } else {
      this.error = 'معرف المنتج غير صالح';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.isBrowser) {
      window.removeEventListener('resize', this.checkScreenSize.bind(this));
      window.removeEventListener('keydown', this.handleKeydown.bind(this));
      document.body.style.overflow = 'unset';
    }
  }

  private checkScreenSize(): void {
    if (this.isBrowser) {
      this.isMobile = window.innerWidth < 768;
      this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (this.showImageZoom && event.key === 'Escape') {
      this.closeImageZoom();
    }
  }

  private loadProductAndRelated(id: number): void {
    this.loading = true;
    this.error = null;

    const product$ = this.apiService.readProductById(id).pipe(
      catchError((error) => {
        console.error('Error loading product:', error);
        this.error = 'فشل في تحميل المنتج';
        return of(null);
      })
    );

    // Fetch related products based on categoryId (assuming it’s available after product fetch)
    const relatedParams: ProductParams = {
      pageIndex: 0,
      pageSize: 4,
      sortProp: SortProp.CreatedAt,
      sortDirection: SortDirection.Descending,
    };

    // Use forkJoin to fetch product and related products in parallel
    forkJoin([product$, of(null)])
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error in combined fetch:', error);
          this.error = 'فشل في تحميل البيانات';
          return of([null, null]);
        })
      )
      .subscribe(([product, _]) => {
        if (product) {
          this.product = {
            ...product,
            status: product.status ?? '', // Default to 'both' if status is not set
            brand: product.brand ?? '',
            model: product.model ?? '',

            createdAt: product.createdAt ?? '',
            productMedia: product.productMedia ?? [],
            quantity: product.quantity ?? 0,
            mainImageURL: product.mainImageURL ?? '',
            categoryName: product.categoryName ?? '',
            additionalAttributes: product.additionalAttributes
              ? typeof product.additionalAttributes === 'string'
                ? JSON.parse(product.additionalAttributes)
                : product.additionalAttributes
              : {},
          };
          const firstVideoIndex =
            this.getVideos().length > 0
              ? this.getAllMedia().findIndex(
                  (media) => media.mediaType === 'video'
                )
              : -1;
          this.selectedMediaIndex =
            firstVideoIndex !== -1 ? firstVideoIndex : -1;

          // Fetch related products after getting product’s categoryId
          if (product.categoryId) {
            relatedParams.categoryId = product.categoryId;
            // this.apiService
            //   .getAllProducts?.(relatedParams)
            //   .pipe(
            //     takeUntil(this.destroy$),
            //     catchError((error) => {
            //       console.error('Error loading related products:', error);
            //       return of({
            //         data: [],
            //         pageSize: 0,
            //         pageIndex: 0,
            //         totalCount: 0,
            //       } as PaginatedResponse<Product>);
            //     })
            //   )
            //   .subscribe((response) => {
            //     this.relatedProducts = response.data.filter((p) => p.id !== id); // Exclude current product
            //     this.setupSEO();
            //     this.addStructuredData();
            //     this.loading = false;
            //   });
          } else {
            this.setupSEO();
            this.addStructuredData();
            this.loading = false;
          }
        } else {
          this.loading = false;
        }
      });
  }

  private setupSEO(): void {
    if (!this.product || !this.isBrowser) return;

    this.title.setTitle(`${this.product.name} | متجرنا الإلكتروني`);

    this.meta.updateTag({
      name: 'description',
      content:
        this.product.description ||
        `اشتري ${this.product.name} - ${this.product.brand} ${this.product.model}`,
    });

    this.meta.updateTag({
      name: 'keywords',
      content: [
        this.product.name,
        this.product.brand,
        this.product.model,
        this.product.categoryName,
      ]
        .filter(Boolean)
        .join(', '),
    });

    this.meta.updateTag({ property: 'og:title', content: this.product.name });
    this.meta.updateTag({
      property: 'og:description',
      content: this.product.description || '',
    });
    this.meta.updateTag({
      property: 'og:image',
      content: this.product.mainImageURL || '',
    });
    this.meta.updateTag({ property: 'og:type', content: 'product' });
    this.meta.updateTag({ property: 'og:url', content: window.location.href });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: this.product.name });
    this.meta.updateTag({
      name: 'twitter:description',
      content: this.product.description || '',
    });
    this.meta.updateTag({
      name: 'twitter:image',
      content: this.product.mainImageURL || '',
    });
  }

  private addStructuredData(): void {
    if (!this.product || !this.isBrowser) return;

    const structuredData = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: this.product.name,
      description: this.product.description,
      brand: {
        '@type': 'Brand',
        name: this.product.brand,
      },
      model: this.product.model,
      category: this.product.categoryName,
      image: this.product.mainImageURL,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'SAR',
        availability:
          this.product.status === '' || this.product.status === ''
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
      },
    };

    const existingScript = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  selectMedia(index: number): void {
    this.selectedMediaIndex = index;
    this.imageLoading = this.getCurrentMediaType() === 'image';
  }

  openImageZoom(imageUrl?: string): void {
    if (imageUrl && this.isBrowser) {
      this.zoomedImageUrl = imageUrl;
      this.showImageZoom = true;
      document.body.style.overflow = 'hidden';
    }
  }

  closeImageZoom(): void {
    this.showImageZoom = false;
    this.zoomedImageUrl = '';
    if (this.isBrowser) {
      document.body.style.overflow = 'unset';
    }
  }

  onImageLoad(): void {
    this.imageLoading = false;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'p1.png';
  }

  copyToClipboard(text: string): void {
    if (this.isBrowser && navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log('تم نسخ الرابط');
        })
        .catch((err) => {
          console.error('فشل في نسخ الرابط:', err);
        });
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((cat) => cat.id === categoryId);
    return category?.name || 'غير محدد';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getAdditionalAttributes(): { key: string; value: string }[] {
    if (!this.product?.additionalAttributes) return [];
    try {
      const attrs =
        typeof this.product.additionalAttributes === 'string'
          ? JSON.parse(this.product.additionalAttributes)
          : this.product.additionalAttributes;
      return Object.entries(attrs).map(([key, value]) => ({
        key,
        value: value as string,
      }));
    } catch {
      return [];
    }
  }

  getAllMedia(): ProductMedia[] {
    return this.product?.productMedia || [];
  }

  setActiveMediaTab(tab: 'images' | 'videos' | 'documents'): void {
    this.activeMediaTab = tab;
    // Reset selection when switching tabs
    this.selectedMediaIndex = -1;
  }

  selectVideoMedia(index: number): void {
    const videos = this.getVideos();
    if (videos[index]) {
      this.selectedMediaIndex = index;
      this.imageLoading = false;
    }
  }

  selectPdfMedia(index: number): void {
    const pdfs = this.getPdfs();
    if (pdfs[index]) {
      this.selectedMediaIndex = index;
      this.imageLoading = false;
    }
  }

  getImages(): ProductMedia[] {
    return this.getAllMedia().filter((media) => media.mediaType === 'image');
  }

  getVideos(): ProductMedia[] {
    return this.getAllMedia().filter((media) => media.mediaType === 'video');
  }

  getPdfs(): ProductMedia[] {
    return this.getAllMedia().filter((media) => media.mediaType === 'pdf');
  }
  getCurrentMediaType(): string {
    if (this.selectedMediaIndex === -1) return 'image';

    let mediaArray: ProductMedia[] = [];

    switch (this.activeMediaTab) {
      case 'images':
        mediaArray = this.getImages();
        break;
      case 'videos':
        mediaArray = this.getVideos();
        break;
      case 'documents':
        mediaArray = this.getPdfs();
        break;
    }

    return mediaArray[this.selectedMediaIndex]?.mediaType || 'image';
  }
  getCurrentMediaUrl(): string {
    if (this.selectedMediaIndex === -1) {
      return (
        this.product?.mainImageURL || '/placeholder.svg?height=600&width=600'
      );
    }

    let mediaArray: ProductMedia[] = [];

    switch (this.activeMediaTab) {
      case 'images':
        mediaArray = this.getImages();
        break;
      case 'videos':
        mediaArray = this.getVideos();
        break;
      case 'documents':
        mediaArray = this.getPdfs();
        break;
    }

    return (
      mediaArray[this.selectedMediaIndex]?.mediaURL ||
      this.product?.mainImageURL ||
      '/placeholder.svg?height=600&width=600'
    );
  }
  getPdfUrl(mediaUrl: string): string {
    return `${environment.baseUrl}${mediaUrl}`;
  }

  reloadProduct(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : 0;
    if (id) {
      this.loadProductAndRelated(id);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
  confirm(id: number, status: string): void {
    if (this.product) {
      console.log(`Confirming lease for product: ${this.product.name}`);
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
}
