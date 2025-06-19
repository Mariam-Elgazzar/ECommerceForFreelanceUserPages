import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  user!: LoginResponse | null;

  profileForm: FormGroup;
  passwordForm: FormGroup;
  activeTab = 'profile';
  isEditing = false;
  isSubmitting = false;

  constructor(private authService: AuthService) {
    this.profileForm = this.fb.group({
      firstName: [
        this.user?.firstName,
        [Validators.required, Validators.minLength(2)],
      ],
      lastName: [
        this.user?.lastName,
        [Validators.required, Validators.minLength(2)],
      ],
      email: [this.user?.email, [Validators.required, Validators.email]],
      phoneNumber: [this.user?.phoneNumber, [Validators.required]],
      address: [this.user?.address, [Validators.required]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
    this.loadUserProfile();
  }

  loadUserProfile() {
    // Example: Load user profile from AuthService or ApiService
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      console.log('User loaded:', this.user);
      // Patch the form with user data
      this.profileForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        phoneNumber: this.user.phoneNumber,
        address: this.user.address,
        id: this.user.id,
      });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // this.profileForm.patchValue(this.user);
    }
  }

  onProfileSubmit() {
    if (this.profileForm.valid) {
      this.isSubmitting = true;
      //  server request
      this.authService
        .updateProfile(
          this.profileForm.value.firstName,
          this.profileForm.value.lastName,
          this.profileForm.value.email,
          this.profileForm.value.phoneNumber,
          this.profileForm.value.address
        )
        .subscribe({
          next: (response) => {
            this.user = { ...this.profileForm.value, id: this.user?.id };
            if (this.user) {
              this.authService.setUser(this.user);
            }
            this.isSubmitting = false;
            this.isEditing = false;
            alert('تم تحديث الملف الشخصي بنجاح');
          },
          error: (error) => {
            this.isSubmitting = false;
            alert('فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.');
          },
        });
    }
  }

  onPasswordSubmit() {
    if (this.passwordForm.valid && this.user?.id) {
      this.isSubmitting = true;

      this.authService
        .changePassword(
          this.user?.id ?? '',
          this.passwordForm.value.currentPassword,
          this.passwordForm.value.newPassword
        )
        .subscribe({
          next: (response) => {
            alert('تم تغيير كلمة المرور بنجاح');
            this.isSubmitting = false;
            this.passwordForm.reset();
          },
          error: (error) => {
            this.isSubmitting = false;
            alert('فشل تغيير كلمة المرور. يرجى المحاولة مرة أخرى.');
            console.log(this.passwordForm.value.currentPassword);
            console.log(this.passwordForm.value.newPassword);
            console.log(this.user?.id);
          },
        });
    }
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // this.user.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'مكتمل':
        return 'badge bg-success';
      case 'قيد التنفيذ':
        return 'badge bg-warning text-dark';
      case 'ملغي':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  isFieldInvalid(formName: string, fieldName: string): boolean {
    const form = formName === 'profile' ? this.profileForm : this.passwordForm;
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(formName: string, fieldName: string): string {
    const form = formName === 'profile' ? this.profileForm : this.passwordForm;
    const field = form.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) return 'هذا الحقل مطلوب';
      if (field.errors['email']) return 'البريد الإلكتروني غير صحيح';
      if (field.errors['minlength'])
        return `الحد الأدنى ${field.errors['minlength'].requiredLength} أحرف`;
      if (field.errors['passwordMismatch']) return 'كلمات المرور غير متطابقة';
    }
    return '';
  }
}
