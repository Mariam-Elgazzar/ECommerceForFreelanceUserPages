import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { FAQ } from "../../models/category"

@Component({
  selector: "app-faq",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./faq.component.html",
  styleUrls: ["./faq.component.scss"],
})
export class FaqComponent implements OnInit {
  faqs: FAQ[] = [
    {
      id: 1,
      question: "How long does shipping take?",
      questionAr: "كم يستغرق وقت الشحن؟",
      answer: "Shipping typically takes 3-7 business days within Saudi Arabia.",
      answerAr: "عادة ما يستغرق الشحن من 3-7 أيام عمل داخل المملكة العربية السعودية.",
      category: "shipping",
    },
    {
      id: 2,
      question: "What is the warranty period?",
      questionAr: "ما هي مدة الضمان؟",
      answer: "All our products come with a 1-year manufacturer warranty.",
      answerAr: "جميع منتجاتنا تأتي مع ضمان الشركة المصنعة لمدة سنة واحدة.",
      category: "warranty",
    },
    {
      id: 3,
      question: "Do you offer financing options?",
      questionAr: "هل تقدمون خيارات التمويل؟",
      answer: "Yes, we offer various financing options for qualified customers.",
      answerAr: "نعم، نقدم خيارات تمويل متنوعة للعملاء المؤهلين.",
      category: "payment",
    },
    {
      id: 4,
      question: "How can I track my order?",
      questionAr: "كيف يمكنني تتبع طلبي؟",
      answer: "You can track your order using the tracking number sent to your email.",
      answerAr: "يمكنك تتبع طلبك باستخدام رقم التتبع المرسل إلى بريدك الإلكتروني.",
      category: "shipping",
    },
    {
      id: 5,
      question: "Are the products genuine Caterpillar?",
      questionAr: "هل المنتجات أصلية من كاتربيلر؟",
      answer: "Yes, all our products are genuine Caterpillar equipment and parts.",
      answerAr: "نعم، جميع منتجاتنا معدات وقطع غيار أصلية من كاتربيلر.",
      category: "products",
    },
    {
      id: 6,
      question: "What payment methods do you accept?",
      questionAr: "ما هي طرق الدفع التي تقبلونها؟",
      answer: "We accept credit cards, bank transfers, and cash on delivery.",
      answerAr: "نقبل بطاقات الائتمان والتحويلات البنكية والدفع عند الاستلام.",
      category: "payment",
    },
  ]

  filteredFaqs: FAQ[] = []
  searchTerm = ""
  selectedCategory = ""
  categories = ["shipping", "warranty", "payment", "products"]
  expandedFaq: number | null = null

  ngOnInit() {
    this.filteredFaqs = this.faqs
  }

  filterFaqs() {
    this.filteredFaqs = this.faqs.filter((faq) => {
      const matchesSearch =
        !this.searchTerm ||
        faq.questionAr.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        faq.answerAr.toLowerCase().includes(this.searchTerm.toLowerCase())

      const matchesCategory = !this.selectedCategory || faq.category === this.selectedCategory

      return matchesSearch && matchesCategory
    })
  }

  toggleFaq(faqId: number) {
    this.expandedFaq = this.expandedFaq === faqId ? null : faqId
  }

  getCategoryName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      shipping: "الشحن والتوصيل",
      warranty: "الضمان",
      payment: "الدفع",
      products: "المنتجات",
    }
    return categoryNames[category] || category
  }
}
