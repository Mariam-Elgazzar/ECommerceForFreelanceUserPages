import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  stats = [
    { number: '20+', label: 'سنة من الخبرة' },
    { number: '1000+', label: 'عميل راضي' },
    { number: '500+', label: 'مشروع مكتمل' },
    { number: '24/7', label: 'دعم فني' },
  ];

  team = [
    {
      name: 'أحمد محمد',
      position: 'المدير العام',
      image: '/users/u2.jpg',
      description: 'خبرة 20 سنة في مجال المعدات الثقيلة',
    },
    {
      name: 'سارة أحمد',
      position: 'مدير المبيعات',
      image: '/users/u4.jpg',
      description: 'متخصصة في حلول المعدات الصناعية',
    },
    {
      name: 'محمد علي',
      position: 'مدير الدعم الفني',
      image: '/users/u3.jpg',
      description: 'خبير في صيانة معدات كاتربيلر',
    },
    {
      name: 'فاطمة حسن',
      position: 'مدير قطع الغيار',
      image: '/users/u5.jpg',
      description: 'متخصصة في قطع الغيار الأصلية',
    },
  ];

  values = [
    {
      icon: 'fas fa-award',
      title: 'الجودة',
      description: 'نلتزم بتقديم أعلى معايير الجودة في جميع منتجاتنا وخدماتنا',
    },
    {
      icon: 'fas fa-handshake',
      title: 'الثقة',
      description:
        'نبني علاقات طويلة الأمد مع عملائنا على أساس الثقة والشفافية',
    },
    {
      icon: 'fas fa-cogs',
      title: 'الابتكار',
      description: 'نسعى دائماً لتقديم حلول مبتكرة تلبي احتياجات عملائنا',
    },
    {
      icon: 'fas fa-users',
      title: 'الخدمة',
      description: 'فريقنا المتخصص جاهز لتقديم أفضل خدمة عملاء على مدار الساعة',
    },
  ];
}
