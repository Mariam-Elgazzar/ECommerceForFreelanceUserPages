export interface Category {
  id: number
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  image: string
  productCount: number
  slug: string
}

export interface FAQ {
  id: number
  question: string
  questionAr: string
  answer: string
  answerAr: string
  category: string
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  avatar?: string
  joinDate: string
}
