import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Column } from '../../columns/models/column';
import { API_ENDPOINTS } from '../api.config';

import { CreateColumnRequest } from '../../columns/models/create-column-request';

@Injectable({
  providedIn: 'root'
})
export class ColumnService {

  constructor(
    private http: HttpClient
  ) { }

  findAllByBoardId(
    boardId: string
  ): Observable<Column[]> {

    return this.http.get<Column[]>(
      API_ENDPOINTS.COLUMNS(boardId)
    );
  }

  create(
    boardId: string,
    request: CreateColumnRequest
  ): Observable<Column> {

    return this.http.post<Column>(
      API_ENDPOINTS.COLUMNS(boardId),
      request
    );
  }
}
