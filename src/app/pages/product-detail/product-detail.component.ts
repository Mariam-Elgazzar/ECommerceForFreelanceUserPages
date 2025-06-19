import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Category } from '../../interfaces/category.interface';
import { Product } from '../../interfaces/product.interface';
import { environment } from '../../../enviroments/enviroment';
// import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  @Input() isOpen = false;
  @Input() categories: Category[] = [];

  product: Product | null = null;
  loading: boolean = false;
  showImageZoom = false;
  zoomedImageUrl = '';
  quantity: number = 1;
  selectedMediaIndex: number = -1;

  relatedProducts: any[] = [];

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loading = true;
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : 0;
    this.apiService.readProductById(id).subscribe({
      next: (product) => {
        this.product = {
          ...product,
          status: product.status ?? '',
          brand: product.brand ?? '',
          model: product.model ?? '',
          createdAt: product.createdAt ?? '',
          productMedia: product.productMedia ?? [],
          quantity: product.quantity ?? 0,
        };
        const firstVideoIndex =
          this.getVideos().length > 0
            ? this.getAllMedia().findIndex(
                (media) => media.mediaType === 'video'
              )
            : -1;
        this.selectedMediaIndex = firstVideoIndex !== -1 ? firstVideoIndex : -1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
      },
    });
  }

  selectMedia(i: number): void {
    this.selectedMediaIndex = i;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.quantity) {
      this.quantity++;
    }
  }

  openImageZoom(imageUrl?: string): void {
    if (imageUrl) {
      this.zoomedImageUrl = imageUrl;
      this.showImageZoom = true;
    }
  }

  closeImageZoom(): void {
    this.showImageZoom = false;
    this.zoomedImageUrl = '';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'p1.png';
  }

  copyToClipboard(text: string): void {
    if (navigator.clipboard) {
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'متوفر':
      case 'قابل للبيع':
        return 'status-available';
      case 'غير متوفر':
        return 'status-unavailable';
      case 'قريباً':
        return 'status-coming-soon';
      default:
        return 'status-default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'متوفر':
      case 'قابل للبيع':
        return 'متوفر';
      case 'غير متوفر':
        return 'غير متوفر';
      case 'قريباً':
        return 'قريباً';
      default:
        return status || 'غير محدد';
    }
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

  formatPrice(price: number): string {
    if (price === null || price === undefined) return '0.00 ريال';
    return `${price.toFixed(2)} ريال`;
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

  getImages(): any[] {
    return (
      this.product?.productMedia?.filter(
        (media) => media.mediaType === 'image'
      ) || []
    );
  }

  getVideos(): any[] {
    return (
      this.product?.productMedia?.filter(
        (media) => media.mediaType === 'video'
      ) || []
    );
  }

  getPdfs(): any[] {
    return (
      this.product?.productMedia?.filter(
        (media) => media.mediaType === 'pdf'
      ) || []
    );
  }

  getAllMedia(): any[] {
    return this.product?.productMedia || [];
  }

  getPdfUrl(mediaUrl: string): string {
    return mediaUrl.startsWith('http')
      ? mediaUrl
      : `${environment.baseUrl}${
          mediaUrl.startsWith('/') ? '' : '/'
        }${mediaUrl}`;
  }
}
