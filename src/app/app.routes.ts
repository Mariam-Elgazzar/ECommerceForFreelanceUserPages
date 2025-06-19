import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: ' العوفي - الرئيسية',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products.component').then(
        (m) => m.ProductManagementComponent
      ),
    title: 'العوفي - المنتجات',
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent
      ),
    title: 'تفاصيل المنتج -  العوفي',
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories/categories.component').then(
        (m) => m.CategoriesComponent
      ),
    title: 'الفئات -  العوفي',
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.component').then((m) => m.CartComponent),
    title: 'سلة التسوق -  العوفي',
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(
        (m) => m.CheckoutComponent
      ),
    title: 'الدفع -  العوفي',
  },
  {
    path: 'confirmation/:id',
    loadComponent: () =>
      import('./pages/confirmation/confirmation.component').then(
        (m) => m.ConfirmationComponent
      ),
    title: 'تأكيد الطلب -  العوفي',
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    title: 'العوفي - الملف الشخصي',
  },
  {
    path: 'support',
    loadComponent: () =>
      import('./pages/support/support.component').then(
        (m) => m.SupportComponent
      ),
    title: 'الدعم -  العوفي',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: 'العوفي - من نحن',
  },
  {
    path: 'faq',
    loadComponent: () =>
      import('./pages/faq/faq.component').then((m) => m.FaqComponent),
    title: 'العوفي - من نحن',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
    title: 'العوفي - من نحن',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    title: 'العوفي - من نحن',
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
