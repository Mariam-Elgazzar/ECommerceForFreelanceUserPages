import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { ToastService } from "../../services/toast.service"

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
})
export class FooterComponent implements OnInit {
  private toastService = inject(ToastService)

  newsletterEmail = ""
  currentYear = new Date().getFullYear()

  footerLinks = {
    company: [
      { label: "من نحن", path: "/about" },
      { label: "رؤيتنا ورسالتنا", path: "/about" },
      { label: "فريق العمل", path: "/about" },
      { label: "الوظائف", path: "#" },
      { label: "أخبار الشركة", path: "#" },
    ],
    products: [
      { label: "المعدات الثقيلة", path: "/products?category=heavy-machinery" },
      { label: "الحفارات", path: "/products?category=excavators" },
      { label: "الجرافات", path: "/products?category=bulldozers" },
      { label: "اللوادر", path: "/products?category=wheel-loaders" },
      { label: "قطع الغيار", path: "/products?category=parts-accessories" },
    ],
    services: [
      { label: "الصيانة والإصلاح", path: "/support" },
      { label: "التدريب", path: "/support" },
      { label: "الاستشارات الفنية", path: "/support" },
      { label: "خدمات ما بعد البيع", path: "/support" },
      { label: "الضمان", path: "/support" },
    ],
    support: [
      { label: "الدعم الفني", path: "/support" },
      { label: "الأسئلة الشائعة", path: "/faq" },
      { label: "دليل المستخدم", path: "#" },
      { label: "تواصل معنا", path: "/support" },
      { label: "مركز التحميل", path: "#" },
    ],
  }

  socialLinks = [
    { platform: "facebook", icon: "fab fa-facebook-f", url: "https://facebook.com/caterpillar" },
    { platform: "twitter", icon: "fab fa-twitter", url: "https://twitter.com/caterpillar" },
    { platform: "linkedin", icon: "fab fa-linkedin-in", url: "https://linkedin.com/company/caterpillar" },
    { platform: "youtube", icon: "fab fa-youtube", url: "https://youtube.com/caterpillar" },
    { platform: "instagram", icon: "fab fa-instagram", url: "https://instagram.com/caterpillar" },
  ]

  contactInfo = {
    address: "شارع الملك فهد، الرياض 12345، المملكة العربية السعودية",
    phone: "+966 11 123 4567",
    email: "info@caterpillar-sa.com",
    workingHours: "الأحد - الخميس: 8:00 ص - 6:00 م",
  }

  ngOnInit(): void {
    // Any initialization logic
  }

  subscribeNewsletter(): void {
    if (this.newsletterEmail && this.isValidEmail(this.newsletterEmail)) {
      // In a real app, you would call an API to subscribe
      this.toastService.show({
        message: "تم الاشتراك في النشرة الإخبارية بنجاح!",
        type: "success",
      })
      this.newsletterEmail = ""
    } else {
      this.toastService.show({
        message: "يرجى إدخال بريد إلكتروني صحيح",
        type: "error",
      })
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}
