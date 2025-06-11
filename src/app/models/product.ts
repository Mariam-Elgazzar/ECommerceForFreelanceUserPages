export interface Product {
  id: number
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  price: number
  category: string
  categoryId: number
  image: string
  stock: number
  rating: number
  features: string[]
  featuresAr: string[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface ProductFilter {
  category?: string
  search?: string
  sortBy?: "name" | "price-low" | "price-high"
  page?: number
  limit?: number
}
