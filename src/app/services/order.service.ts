import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';

// Interface for the checkout request payload
export interface CheckoutRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  rentalPeriod?: string;
  status: string;
  productId: number;
}

// Interface for the checkout response
export interface CheckoutResponse {
  isSuccess: boolean;
  message: string;
  data: null | any;
}

// Service interface definition
export interface OrderServiceInterface {
  checkout(order: CheckoutRequest): Observable<CheckoutResponse>;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService implements OrderServiceInterface {
  private readonly apiUrl = environment.baseUrl + '/Orders/Checkout';

  constructor(private http: HttpClient) {}

  checkout(order: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http
      .post<CheckoutResponse>(this.apiUrl, order, {
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        map((response) => ({
          ...response,
          isSuccess: response.isSuccess,
          message: response.message,
          data: response.data,
        })),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
