import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"
import { CartService } from "../../../services/cart.service"

@Component({
  selector: "app-checkout-summary",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./checkout-summary.component.html",
  styleUrls: ["./checkout-summary.component.scss"],
})
export class CheckoutSummaryComponent {
  @Input() shippingCost = 0
  @Input() total = 0

  constructor(public cartService: CartService) {}

  getSubtotal(): number {
    return this.cartService.getTotal()
  }
}
