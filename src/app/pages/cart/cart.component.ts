import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { CartService } from "../../services/cart.service"
import { ToastService } from "../../services/toast.service"
import { ApiService } from "../../services/api.service"
import { CartItem, Product } from "../../models/product"

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.scss"],
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService)
  private toastService = inject(ToastService)
  private apiService = inject(ApiService)

  cartItems: CartItem[] = []
  relatedProducts: Product[] = []
  loading = false
  promoCode = ""
  promoDiscount = 0
  isPromoApplied = false

  // Promo codes (in a real app, this would come from the API)
  promoCodes = {
    SAVE10: 0.1,
    WELCOME: 0.05,
    CATERPILLAR: 0.15,
  }

  ngOnInit(): void {
    this.loadCartItems()
    this.loadRelatedProducts()
  }

  private loadCartItems(): void {
    this.cartItems = this.cartService.items()
  }

  private loadRelatedProducts(): void {
    this.loading = true
    this.apiService.getProducts({ limit: 4 }).subscribe({
      next: (products) => {
        // Filter out products that are already in cart
        const cartProductIds = this.cartItems.map((item) => item.product.id)
        this.relatedProducts = products.filter((product) => !cartProductIds.includes(product.id))
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading related products:", error)
        this.loading = false
      },
    })
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(productId)
      return
    }

    this.cartService.updateQuantity(productId, quantity)
    this.loadCartItems()
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId)
    this.loadCartItems()
    this.loadRelatedProducts() // Refresh related products
  }

  clearCart(): void {
    if (confirm("هل أنت متأكد من أنك تريد إفراغ سلة التسوق؟")) {
      this.cartService.clearCart()
      this.loadCartItems()
      this.promoDiscount = 0
      this.isPromoApplied = false
      this.promoCode = ""
      this.toastService.show({
        message: "تم إفراغ سلة التسوق",
        type: "info",
      })
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product)
    this.loadCartItems()
    this.loadRelatedProducts()
  }

  applyPromoCode(): void {
    const code = this.promoCode.toUpperCase()

    if (this.promoCodes[code as keyof typeof this.promoCodes]) {
      this.promoDiscount = this.promoCodes[code as keyof typeof this.promoCodes]
      this.isPromoApplied = true
      this.toastService.show({
        message: `تم تطبيق كود الخصم ${code} بنجاح! خصم ${(this.promoDiscount * 100).toFixed(0)}%`,
        type: "success",
      })
    } else {
      this.toastService.show({
        message: "كود الخصم غير صحيح",
        type: "error",
      })
    }
  }

  removePromoCode(): void {
    this.promoDiscount = 0
    this.isPromoApplied = false
    this.promoCode = ""
    this.toastService.show({
      message: "تم إلغاء كود الخصم",
      type: "info",
    })
  }

  getSubtotal(): number {
    return this.cartService.getTotal()
  }

  getDiscount(): number {
    return this.getSubtotal() * this.promoDiscount
  }

  getTax(): number {
    return (this.getSubtotal() - this.getDiscount()) * 0.15 // 15% VAT
  }

  getTotal(): number {
    return this.getSubtotal() - this.getDiscount() + this.getTax()
  }

  getItemCount(): number {
    return this.cartService.getItemCount()
  }

  increaseQuantity(item: CartItem): void {
    this.updateQuantity(item.product.id, item.quantity + 1)
  }

  decreaseQuantity(item: CartItem): void {
    this.updateQuantity(item.product.id, item.quantity - 1)
  }

  getItemTotal(item: CartItem): number {
    return item.product.price * item.quantity
  }

  // Save for later functionality (placeholder)
  saveForLater(productId: number): void {
    this.toastService.show({
      message: "تم حفظ المنتج للاحقاً",
      type: "info",
    })
    // In a real app, you would implement save for later functionality
  }

  // Share cart functionality (placeholder)
  shareCart(): void {
    if (navigator.share) {
      navigator.share({
        title: "سلة التسوق - كاتربيلر",
        text: `لدي ${this.getItemCount()} منتجات في سلة التسوق بقيمة ${this.getTotal().toFixed(2)} ريال`,
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      this.toastService.show({
        message: "تم نسخ رابط سلة التسوق",
        type: "success",
      })
    }
  }

  trackByProductId(index: number, item: CartItem): number {
    return item.product.id
  }
}
