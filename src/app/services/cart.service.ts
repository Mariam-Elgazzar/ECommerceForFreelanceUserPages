import { Injectable, signal } from "@angular/core"
import { CartItem, Product } from "../models/product"
import { ToastService } from "./toast.service"
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CartService {
  private readonly STORAGE_KEY = "caterpillar_cart"
private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$: Observable<CartItem[]> = this.cartSubject.asObservable();
  // Using signals for reactive state management
  private cartItems = signal<CartItem[]>([])

  // Computed values
  readonly items = this.cartItems.asReadonly()

  constructor(private toastService: ToastService) {
    this.loadCart()
  }

  // Load cart from localStorage
  private loadCart(): void {
    const storedCart = localStorage.getItem(this.STORAGE_KEY)
    if (storedCart) {
      this.cartItems.set(JSON.parse(storedCart))
    }
  }

  // Save cart to localStorage
  private saveCart(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cartItems()))
  }

  // Add product to cart
  addToCart(product: Product, quantity = 1): void {
    this.cartItems.update((items) => {
      const existingItem = items.find((item) => item.product.id === product.id)

      if (existingItem) {
        // Update quantity if product already exists
        return items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        // Add new product
        return [...items, { product, quantity }]
      }
    })

    this.saveCart()
    this.toastService.show({
      message: `تمت إضافة ${product.nameAr} إلى سلة التسوق`,
      type: "success",
    })
  }
 getCartItems(): CartItem[] {
    return this.cartItems();
  }
  // Update item quantity
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId)
      return
    }

    this.cartItems.update((items) =>
      items.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
    )

    this.saveCart()
  }

  // Remove item from cart
  removeFromCart(productId: number): void {
    const product = this.cartItems().find((item) => item.product.id === productId)?.product

    this.cartItems.update((items) => items.filter((item) => item.product.id !== productId))
    this.saveCart()

    if (product) {
      this.toastService.show({
        message: `تمت إزالة ${product.nameAr} من سلة التسوق`,
        type: "info",
      })
    }
  }

  // Clear cart
  clearCart(): void {
    this.cartItems.set([])
    this.saveCart()
  }

  // Get cart total
  getTotal(): number {
    return this.cartItems().reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  // Get cart item count
  getItemCount(): number {
    return this.cartItems().reduce((count, item) => count + item.quantity, 0)
  }
}
