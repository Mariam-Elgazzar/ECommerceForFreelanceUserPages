import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'العوفي - الرئيسية',
    data: {
      metaTags: {
        description:
          'مرحبًا بكم في موقع العوفي، متجركم الإلكتروني لأفضل المنتجات.',
        keywords: 'العوفي, متجر إلكتروني, تسوق, منتجات',
      },
    },
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products.component').then(
        (m) => m.ProductManagementComponent
      ),
    title: 'العوفي - المنتجات',
    data: {
      metaTags: {
        description:
          'تصفح مجموعتنا الواسعة من المنتجات عالية الجودة في متجر العوفي.',
        keywords: 'منتجات, تسوق, العوفي, جودة',
      },
    },
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent
      ),
    title: 'العوفي - تفاصيل المنتج', // Dynamic title set in component
    data: {
      metaTags: {
        description: 'تفاصيل المنتج في متجر العوفي، اكتشف المزيد عن منتجاتنا.',
        keywords: 'منتج, تفاصيل, العوفي, تسوق',
      },
    },
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories/categories.component').then(
        (m) => m.CategoriesComponent
      ),
    title: 'العوفي - الفئات',
    data: {
      metaTags: {
        description: 'استكشف فئات المنتجات المتنوعة في متجر العوفي.',
        keywords: 'فئات, منتجات, العوفي, تسوق',
      },
    },
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.component').then((m) => m.CartComponent),
    title: 'العوفي - سلة التسوق',
    data: {
      metaTags: {
        description: 'تحقق من سلة التسوق الخاصة بك في متجر العوفي.',
        keywords: 'سلة تسوق, العوفي, دفع',
      },
    },
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(
        (m) => m.CheckoutComponent
      ),
    title: 'العوفي - إتمام الطلب',
    data: {
      metaTags: {
        description: 'أكمل عملية الدفع بسهولة وأمان في متجر العوفي.',
        keywords: 'دفع, إتمام الطلب, العوفي, تسوق',
      },
    },
  },
  {
    path: 'confirmation/:id',
    loadComponent: () =>
      import('./pages/confirmation/confirmation.component').then(
        (m) => m.ConfirmationComponent
      ),
    title: 'تأكيد الطلب - العوفي', // Dynamic title set in component
    data: {
      metaTags: {
        description: 'تأكيد طلبك في متجر العوفي، شكرًا لتسوقك معنا.',
        keywords: 'تأكيد طلب, العوفي, تسوق',
      },
    },
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    title: 'العوفي - الملف الشخصي',
    data: {
      metaTags: {
        description: 'إدارة ملفك الشخصي في متجر العوفي.',
        keywords: 'ملف شخصي, العوفي, حساب',
      },
    },
  },
  {
    path: 'support',
    loadComponent: () =>
      import('./pages/support/support.component').then(
        (m) => m.SupportComponent
      ),
    title: 'الدعم - العوفي',
    data: {
      metaTags: {
        description: 'احصل على الدعم والمساعدة من فريق العوفي.',
        keywords: 'دعم, مساعدة, العوفي, خدمة العملاء',
      },
    },
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: 'العوفي - من نحن',
    data: {
      metaTags: {
        description: 'تعرف على متجر العوفي وقيمنا ورسالتنا.',
        keywords: 'من نحن, العوفي, متجر إلكتروني',
      },
    },
  },
  {
    path: 'faq',
    loadComponent: () =>
      import('./pages/faq/faq.component').then((m) => m.FaqComponent),
    title: 'العوفي - الأسئلة الشائعة',
    data: {
      metaTags: {
        description: 'إجابات على الأسئلة الشائعة حول التسوق في متجر العوفي.',
        keywords: 'أسئلة شائعة, العوفي, تسوق',
      },
    },
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
