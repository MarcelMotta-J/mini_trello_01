import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { Board } from '../models/board';
import { BoardService } from '../../core/services/board.service';

import { Column } from '../../columns/models/column';
import { ColumnService } from '../../core/services/column.service';

import { Card } from '../../cards/models/card';
import { CardService } from '../../core/services/card.service';

import { FormControl, Validators } from '@angular/forms';
import { CreateColumnRequest } from '../../columns/models/create-column-request';

import { CreateCardRequest } from '../../cards/models/create-card-request';

@Component({
  selector: 'app-board-details',
  standalone: false,
  templateUrl: './board-details.html',
  styleUrl: './board-details.scss',
})
export class BoardDetails implements OnInit {

  boardId = '';

  board: Board | null = null;

  columns: Column[] = [];

  cardsByColumn: Record<string, Card[]> = {};

  newColumnTitle = new FormControl(
    '',
    {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }
  );

  creatingColumn = false;

  newCardTitles: Record<string, FormControl<string>> = {};

  creatingCardByColumn: Record<string, boolean> = {};

  newCardDescriptions: Record<string, FormControl<string>> = {};

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService,
    private columnService: ColumnService,
    private cardService: CardService
  ) { }

  ngOnInit(): void {

    this.boardId =
      this.route.snapshot.paramMap.get('boardId') ?? '';

    console.log(
      'Board ID:',
      this.boardId
    );

    this.boardService
      .findById(this.boardId)
      .subscribe({

        next: board => {

          this.board = board;

          console.log(
            'Board carregado:',
            board
          );
        },

        error: error => {

          console.error(
            'Erro ao carregar board:',
            error
          );
        }

      });

    this.columnService
      .findAllByBoardId(this.boardId)
      .subscribe({

        next: columns => {

          this.columns = [...columns].sort(
            (a, b) => a.position - b.position
          );

          console.log(
            'Columns carregadas:',
            columns
          );

          for (const column of this.columns) {

            // Prepara o formulário de Novo Card
            // para cada Column que veio do backend.
            this.newCardTitles[column.id] = new FormControl(
              '',
              {
                nonNullable: true,
                validators: [
                  Validators.required
                ]
              }
            );

            this.newCardDescriptions[column.id] = new FormControl(
              '',
              {
                nonNullable: true
              }
            );

            this.creatingCardByColumn[column.id] = false;

            this.cardService
              .findAllByColumnId(
                this.boardId,
                column.id
              )
              .subscribe({

                next: cards => {

                  this.cardsByColumn[column.id] =
                    [...cards].sort(
                      (a, b) => a.position - b.position
                    );

                  console.log(
                    `Cards da column ${column.title}:`,
                    this.cardsByColumn[column.id]
                  );
                },

                error: error => {

                  console.error(
                    `Erro ao carregar cards da column ${column.title}:`,
                    error
                  );
                }

              });
          }
        },

        error: error => {

          console.error(
            'Erro ao carregar columns:',
            error
          );
        }

      });
  }

  createColumn(): void {

    if (this.creatingColumn) {
      return;
    }

    if (this.newColumnTitle.invalid) {
      this.newColumnTitle.markAsTouched();
      return;
    }

    const title = this.newColumnTitle.value.trim();

    if (!title) {

      this.newColumnTitle.setErrors({
        required: true
      });

      this.newColumnTitle.markAsTouched();

      return;
    }

    const nextPosition =
      this.columns.length === 0
        ? 0
        : Math.max(
          ...this.columns.map(
            column => column.position
          )
        ) + 1;

    const request: CreateColumnRequest = {
      title,
      position: nextPosition
    };

    this.creatingColumn = true;

    this.columnService
      .create(
        this.boardId,
        request
      )
      .subscribe({

        next: column => {

          this.columns = [
            ...this.columns,
            column
          ].sort(
            (a, b) => a.position - b.position
          );


          this.newCardTitles[column.id] = new FormControl(
            '',
            {
              nonNullable: true,
              validators: [
                Validators.required
              ]
            }
          );

          this.newCardDescriptions[column.id] = new FormControl(
            '',
            {
              nonNullable: true
            }
          );

          this.creatingCardByColumn[column.id] = false;

          this.cardsByColumn[column.id] = [];

          this.newColumnTitle.reset();

          this.creatingColumn = false;

          console.log(
            'Column criada:',
            column
          );
        },

        error: error => {

          this.creatingColumn = false;

          console.error(
            'Erro ao criar column:',
            error
          );
        }

      });
  }

  createCard(columnId: string): void {

    const control =
      this.newCardTitles[columnId];

    const descriptionControl =
      this.newCardDescriptions[columnId];

    if (!control) {
      return;
    }

    if (!descriptionControl) {
      return;
    }

    if (this.creatingCardByColumn[columnId]) {
      return;
    }

    if (control.invalid) {
      control.markAsTouched();
      return;
    }

    const title = control.value.trim();

    const description =
      descriptionControl.value.trim();

    if (!title) {

      control.setErrors({
        required: true
      });

      control.markAsTouched();

      return;
    }

    const cards =
      this.cardsByColumn[columnId] ?? [];

    const nextPosition =
      cards.length === 0
        ? 0
        : Math.max(
          ...cards.map(
            card => card.position
          )
        ) + 1;

    const request: CreateCardRequest = {
      title,
      description,
      position: nextPosition,
      dueDate: null
    };

    this.creatingCardByColumn[columnId] = true;

    this.cardService
      .create(
        this.boardId,
        columnId,
        request
      )
      .subscribe({

        next: card => {

          this.cardsByColumn[columnId] = [
            ...cards,
            card
          ].sort(
            (a, b) => a.position - b.position
          );

          control.reset();

          descriptionControl.reset();

          this.creatingCardByColumn[columnId] = false;

          console.log(
            'Card criado:',
            card
          );
        },

        error: error => {

          this.creatingCardByColumn[columnId] = false;

          console.error(
            'Erro ao criar card:',
            error
          );
        }

      });
  }


}
