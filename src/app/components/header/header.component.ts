import { Component, HostListener, inject, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Category, CategoryParams } from '../../interfaces/category.interface';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  email = 'info@caterpillar-sa.com';
  isMenuOpen = false;
  isScrolled = false;
  searchQuery = '';
  isSearchOpen = false;
  categories: Category[] = [];

  navItems = [
    { path: '/', label: 'الرئيسية', exact: true, icon: 'fas fa-home' },
    {
      path: '/products',
      label: 'المنتجات',
      exact: false,
      icon: 'fas fa-boxes',
    },
    {
      path: '/categories',
      label: 'الفئات',
      exact: false,
      icon: 'fas fa-th-large',
    },
    {
      path: '/about',
      label: 'من نحن',
      exact: false,
      icon: 'fas fa-info-circle',
    },
    {
      path: '/support',
      label: 'الدعم الفني',
      exact: false,
      icon: 'fas fa-headset',
    },
    {
      path: '/faq',
      label: 'الأسئلة الشائعة',
      exact: false,
      icon: 'fas fa-question-circle',
    },
  ];

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    const params: CategoryParams = {
      pageIndex: 1,
      pageSize: 100,
    };

    this.apiService.getAllCategories(params).subscribe({
      next: (response) => {
        this.categories = response.data.map((cat: any) => ({
          ...cat,
          imagePublicId: cat.imagePublicId ?? '',
        }));
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.isSearchOpen = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => {
        const searchInput = document.getElementById(
          'searchInput'
        ) as HTMLInputElement;
        searchInput?.focus();
      }, 100);
    }
  }

  profile() {
    this.router.navigate(['/profile']);
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchQuery.trim() },
      });
      this.isSearchOpen = false;
      this.searchQuery = '';
      this.closeMenu();
    }
  }

  navigateToCategory(category: Category) {
    this.router.navigate(['/products'], {
      queryParams: { category: category.name },
    });
    this.closeMenu();
  }
}
