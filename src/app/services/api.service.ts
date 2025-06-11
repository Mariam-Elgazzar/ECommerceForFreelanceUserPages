import { Injectable } from "@angular/core"
import type { Observable } from "rxjs"
import { environment } from "../../enviroments/enviroment"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Product, ProductFilter } from "../models/product"
import { Category, FAQ, User } from "../models/category"
import { Order } from "../models/order"

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  // Product endpoints
  getProducts(filter?: ProductFilter): Observable<Product[]> {
    let params = new HttpParams()

    if (filter) {
      if (filter.category) params = params.set("category", filter.category)
      if (filter.search) params = params.set("q", filter.search)
      if (filter.page) params = params.set("_page", filter.page.toString())
      if (filter.limit) params = params.set("_limit", filter.limit.toString())

      if (filter.sortBy) {
        switch (filter.sortBy) {
          case "name":
            params = params.set("_sort", "name").set("_order", "asc")
            break
          case "price-low":
            params = params.set("_sort", "price").set("_order", "asc")
            break
          case "price-high":
            params = params.set("_sort", "price").set("_order", "desc")
            break
        }
      }
    }

    return this.http.get<Product[]>(`${this.apiUrl}/products`, { params })
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`)
  }

  // Category endpoints
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`)
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`)
  }

  // Order endpoints
  getOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders?userId=${userId}`)
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`)
  }

  createOrder(order: Omit<Order, "id">): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, order)
  }

  // User endpoints
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`)
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}`, user)
  }

  // FAQ endpoints
  getFaqs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`${this.apiUrl}/faqs`)
  }
}
