import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../enviroments/enviroment';

export interface LoginResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  message: string;
  token: string;
  roles: string; // Single role as "User" or "Admin"
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.baseUrl || '[invalid url, do not cite]';
  private tokenKey = 'auth_token';
  private rolesKey = 'auth_roles';
  private userKey = 'auth_user';
  private firstLoginKey = 'first_login';
  public redirectUrl: string | null = null;

  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    this.loadUserFromToken();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/Authentication/Login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          this.setToken(response.token);
          this.setUser({
            id: response.id,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            roles: response.roles,
            address: response.address,
            phoneNumber: response.phoneNumber,
            message: response.message,
            token: response.token,
          });
          localStorage.setItem(this.firstLoginKey, 'false');
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.rolesKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.firstLoginKey);
    this.redirectUrl = null;
    this.router.navigate(['/login']);
  }

  register(
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    address: string,
    password: string
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/Authentication/Register`, {
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        password,
      })
      .pipe(
        tap((response) => {
          this.setToken(response.token);
          this.setUser({
            id: response.id,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            roles: response.roles,
            address: response.address,
            phoneNumber: response.phoneNumber,
            message: response.message,
            token: response.token,
          });
          localStorage.setItem(this.firstLoginKey, 'false');
        }),
        catchError(this.handleError)
      );
  }
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  hasRole(role: string): boolean {
    const storedRole = this.getRoles();
    return storedRole === role;
  }

  getCurrentUser(): LoginResponse | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRoles(): string | null {
    return localStorage.getItem(this.rolesKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  setUser(user: LoginResponse): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    const user = this.getCurrentUser();
    if (token && this.isAuthenticated() && user) {
      // User is already loaded
    } else {
      this.logout();
    }
  }

  resetPassword(
    email: string,
    token: string,
    password: string
  ): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/Authentication/resetPassword`,
        { email, token, password }
      )
      .pipe(catchError(this.handleError));
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/Authentication/forgetPassword`,
        { email }
      )
      .pipe(catchError(this.handleError));
  }

  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Observable<{ message: string }> {
    const user = this.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/Authentication/changePassword`,
        {
          userId: userId,
          oldPassword,
          newPassword,
        }
      )
      .pipe(catchError(this.handleError));
  }
  updateProfile(
    fName: string,
    lName: string,
    email: string,
    phoneNumber: string,
    address: string
  ): Observable<LoginResponse> {
    const user = this.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http
      .put<LoginResponse>(`${this.apiUrl}/Users/UpdateUser/${user.id}`, {
        id: user.id,
        fName,
        lName,
        email,
        phoneNumber,
        address,
      })
      .pipe(
        tap((response) => {
          this.setUser({
            ...user,
            firstName: fName,
            lastName: lName,
            email: email,
            phoneNumber: phoneNumber,
            address: address,
            message: response.message,
            token: response.token,
            roles: response.roles,
          });
        }),
        catchError(this.handleError)
      );
  }
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden.';
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
