import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { CategoryCardComponent } from "../../shared/components/category-cart/category-card.component"
import { ApiService } from "../../services/api.service"
import { ToastService } from "../../services/toast.service"
import { Category } from "../../models/category"

@Component({
  selector: "app-categories",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CategoryCardComponent],
  templateUrl: "./categories.component.html",
  styleUrls: ["./categories.component.scss"],
})
export class CategoriesComponent implements OnInit {
  private apiService = inject(ApiService)
  private toastService = inject(ToastService)

  categories: Category[] = []
  filteredCategories: Category[] = []
  loading = true
  searchTerm = ""
  sortBy = "name"

  ngOnInit(): void {
    this.loadCategories()
  }

  private loadCategories(): void {
    this.loading = true
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories
        this.filteredCategories = categories
        this.loading = false
        this.sortCategories()
      },
      error: (error) => {
        console.error("Error loading categories:", error)
        this.loading = false
        this.toastService.show({
          message: "حدث خطأ أثناء تحميل الفئات",
          type: "error",
        })
      },
    })
  }

  onSearchChange(): void {
    this.filterCategories()
  }

  onSortChange(): void {
    this.sortCategories()
  }

  private filterCategories(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = [...this.categories]
    } else {
      this.filteredCategories = this.categories.filter(
        (category) =>
          category.nameAr.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          category.descriptionAr.toLowerCase().includes(this.searchTerm.toLowerCase()),
      )
    }
    this.sortCategories()
  }

  private sortCategories(): void {
    this.filteredCategories.sort((a, b) => {
      switch (this.sortBy) {
        case "name":
          return a.nameAr.localeCompare(b.nameAr)
        case "productCount":
          return b.productCount - a.productCount
        default:
          return 0
      }
    })
  }

  getTotalProducts(): number {
    return this.categories.reduce((total, category) => total + category.productCount, 0)
  }

  refreshCategories(): void {
    this.loadCategories()
  }

  trackByCategory(index: number, category: Category): number {
    return category.id
  }
}
