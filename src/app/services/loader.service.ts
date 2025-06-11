import { Injectable, signal } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class LoaderService {
  private loading = signal<boolean>(false)
  readonly isLoading = this.loading.asReadonly()

  private requestCount = 0

  show(): void {
    this.requestCount++
    this.loading.set(true)
  }

  hide(): void {
    this.requestCount--
    if (this.requestCount <= 0) {
      this.requestCount = 0
      this.loading.set(false)
    }
  }

  reset(): void {
    this.requestCount = 0
    this.loading.set(false)
  }
}
