import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Card } from '../../cards/models/card';
import { API_ENDPOINTS } from '../api.config';

import { CreateCardRequest } from '../../cards/models/create-card-request';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(
    private http: HttpClient
  ) { }

  findAllByColumnId(
    boardId: string,
    columnId: string
  ): Observable<Card[]> {

    return this.http.get<Card[]>(
      API_ENDPOINTS.CARDS(
        boardId,
        columnId
      )
    );
  }

  create(
    boardId: string,
    columnId: string,
    request: CreateCardRequest
  ): Observable<Card> {

    return this.http.post<Card>(
      API_ENDPOINTS.CARDS(
        boardId,
        columnId
      ),
      request
    );
  }
}
