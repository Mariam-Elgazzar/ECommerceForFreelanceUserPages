export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface ShippingInfo {
  address: string;
  city: string;
  country: string;
  method: 'standard' | 'express';
  cost: number;
}

export interface PaymentInfo {
  method: 'credit_card' | 'bank_transfer' | 'cash_on_delivery';
  cardLast4?: string;
  reference?: string;
}

export interface Order {
  id: string;
  userId: number;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  shipping: ShippingInfo;
  payment: PaymentInfo;
}

export interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  rentalPeriod?: string;
  city: string;
  country: string;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash_on_delivery';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  shippingMethod: 'standard' | 'express';
}
