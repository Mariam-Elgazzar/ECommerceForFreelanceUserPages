import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';

// Interface for the brand response
export interface Brand {
  name: string;
}

// Service interface definition
export interface BrandServiceInterface {
  getAllBrands(): Observable<Brand[]>;
}

@Injectable({
  providedIn: 'root',
})
export class BrandService implements BrandServiceInterface {
  private readonly apiUrl = environment.baseUrl + '/Brands/GetAllBrands';

  constructor(private http: HttpClient) {}

  getAllBrands(): Observable<Brand[]> {
    return this.http
      .get<string[]>(this.apiUrl, {
        headers: {
          accept: '*/*',
        },
      })
      .pipe(
        map((brands) => brands.map((name) => ({ name }))),
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
