import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, ActivatedRoute } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { ApiService } from "../../services/api.service"
import { CartService } from "../../services/cart.service"
import { Product } from "../../models/product"

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./product-detail.component.html",
  styleUrls: ["./product-detail.component.scss"],
})
export class ProductDetailComponent implements OnInit {
  private apiService = inject(ApiService)
  private cartService = inject(CartService)
  private route = inject(ActivatedRoute)

  product: Product | null = null
  relatedProducts: Product[] = []
  quantity = 1
  loading = true
  selectedImageIndex = 0

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const productId = +params["id"]
      this.loadProduct(productId)
    })
  }

  loadProduct(id: number) {
    this.loading = true
    this.apiService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product
        this.loadRelatedProducts()
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading product:", error)
        this.loading = false
      },
    })
  }

  loadRelatedProducts() {
    if (this.product) {
      this.apiService.getProducts().subscribe({
        next: (products) => {
          this.relatedProducts = products
            .filter((p) => p.category === this.product!.category && p.id !== this.product!.id)
            .slice(0, 4)
        },
      })
    }
  }

  addToCart() {
    if (this.product) {
      for (let i = 0; i < this.quantity; i++) {
        this.cartService.addToCart(this.product)
      }
    }
  }

  increaseQuantity() {
    this.quantity++
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--
    }
  }

  selectImage(index: number) {
    this.selectedImageIndex = index
  }

  get productImages() {
    return this.product ? [this.product.image, this.product.image, this.product.image] : []
  }
}
