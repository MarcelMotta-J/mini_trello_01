import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { API_ENDPOINTS } from '../api.config';
import { LoginRequest } from '../../auth/models/login-request';
import { LoginResponse } from '../../auth/models/login-response';
import { RegisterRequest } from '../../auth/models/register-request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'mini_trello_token';
  private readonly EMAIL_KEY = 'mini_trello_email';

  constructor(
    private http: HttpClient
  ) {}

  login(request: LoginRequest): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        API_ENDPOINTS.AUTH_LOGIN,
        request
      )
      .pipe(
        tap(response => {
          localStorage.setItem(
            this.TOKEN_KEY,
            response.token
          );

          localStorage.setItem(
            this.EMAIL_KEY,
            response.email
          );
        })
      );
  }

  register(request: RegisterRequest): Observable<unknown> {

    return this.http.post(
      API_ENDPOINTS.AUTH_REGISTER,
      request
    );
  }

  logout(): void {

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
  }

  getToken(): string | null {

    return localStorage.getItem(this.TOKEN_KEY);
  }

  getEmail(): string | null {

    return localStorage.getItem(this.EMAIL_KEY);
  }

  isLoggedIn(): boolean {

    return this.getToken() !== null;
  }
}
