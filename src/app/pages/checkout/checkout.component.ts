import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterLink } from "@angular/router"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { CheckoutSummaryComponent } from "./checkout-summary/checkout-summary.component"
import { CartService } from "../../services/cart.service"
import { ApiService } from "../../services/api.service"
import { ToastService } from "../../services/toast.service"
import { CheckoutForm } from "../../models/order"

@Component({
  selector: "app-checkout",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CheckoutSummaryComponent],
  templateUrl: "./checkout.component.html",
  styleUrls: ["./checkout.component.scss"],
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder)
  private cartService = inject(CartService)
  private apiService = inject(ApiService)
  private toastService = inject(ToastService)
  private router = inject(Router)

  checkoutForm!: FormGroup
  currentStep = 1
  isSubmitting = false

  // Shipping options
  shippingOptions = [
    { id: "standard", name: "الشحن القياسي", price: 0, time: "3-7 أيام عمل" },
    { id: "express", name: "الشحن السريع", price: 50, time: "1-2 يوم عمل" },
  ]

  // Payment methods
  paymentMethods = [
    { id: "credit_card", name: "بطاقة ائتمان", icon: "fa-credit-card" },
    { id: "bank_transfer", name: "تحويل بنكي", icon: "fa-university" },
    { id: "cash_on_delivery", name: "الدفع عند الاستلام", icon: "fa-money-bill" },
  ]

  ngOnInit(): void {
    // Check if cart is empty
    if (this.cartService.getItemCount() === 0) {
      this.toastService.show({
        message: "سلة التسوق فارغة، يرجى إضافة منتجات قبل إتمام الطلب",
        type: "warning",
      })
      this.router.navigate(["/products"])
      return
    }

    this.initForm()
  }

  private initForm(): void {
    this.checkoutForm = this.fb.group({
      // Step 1: Personal Information
      fullName: ["", [Validators.required, Validators.minLength(3)]],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],

      // Step 2: Shipping Information
      address: ["", [Validators.required, Validators.minLength(5)]],
      city: ["", [Validators.required]],
      country: ["المملكة العربية السعودية", [Validators.required]],
      shippingMethod: ["standard", [Validators.required]],

      // Step 3: Payment Information
      paymentMethod: ["credit_card", [Validators.required]],
      cardNumber: [""],
      cardExpiry: [""],
      cardCvv: [""],
    })

    // Add conditional validators for credit card fields
    this.checkoutForm.get("paymentMethod")?.valueChanges.subscribe((method) => {
      const cardFields = ["cardNumber", "cardExpiry", "cardCvv"]

      if (method === "credit_card") {
        cardFields.forEach((field) => {
          this.checkoutForm.get(field)?.setValidators([Validators.required])
        })
      } else {
        cardFields.forEach((field) => {
          this.checkoutForm.get(field)?.clearValidators()
        })
      }

      cardFields.forEach((field) => {
        this.checkoutForm.get(field)?.updateValueAndValidity()
      })
    })
  }

  nextStep(): void {
    // Validate current step before proceeding
    if (this.validateCurrentStep()) {
      this.currentStep++
      window.scrollTo(0, 0)
    }
  }

  prevStep(): void {
    this.currentStep--
    window.scrollTo(0, 0)
  }

  private validateCurrentStep(): boolean {
    let isValid = false
    const form = this.checkoutForm

    switch (this.currentStep) {
      case 1:
        // Validate personal information
        const personalControls = ["fullName", "email", "phone"]
        isValid = personalControls.every((control) => form.get(control)?.valid)

        if (!isValid) {
          this.markControlsAsTouched(personalControls)
          this.toastService.show({
            message: "يرجى إكمال جميع الحقول المطلوبة بشكل صحيح",
            type: "error",
          })
        }
        break

      case 2:
        // Validate shipping information
        const shippingControls = ["address", "city", "country", "shippingMethod"]
        isValid = shippingControls.every((control) => form.get(control)?.valid)

        if (!isValid) {
          this.markControlsAsTouched(shippingControls)
          this.toastService.show({
            message: "يرجى إكمال جميع معلومات الشحن المطلوبة",
            type: "error",
          })
        }
        break

      case 3:
        // Validate payment information
        const paymentMethod = form.get("paymentMethod")?.value
        let paymentControls = ["paymentMethod"]

        if (paymentMethod === "credit_card") {
          paymentControls = [...paymentControls, "cardNumber", "cardExpiry", "cardCvv"]
        }

        isValid = paymentControls.every((control) => form.get(control)?.valid)

        if (!isValid) {
          this.markControlsAsTouched(paymentControls)
          this.toastService.show({
            message: "يرجى إكمال جميع معلومات الدفع المطلوبة",
            type: "error",
          })
        }
        break
    }

    return isValid
  }

  private markControlsAsTouched(controlNames: string[]): void {
    controlNames.forEach((name) => {
      this.checkoutForm.get(name)?.markAsTouched()
    })
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName)
    return !!(field && field.invalid && field.touched)
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName)

    if (field?.errors) {
      if (field.errors["required"]) return "هذا الحقل مطلوب"
      if (field.errors["email"]) return "البريد الإلكتروني غير صحيح"
      if (field.errors["minlength"]) {
        return `الحد الأدنى ${field.errors["minlength"].requiredLength} أحرف`
      }
      if (field.errors["pattern"]) return "تنسيق غير صحيح"
    }

    return ""
  }

  getShippingCost(): number {
    const method = this.checkoutForm.get("shippingMethod")?.value
    const option = this.shippingOptions.find((opt) => opt.id === method)
    return option ? option.price : 0
  }

  getTotal(): number {
    return this.cartService.getTotal() + this.getShippingCost()
  }

  submitOrder(): void {
    if (!this.checkoutForm.valid) {
      this.toastService.show({
        message: "يرجى إكمال جميع الحقول المطلوبة",
        type: "error",
      })
      return
    }

    this.isSubmitting = true
    const formValue = this.checkoutForm.value as CheckoutForm

    // Create order object
    const order = {
      userId: 1, // In a real app, this would be the logged-in user's ID
      date: new Date().toISOString(),
      status: "قيد المعالجة",
      total: this.getTotal(),
      items: this.cartService.items().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      shipping: {
        address: formValue.address,
        city: formValue.city,
        country: formValue.country,
        method: formValue.shippingMethod,
        cost: this.getShippingCost(),
      },
      payment: {
        method: formValue.paymentMethod,
        cardLast4: formValue.paymentMethod === "credit_card" ? formValue.cardNumber?.slice(-4) : undefined,
      },
    }

    // Submit order to API
    this.apiService.createOrder(order).subscribe({
      next: (response) => {
        this.isSubmitting = false
        this.toastService.show({
          message: "تم إنشاء الطلب بنجاح!",
          type: "success",
        })

        // Clear cart and redirect to confirmation page
        this.cartService.clearCart()
        this.router.navigate(["/confirmation", response.id])
      },
      error: (error) => {
        this.isSubmitting = false
        this.toastService.show({
          message: "حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.",
          type: "error",
        })
        console.error("Order creation error:", error)
      },
    })
  }
}
