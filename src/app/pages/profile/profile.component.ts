import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { User } from "../../models/category"

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent {
  private fb = inject(FormBuilder)

  user: User = {
    id: 1,
    name: "أحمد محمد السعيد",
    email: "ahmed@example.com",
    phone: "+966 50 123 4567",
    address: "شارع الملك فهد، الرياض",
    city: "الرياض",
    country: "المملكة العربية السعودية",
    avatar: "/users/u1.jpg",
    joinDate: "2023-01-15",
  }

  profileForm: FormGroup
  passwordForm: FormGroup
  activeTab = "profile"
  isEditing = false
  isSubmitting = false

  orders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "مكتمل",
      total: 25000,
      items: 3,
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      status: "قيد التنفيذ",
      total: 45000,
      items: 2,
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      status: "ملغي",
      total: 15000,
      items: 1,
    },
  ]

  constructor() {
    this.profileForm = this.fb.group({
      name: [this.user.name, [Validators.required, Validators.minLength(2)]],
      email: [this.user.email, [Validators.required, Validators.email]],
      phone: [this.user.phone, [Validators.required]],
      address: [this.user.address, [Validators.required]],
      city: [this.user.city, [Validators.required]],
      country: [this.user.country, [Validators.required]],
    })

    this.passwordForm = this.fb.group(
      {
        currentPassword: ["", [Validators.required]],
        newPassword: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    )
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get("newPassword")
    const confirmPassword = form.get("confirmPassword")

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    }

    return null
  }

  setActiveTab(tab: string) {
    this.activeTab = tab
  }

  toggleEdit() {
    this.isEditing = !this.isEditing
    if (!this.isEditing) {
      this.profileForm.patchValue(this.user)
    }
  }

  onProfileSubmit() {
    if (this.profileForm.valid) {
      this.isSubmitting = true

      setTimeout(() => {
        this.user = { ...this.user, ...this.profileForm.value }
        this.isSubmitting = false
        this.isEditing = false
      }, 1000)
    }
  }

  onPasswordSubmit() {
    if (this.passwordForm.valid) {
      this.isSubmitting = true

      setTimeout(() => {
        this.isSubmitting = false
        this.passwordForm.reset()
        alert("تم تغيير كلمة المرور بنجاح")
      }, 1000)
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        this.user.avatar = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "مكتمل":
        return "badge bg-success"
      case "قيد التنفيذ":
        return "badge bg-warning text-dark"
      case "ملغي":
        return "badge bg-danger"
      default:
        return "badge bg-secondary"
    }
  }

  isFieldInvalid(formName: string, fieldName: string): boolean {
    const form = formName === "profile" ? this.profileForm : this.passwordForm
    const field = form.get(fieldName)
    return !!(field && field.invalid && field.touched)
  }

  getFieldError(formName: string, fieldName: string): string {
    const form = formName === "profile" ? this.profileForm : this.passwordForm
    const field = form.get(fieldName)

    if (field?.errors) {
      if (field.errors["required"]) return "هذا الحقل مطلوب"
      if (field.errors["email"]) return "البريد الإلكتروني غير صحيح"
      if (field.errors["minlength"]) return `الحد الأدنى ${field.errors["minlength"].requiredLength} أحرف`
      if (field.errors["passwordMismatch"]) return "كلمات المرور غير متطابقة"
    }
    return ""
  }
}
