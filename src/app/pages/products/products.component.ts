import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, ActivatedRoute } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { ApiService } from "../../services/api.service"
import { CartService } from "../../services/cart.service"
import { Product } from "../../models/product"

@Component({
  selector: "app-products",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.scss"],
})
export class ProductsComponent implements OnInit {
  private apiService = inject(ApiService)
  private cartService = inject(CartService)
  private route = inject(ActivatedRoute)

  products: Product[] = []
  filteredProducts: Product[] = []
  categories: string[] = []
  selectedCategory = ""
  sortBy = "name"
  searchTerm = ""
  loading = true
  currentPage = 1
  itemsPerPage = 12

  ngOnInit() {
    this.loadProducts()
    this.route.queryParams.subscribe((params) => {
      if (params["category"]) {
        this.selectedCategory = params["category"]
        this.filterProducts()
      }
    })
  }

  loadProducts() {
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products = products
        this.filteredProducts = products
        this.categories = [...new Set(products.map((p) => p.category))]
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading products:", error)
        this.loading = false
      },
    })
  }

  filterProducts() {
    this.filteredProducts = this.products.filter((product) => {
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory
      const matchesSearch =
        !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.nameAr.includes(this.searchTerm)
      return matchesCategory && matchesSearch
    })
    this.sortProducts()
  }

  sortProducts() {
    this.filteredProducts.sort((a, b) => {
      switch (this.sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })
  }

  onCategoryChange() {
    this.currentPage = 1
    this.filterProducts()
  }

  onSortChange() {
    this.sortProducts()
  }

  onSearchChange() {
    this.currentPage = 1
    this.filterProducts()
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product)
  }

  get paginatedProducts() {
    const start = (this.currentPage - 1) * this.itemsPerPage
    const end = start + this.itemsPerPage
    return this.filteredProducts.slice(start, end)
  }

  get totalPages() {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage)
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
    }
  }
}
