import { Injectable } from '@angular/core';
import { catchError, retry, throwError, type Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { FAQ } from '../models/category';
import {
  PaginatedResponse,
  Product,
  ProductParams,
  Result,
} from '../interfaces/product.interface';
import { Category, CategoryParams } from '../interfaces/category.interface';
export class ApiError extends Error {
  constructor(
    public status: number,
    public errorType:
      | 'validation'
      | 'not-found'
      | 'server'
      | 'network'
      | 'unknown',
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private baseUrl = environment.baseUrl || '[invalid url, do not cite]';

  private readonly errorMessages: Record<string, string> = {
    default: 'An unexpected error occurred. Please try again later.',
    validation: 'Invalid input provided. Please check your data and try again.',
    notFound: 'The requested product was not found.',
    server: 'A server error occurred. Please try again later.',
    network:
      'Unable to connect to the server. Please check your internet connection.',
    imageSize: 'Image file size exceeds 3MB.',
    imageType:
      'Invalid image file type. Allowed types: .png, .jpg, .jpeg, .webp, .svg.',
    videoSize: 'Video file size exceeds 10MB.',
    videoType:
      'Invalid video file type. Allowed types: .mp4, .webm, .mov, .mkv.',
  };
  private readonly maxRetries = 1000; // Maximum number of retries for failed requests

  constructor(private http: HttpClient) {}

  getAllProducts(
    params: ProductParams = { pageIndex: 1, pageSize: 10 }
  ): Observable<PaginatedResponse<Product>> {
    let httpParams = new HttpParams()
      .set('pageIndex', params.pageIndex.toString())
      .set('pageSize', Math.min(params.pageSize, 10).toString())
      .set('search', params.search ?? '');
    // .set('description', params.description ?? '');
    if (params.attributesFilter) {
      Object.entries(params.attributesFilter).forEach(([key, value]) => {
        httpParams = httpParams.set(`attributesFilter[${key}]`, value);
      });
    }
    if (params.categoryId)
      httpParams = httpParams.set('categoryId', params.categoryId.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.brand) httpParams = httpParams.set('brand', params.brand);
    if (params.model) httpParams = httpParams.set('model', params.model);
    if (params.quantity)
      httpParams = httpParams.set('quantity', params.quantity.toString());
    if (params.sortProp)
      httpParams = httpParams.set('sortProp', params.sortProp);
    if (params.sortDirection)
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    console.log(params);

    return this.http
      .get<PaginatedResponse<Product>>(
        `${this.baseUrl}/Products/GetAllProducts`,
        {
          params: httpParams,
        }
      )
      .pipe(
        retry({ count: this.maxRetries }),
        catchError((error) =>
          this.handleError(error, 'getAllProducts', {
            search: params.search,
            categoryId: params.categoryId,
            pageIndex: params.pageIndex,
            pageSize: params.pageSize,
          })
        )
      );
  }

  readProductById(id: number): Observable<Product> {
    if (id < 1) {
      return throwError(
        () =>
          new ApiError(
            400,
            'validation',
            'Product ID must be a positive integer.'
          )
      );
    }

    return this.http
      .get<Product>(`${this.baseUrl}/Products/GetById/${id}`)
      .pipe(
        retry({ count: this.maxRetries }),
        catchError((error) =>
          this.handleError(error, 'readProductById', { id })
        )
      );
  }
  getAllCategories(
    params: CategoryParams
  ): Observable<PaginatedResponse<Category>> {
    let httpParams = new HttpParams()
      .set('pageIndex', params.pageIndex.toString())
      .set('pageSize', params.pageSize.toString())
      .set('search', params?.search ?? '')
      .set('sortProp', params.sortProp ?? '')
      .set('sortDirection', params.sortDirection ?? '');

    return this.http
      .get<PaginatedResponse<Category>>(
        `${this.baseUrl}/Categories/GetAllCategories`,
        {
          params: httpParams,
        }
      )
      .pipe(
        retry({ count: this.maxRetries }),
        catchError((error) =>
          this.handleError(error, 'getAllCategories', {
            pageIndex: params.pageIndex,
            pageSize: params.pageSize,
          })
        )
      );
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http
      .get<Category>(`${this.baseUrl}/Categories/GetCategoryById/${id}`)
      .pipe(
        retry({ count: this.maxRetries, delay: 1000 }),
        catchError((error) =>
          this.handleError(error, 'readCategoryById', { id })
        )
      );
  }
  private handleError(
    error: HttpErrorResponse,
    operation: string,
    context: unknown
  ): Observable<never> {
    let errorType: ApiError['errorType'] = 'unknown';
    let message = this.errorMessages['default'];
    const details = {
      operation,
      ...(typeof context === 'object' && context !== null ? context : {}),
      backendError: error.error,
    };

    if (!error.status) {
      errorType = 'network';
      message = this.errorMessages['network'];
    } else if (error.status === 400) {
      errorType = 'validation';
      message =
        (error.error as Result)?.message ?? this.errorMessages['validation'];
    } else if (error.status === 404) {
      errorType = 'not-found';
      message =
        (error.error as Result)?.message ?? this.errorMessages['notFound'];
    } else if (error.status >= 500) {
      errorType = 'server';
      message =
        (error.error as Result)?.message ?? this.errorMessages['server'];
    }

    console.error(`[${operation}] API Error:`, {
      status: error.status,
      errorType,
      message,
      details,
    });

    return throwError(
      () => new ApiError(error.status, errorType, message, details)
    );
  }

  // FAQ endpoints
  getFaqs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`${this.apiUrl}/faqs`);
  }
}
