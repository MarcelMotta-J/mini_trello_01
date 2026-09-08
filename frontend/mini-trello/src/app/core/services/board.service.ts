import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor(
    private http: HttpClient
  ) {}

  findAll(): Observable<unknown> {

    return this.http.get(
      API_ENDPOINTS.BOARDS
    );
  }
}
