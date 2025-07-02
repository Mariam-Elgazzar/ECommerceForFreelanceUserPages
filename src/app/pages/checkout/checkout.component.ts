import {
  Component,
  type OnInit,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  type FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CheckoutSummaryComponent } from './checkout-summary/checkout-summary.component';
import { ToastService } from '../../services/toast.service';
import { CheckoutForm } from '../../models/order';
import {
  CheckoutRequest,
  OrderService,
  CheckoutResponse,
} from '../../services/order.service';
import { ApiService } from '../../services/api.service';
import { Product } from '../../interfaces/product.interface';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CheckoutSummaryComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private productService = inject(ApiService);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  @ViewChild('formTop') formTop!: ElementRef; // Reference to top of form

  checkoutForm!: FormGroup;
  currentStep = 1;
  isSubmitting = false;
  product!: Product;
  productId: string | null = null;
  productStatus: string | null = null;
  timeUnits = ['يوم', 'شهر', 'سنة'];
  shippingOptions = [
    { id: 'standard', name: 'الشحن القياسي', price: 0, time: '3-7 أيام عمل' },
    { id: 'express', name: 'الشحن السريع', price: 50, time: '1-2 يوم عمل' },
  ];
  paymentMethods = [
    { id: 'credit_card', name: 'بطاقة ائتمان', icon: 'fa-credit-card' },
    { id: 'bank_transfer', name: 'تحويل بنكي', icon: 'fa-university' },
    {
      id: 'cash_on_delivery',
      name: 'الدفع عند الاستلام',
      icon: 'fa-money-bill',
    },
  ];

  ngOnInit(): void {
    this.productId =
      this.activatedRoute.snapshot.queryParamMap.get('productId');
    this.productStatus =
      this.activatedRoute.snapshot.queryParamMap.get('status');
    this.initForm();
    this.loadSavedFormData();
  }

  ngAfterViewInit(): void {
    this.focusFormTop(); // Focus on form top after initial render
  }

  private initForm(): void {
    const formControls: { [key: string]: any } = {
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
    };

    if (this.productStatus === 'إيجار') {
      formControls['rentalPeriodNumber'] = [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern(/^[0-9]+$/),
        ],
      ];
      formControls['rentalPeriodUnit'] = ['', Validators.required];
    }

    this.checkoutForm = this.fb.group(formControls);

    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe((method) => {
      const cardFields = ['cardNumber', 'cardExpiry', 'cardCvv'];
      if (method === 'credit_card') {
        cardFields.forEach((field) => {
          this.checkoutForm.get(field)?.setValidators([Validators.required]);
        });
      } else {
        cardFields.forEach((field) => {
          this.checkoutForm.get(field)?.clearValidators();
        });
      }
      cardFields.forEach((field) => {
        this.checkoutForm.get(field)?.updateValueAndValidity();
      });
    });
  }

  private loadSavedFormData(): void {
    const savedData = localStorage.getItem('checkoutFormData');
    if (savedData) {
      const formData = JSON.parse(savedData);
      this.checkoutForm.patchValue(formData);
    }
  }

  private saveFormData(): void {
    const formValue = this.checkoutForm.value;
    localStorage.setItem('checkoutFormData', JSON.stringify(formValue));
  }

  private focusFormTop(): void {
    if (this.formTop) {
      this.formTop.nativeElement.focus(); // Focus on top of form
    }
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      this.currentStep++;
      this.focusFormTop(); // Focus instead of scroll
    }
  }

  prevStep(): void {
    this.currentStep--;
    this.focusFormTop(); // Focus instead of scroll
  }

  private validateCurrentStep(): boolean {
    let isValid = false;
    const form = this.checkoutForm;

    switch (this.currentStep) {
      case 1:
        const personalControls = ['fullName', 'email', 'phone', 'address'];
        if (this.productStatus === 'إيجار') {
          personalControls.push('rentalPeriodNumber', 'rentalPeriodUnit');
        }
        isValid = personalControls.every((control) => form.get(control)?.valid);

        if (!isValid) {
          this.markControlsAsTouched(personalControls);
          this.toastService.show({
            message: 'يرجى إكمال جميع الحقول المطلوبة بشكل صحيح',
            type: 'error',
          });
        }
        break;
    }

    return isValid;
  }

  private markControlsAsTouched(controlNames: string[]): void {
    controlNames.forEach((name) => {
      this.checkoutForm.get(name)?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) return 'هذا الحقل مطلوب';
      if (field.errors['email']) return 'البريد الإلكتروني غير صحيح';
      if (field.errors['minlength']) {
        return `الحد الأدنى ${field.errors['minlength'].requiredLength} أحرف`;
      }
      if (field.errors['pattern']) {
        return fieldName.includes('rentalPeriod')
          ? 'يجب أن تكون مدة الإيجار رقمًا صحيحًا'
          : 'تنسيق غير صحيح';
      }
      if (field.errors['min']) return 'القيمة يجب أن تكون 1 أو أكثر';
    }

    return '';
  }

  getShippingCost(): number {
    const method = this.checkoutForm.get('shippingMethod')?.value;
    const option = this.shippingOptions.find((opt) => opt.id === method);
    return option ? option.price : 0;
  }

  submitOrder(): void {
    if (!this.checkoutForm.valid) {
      this.toastService.show({
        message: 'يرجى إكمال جميع الحقول المطلوبة',
        type: 'error',
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.checkoutForm.value as CheckoutForm;

    this.productService
      .readProductById(this.productId ? Number(this.productId) : 0)
      .subscribe({
        next: (response) => {
          if (!response) {
            this.toastService.show({
              message: 'المنتج غير موجود',
              type: 'error',
            });
            this.isSubmitting = false;
            return;
          }
          this.product = response;

          const checkoutData: CheckoutRequest = {
            name: formValue.fullName,
            email: formValue.email,
            phoneNumber: formValue.phone,
            address: formValue.address,
            rentalPeriod:
              this.productStatus === 'إيجار'
                ? `${formValue.rentalPeriodNumber} ${formValue.rentalPeriodUnit} `
                : undefined,
            status: this.productStatus || '',
            productId: this.product.id,
          };

          this.orderService.checkout(checkoutData).subscribe({
            next: (response: CheckoutResponse) => {
              this.isSubmitting = false;
              if (response.isSuccess) {
                this.saveFormData();
                this.toastService.show({
                  message: response.message || 'تم إنشاء الطلب بنجاح!',
                  type: 'success',
                });
                this.router.navigate(['/confirmation', checkoutData.productId]);
              } else {
                this.toastService.show({
                  message: response.message || 'فشل في إنشاء الطلب',
                  type: 'error',
                });
              }
            },
            error: (error) => {
              this.isSubmitting = false;
              this.toastService.show({
                message: 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.',
                type: 'error',
              });
              console.error('Order creation error:', error);
            },
          });
        },
        error: (error) => {
          this.toastService.show({
            message: 'حدث خطأ أثناء جلب بيانات المنتج.',
            type: 'error',
          });
          this.isSubmitting = false;
          console.error('Product fetch error:', error);
        },
      });
  }
}
