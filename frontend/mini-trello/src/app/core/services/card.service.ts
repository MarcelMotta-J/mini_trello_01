import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Card } from '../../cards/models/card';
import { API_ENDPOINTS } from '../api.config';

import { CreateCardRequest } from '../../cards/models/create-card-request';

import { UpdateCardRequest } from '../../cards/models/update-card-request';

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

  update(
    boardId: string,
    columnId: string,
    cardId: string,
    request: UpdateCardRequest
  ): Observable<Card> {

    return this.http.put<Card>(
      API_ENDPOINTS.CARD(
        boardId,
        columnId,
        cardId
      ),
      request
    );
  }

 /**
 * TESTE MANUAL DE ROLLBACK DO DRAG & DROP
 *
 * Adicionar temporariamente '/erro-teste' à URL do método update()
 * para provocar HTTP 404 e validar o rollback visual.
 *
 * return this.http.put<Card>(
 *   API_ENDPOINTS.CARD(
 *     boardId,
 *     columnId,
 *     cardId
 *   ) + '/erro-teste',
 *   request
 * );
 *
 * Endpoint normal:
 * .../cards/{cardId}
 *
 * Endpoint para teste:
 * .../cards/{cardId}/erro-teste
 */

  delete(
    boardId: string,
    columnId: string,
    cardId: string
  ): Observable<void> {

    return this.http.delete<void>(
      API_ENDPOINTS.CARD(
        boardId,
        columnId,
        cardId
      )
    );
  }
}
