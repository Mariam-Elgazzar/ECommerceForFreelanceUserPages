import { Component, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryCardComponent } from '../../shared/components/category-cart/category-card.component';
import { ApiService } from '../../services/api.service';
import { Category, CategoryParams } from '../../interfaces/category.interface';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CategoryCardComponent],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  private apiService = inject(ApiService);

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  loading = true;
  searchTerm = '';
  sortBy = 'name';

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    const params: CategoryParams = {
      pageIndex: 1,
      pageSize: 100,
    };
    console.log('Loading categories with params:', params);
    this.apiService.getAllCategories(params).subscribe({
      next: (response) => {
        this.categories = response.data.map((cat: any) => ({
          ...cat,
          imagePublicId: cat.imagePublicId ?? '',
        }));
        this.loading = false;
        this.filteredCategories = [...this.categories];
        this.sortCategories();
        console.log('Categories loaded:', this.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      },
    });
  }

  onSearchChange(): void {
    this.filterCategories();
  }

  onSortChange(): void {
    this.sortCategories();
  }

  private filterCategories(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(
        (category) =>
          (category.name ?? '')
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          (category.description ?? '')
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    }
    this.sortCategories();
  }

  private sortCategories(): void {
    this.filteredCategories.sort((a, b) => {
      switch (this.sortBy) {
        // case 'name':
        //   return a.name.localeCompare(b.name);
        // case 'productCount':
        //   return b.productCount - a.productCount;
        default:
          return 0;
      }
    });
  }

  // getTotalProducts(): number {
  //   return this.categories.reduce(
  //     (total, category) => total + category.productCount,
  //     0
  //   );
  // }

  refreshCategories(): void {
    this.loadCategories();
  }

  trackByCategory(index: number, category: Category): number {
    return category.id;
  }
}
