import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  type FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent {
  private fb = inject(FormBuilder);

  contactForm: FormGroup;
  isSubmitting = false;
  isSubmitted = false;

  supportChannels = [
    {
      icon: 'fas fa-phone',
      title: 'الهاتف',
      description: 'تواصل معنا مباشرة',
      contact: '+966530185141',
      available: '24/7',
    },
    {
      icon: 'fas fa-envelope',
      title: 'البريد الإلكتروني',
      description: 'أرسل لنا استفسارك',
      contact: 'aloufi01@hotmail.com',
      available: 'خلال 24 ساعة',
    },
    {
      icon: 'fas fa-comments',
      title: 'الدردشة المباشرة',
      description: 'دردشة فورية مع فريق الدعم',
      contact: 'ابدأ المحادثة',
      available: '9 ص - 5 م',
    },
    {
      icon: 'fas fa-map-marker-alt',
      title: 'زيارة المعرض',
      description: 'قم بزيارتنا شخصياً',
      contact: 'جدة , المملكة العربية السعودية',
      available: 'السبت - الخميس',
    },
  ];

  faqCategories = [
    {
      title: 'الطلبات والشحن',
      questions: [
        'كم يستغرق وقت التوصيل؟',
        'ما هي تكلفة الشحن؟',
        'هل يمكنني تتبع طلبي؟',
      ],
    },
    {
      title: 'المنتجات والضمان',
      questions: [
        'ما هي مدة الضمان؟',
        'كيف أحصل على قطع الغيار؟',
        'هل المنتجات أصلية؟',
      ],
    },
    {
      title: 'الدفع والفواتير',
      questions: [
        'ما هي طرق الدفع المتاحة؟',
        'هل يمكنني الدفع بالتقسيط؟',
        'كيف أحصل على فاتورة؟',
      ],
    },
  ];

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      subject: ['', [Validators.required]],
      category: ['general', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      priority: ['medium', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.isSubmitted = true;
        this.contactForm.reset();
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.contactForm.controls).forEach((key) => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'هذا الحقل مطلوب';
      if (field.errors['email']) return 'البريد الإلكتروني غير صحيح';
      if (field.errors['minlength'])
        return `الحد الأدنى ${field.errors['minlength'].requiredLength} أحرف`;
      if (field.errors['pattern']) return 'تنسيق غير صحيح';
    }
    return '';
  }
}
