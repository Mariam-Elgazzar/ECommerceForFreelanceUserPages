import { Component, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  type FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CheckoutSummaryComponent } from './checkout-summary/checkout-summary.component';
// import { CartService } from '../../services/cart.service';
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
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  // private cartService = inject(CartService);
  private productService = inject(ApiService);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  checkoutForm!: FormGroup;
  currentStep = 1;
  isSubmitting = false;
  product!: Product; // Placeholder for product data
  productId: string | null = null; // To store product ID from query params
  productStatus: string | null = null; // Placeholder for product status
  // Shipping options
  shippingOptions = [
    { id: 'standard', name: 'الشحن القياسي', price: 0, time: '3-7 أيام عمل' },
    { id: 'express', name: 'الشحن السريع', price: 50, time: '1-2 يوم عمل' },
  ];

  // Payment methods
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
    // Check if cart is empty
    this.productId =
      this.activatedRoute.snapshot.queryParamMap.get('productId');
    this.productStatus =
      this.activatedRoute.snapshot.queryParamMap.get('status');
    this.initForm();
    //
    this.loadSavedFormData();
  }

  private initForm(): void {
    // Prepare form controls
    const formControls: { [key: string]: any } = {
      // Step 1: Personal Information
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],

      // Step 2: Shipping Information
      address: ['', [Validators.required, Validators.minLength(5)]],

      // city: ['', [Validators.required]],
      // country: ['المملكة العربية السعودية', [Validators.required]],
      // shippingMethod: ['standard', [Validators.required]],

      // // Step 3: Payment Information
      // paymentMethod: ['credit_card', [Validators.required]],
      // cardNumber: [''],
      // cardExpiry: [''],
      // cardCvv: [''],
    };

    // Add rentalPeriod control conditionally
    if (this.productStatus === 'إيجار') {
      formControls['rentalPeriod'] = [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern(
            /^[0-9]+ (سنين|سنوات|شهور|أشهر|اشهر|ايام|أيام|يوم|شهر|سنة|سنه)$/
          ),
        ],
      ];
    } else {
      // formControls['rentalPeriod'] = [null];
    }

    this.checkoutForm = this.fb.group(formControls);

    // Add conditional validators for credit card fields
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

  nextStep(): void {
    // Validate current step before proceeding
    if (this.validateCurrentStep()) {
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  prevStep(): void {
    this.currentStep--;
    window.scrollTo(0, 0);
  }

  private validateCurrentStep(): boolean {
    let isValid = false;
    const form = this.checkoutForm;

    switch (this.currentStep) {
      case 1:
        // Validate personal information
        const personalControls = ['fullName', 'email', 'phone', 'address'];
        isValid = personalControls.every((control) => form.get(control)?.valid);

        if (!isValid) {
          this.markControlsAsTouched(personalControls);
          this.toastService.show({
            message: 'يرجى إكمال جميع الحقول المطلوبة بشكل صحيح',
            type: 'error',
          });
        }
        break;

      // case 2:
      //   // Validate shipping information
      //   const shippingControls = [
      //     'address',
      //     'city',
      //     'country',
      //     'shippingMethod',
      //   ];
      //   isValid = shippingControls.every((control) => form.get(control)?.valid);

      //   if (!isValid) {
      //     this.markControlsAsTouched(shippingControls);
      //     this.toastService.show({
      //       message: 'يرجى إكمال جميع معلومات الشحن المطلوبة',
      //       type: 'error',
      //     });
      //   }
      //   break;

      // case 3:
      //   // Validate payment information
      //   const paymentMethod = form.get('paymentMethod')?.value;
      //   let paymentControls = ['paymentMethod'];

      //   if (paymentMethod === 'credit_card') {
      //     paymentControls = [
      //       ...paymentControls,
      //       'cardNumber',
      //       'cardExpiry',
      //       'cardCvv',
      //     ];
      //   }

      //   isValid = paymentControls.every((control) => form.get(control)?.valid);

      //   if (!isValid) {
      //     this.markControlsAsTouched(paymentControls);
      //     this.toastService.show({
      //       message: 'يرجى إكمال جميع معلومات الدفع المطلوبة',
      //       type: 'error',
      //     });
      //   }
      //   break;
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
        return fieldName === 'rentalPeriod'
          ? 'يجب أن تكون مدة الإيجار رقمًا صحيحًا متبوعًا بوحدة (يوم، شهر، سنة)'
          : 'تنسيق غير صحيح';
      }
    }

    return '';
  }

  getShippingCost(): number {
    const method = this.checkoutForm.get('shippingMethod')?.value;
    const option = this.shippingOptions.find((opt) => opt.id === method);
    return option ? option.price : 0;
  }

  // getTotal(): number {
  //   return this.cartService.getTotal() + this.getShippingCost();
  // }

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
          // Create order object
          // const order = {
          //   userId: 1, // In a real app, this would be the logged-in user's ID
          //   date: new Date().toISOString(),
          //   status: 'قيد المعالجة',
          //   total: this.getTotal(),
          //   items: this.cartService.items().map((item) => ({
          //     productId: item.product.id,
          //     quantity: item.quantity,
          //     price: item.product.price,
          //   })),
          //   shipping: {
          //     address: formValue.address,
          //     city: formValue.city,
          //     country: formValue.country,
          //     method: formValue.shippingMethod,
          //     cost: this.getShippingCost(),
          //   },
          //   payment: {
          //     method: formValue.paymentMethod,
          //     cardLast4:
          //       formValue.paymentMethod === 'credit_card'
          //         ? formValue.cardNumber?.slice(-4)
          //         : undefined,
          //   },
          // };

          const checkoutData: CheckoutRequest = {
            name: formValue.fullName,
            email: formValue.email,
            phoneNumber: formValue.phone,
            address: formValue.address,
            rentalPeriod: formValue.rentalPeriod || undefined,
            status: this.productStatus || '',
            productId: this.product.id,
          };

          // Submit order to API
          // this.apiService.createOrder(order).subscribe({
          //   next: (response) => {
          //     this.isSubmitting = false
          //     this.toastService.show({
          //       message: "تم إنشاء الطلب بنجاح!",
          //       type: "success",
          //     })
          //     // Clear cart and redirect to confirmation page
          //     this.cartService.clearCart()
          //     this.router.navigate(["/confirmation", response.id])
          //   },
          //   error: (error) => {
          //     this.isSubmitting = false
          //     this.toastService.show({
          //       message: "حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.",
          //       type: "error",
          //     })
          //     console.error("Order creation error:", error)
          //   },
          // })
          console.log(checkoutData);
          this.orderService.checkout(checkoutData).subscribe({
            next: (response: CheckoutResponse) => {
              this.isSubmitting = false;
              if (response.isSuccess) {
                this.saveFormData(); // Save form data to local storage on success
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
