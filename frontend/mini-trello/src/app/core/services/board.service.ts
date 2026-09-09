import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Board } from '../../boards/models/board';

import { API_ENDPOINTS } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor(
    private http: HttpClient
  ) { }

  findAll(): Observable<Board[]> {

    return this.http.get<Board[]>(
      API_ENDPOINTS.BOARDS
    );
  }
}
