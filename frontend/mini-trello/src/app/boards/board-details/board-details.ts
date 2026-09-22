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

import { UpdateCardRequest } from '../../cards/models/update-card-request';

import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';

import { MatSnackBar } from '@angular/material/snack-bar';

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

  newCardDueDates: Record<string, FormControl<Date | null>> = {};

  editingCardId: string | null = null;

  editCardTitles: Record<string, FormControl<string>> = {};

  editCardDescriptions: Record<string, FormControl<string>> = {};

  editCardDueDates: Record<string, FormControl<Date | null>> = {};

  updatingCardById: Record<string, boolean> = {};

  deletingCardById: Record<string, boolean> = {};

  savingCardById: Record<string, boolean> = {};

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService,
    private columnService: ColumnService,
    private cardService: CardService,
    private snackBar: MatSnackBar
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

            // Inicializa a lista para evitar undefined
            // enquanto os Cards ainda estão sendo carregados.
            this.cardsByColumn[column.id] = [];

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

            this.newCardDueDates[column.id] =
              new FormControl<Date | null>(null);

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

    const dueDateControl =
      this.newCardDueDates[columnId];

    if (!control) {
      return;
    }

    if (!descriptionControl) {
      return;
    }

    if (!dueDateControl) {
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

    const dueDateValue =
      dueDateControl.value;

    const dueDate =
      dueDateValue
        ? new Date(
          Date.UTC(
            dueDateValue.getFullYear(),
            dueDateValue.getMonth(),
            dueDateValue.getDate()
          )
        ).toISOString()
        : null;

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
      dueDate
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

          dueDateControl.reset();

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

  startEditCard(card: Card): void {

    this.editingCardId = card.id;

    this.editCardTitles[card.id] = new FormControl(
      card.title,
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    );

    this.editCardDescriptions[card.id] = new FormControl(
      card.description,
      {
        nonNullable: true
      }
    );

    this.editCardDueDates[card.id] =
      new FormControl<Date | null>(
        card.dueDate
          ? new Date(card.dueDate)
          : null
      );

    this.updatingCardById[card.id] = false;
  }

  cancelEditCard(): void {
    this.editingCardId = null;
  }

  saveEditCard(
    columnId: string,
    card: Card
  ): void {

    const titleControl =
      this.editCardTitles[card.id];

    const descriptionControl =
      this.editCardDescriptions[card.id];

    const dueDateControl =
      this.editCardDueDates[card.id];

    if (
      !titleControl ||
      !descriptionControl ||
      !dueDateControl
    ) {
      return;
    }

    if (this.updatingCardById[card.id]) {
      return;
    }

    if (titleControl.invalid) {
      titleControl.markAsTouched();
      return;
    }

    const title =
      titleControl.value.trim();

    if (!title) {

      titleControl.setErrors({
        required: true
      });

      titleControl.markAsTouched();

      return;
    }

    const description =
      descriptionControl.value.trim();

    const dueDateValue =
      dueDateControl.value;

    const dueDate =
      dueDateValue
        ? new Date(
          Date.UTC(
            dueDateValue.getFullYear(),
            dueDateValue.getMonth(),
            dueDateValue.getDate()
          )
        ).toISOString()
        : null;

    const request: UpdateCardRequest = {
      columnId,
      title,
      description,
      position: card.position,
      dueDate
    };

    this.updatingCardById[card.id] = true;

    this.cardService
      .update(
        this.boardId,
        columnId,
        card.id,
        request
      )
      .subscribe({

        next: updatedCard => {

          this.cardsByColumn[columnId] =
            this.cardsByColumn[columnId].map(
              currentCard =>
                currentCard.id === updatedCard.id
                  ? updatedCard
                  : currentCard
            );

          this.updatingCardById[card.id] = false;

          this.editingCardId = null;

          console.log(
            'Card atualizado:',
            updatedCard
          );
        },

        error: error => {

          this.updatingCardById[card.id] = false;

          console.error(
            'Erro ao atualizar card:',
            error
          );
        }

      });
  }

  deleteCard(
    columnId: string,
    card: Card
  ): void {

    const confirmed = window.confirm(
      `Excluir o card "${card.title}"?`
    );

    if (!confirmed) {
      return;
    }

    if (this.deletingCardById[card.id]) {
      return;
    }

    this.deletingCardById[card.id] = true;

    this.cardService
      .delete(
        this.boardId,
        columnId,
        card.id
      )
      .subscribe({

        next: () => {

          this.cardsByColumn[columnId] =
            this.cardsByColumn[columnId].filter(
              currentCard =>
                currentCard.id !== card.id
            );

          this.deletingCardById[card.id] = false;

          console.log(
            'Card excluído:',
            card.id
          );
        },

        error: error => {

          this.deletingCardById[card.id] = false;

          console.error(
            'Erro ao excluir card:',
            error
          );
        }

      });
  }

  dropCard(
    event: CdkDragDrop<Card[]>,
    targetColumnId: string
  ): void {

    const sameColumn =
      event.previousContainer === event.container;

    if (
      sameColumn &&
      event.previousIndex === event.currentIndex
    ) {
      return;
    }

    const sourceCards = [
      ...event.previousContainer.data
    ];

    const targetCards = sameColumn
      ? sourceCards
      : [...event.container.data];

    const movedCard =
      sourceCards[event.previousIndex];

    const sourceColumnId =
      movedCard.columnId;

    // Snapshot para rollback em caso de erro no backend.
    const originalSourceCards =
      sourceCards.map(card => ({ ...card }));

    const originalTargetCards =
      sameColumn
        ? originalSourceCards
        : targetCards.map(card => ({ ...card }));

    if (sameColumn) {

      moveItemInArray(
        sourceCards,
        event.previousIndex,
        event.currentIndex
      );

      sourceCards.forEach(
        (card, index) => {
          card.position = index;
        }
      );

      this.cardsByColumn[targetColumnId] =
        sourceCards;

    } else {

      transferArrayItem(
        sourceCards,
        targetCards,
        event.previousIndex,
        event.currentIndex
      );

      sourceCards.forEach(
        (card, index) => {
          card.position = index;
        }
      );

      targetCards.forEach(
        (card, index) => {
          card.position = index;
        }
      );

      movedCard.columnId =
        targetColumnId;

      this.cardsByColumn[sourceColumnId] =
        sourceCards;

      this.cardsByColumn[targetColumnId] =
        targetCards;
    }

    const request: UpdateCardRequest = {
      columnId: targetColumnId,
      title: movedCard.title,
      description: movedCard.description,
      position: event.currentIndex,
      dueDate: movedCard.dueDate
    };

    this.savingCardById[movedCard.id] = true;

    this.cardService
      .update(
        this.boardId,
        sourceColumnId, // Column atual no endpoint
        movedCard.id,
        request         // request.columnId = destino
      )
      .subscribe({

        next: updatedCard => {

          this.savingCardById[movedCard.id] = false;

          console.log(
            sameColumn
              ? 'Reorder persistido:'
              : 'Move entre columns persistido:',
            updatedCard
          );

          this.snackBar.open(
            sameColumn
              ? 'Ordem do card salva.'
              : 'Card movido com sucesso.',
            'Fechar',
            {
              duration: 3000,
              panelClass: ['snackbar-success']
            }
          );
        },

        error: error => {

          console.error(
            'Erro ao persistir drag and drop:',
            error
          );

          if (sameColumn) {

            this.cardsByColumn[sourceColumnId] =
              originalSourceCards;

          } else {

            this.cardsByColumn[sourceColumnId] =
              originalSourceCards;

            this.cardsByColumn[targetColumnId] =
              originalTargetCards;
          }

          this.savingCardById[movedCard.id] = false;

          console.log(
            'Rollback do drag and drop realizado.'
          );

          this.snackBar.open(
            'Não foi possível salvar o movimento.',
            'Fechar',
            {
              duration: 4000,
              panelClass: ['snackbar-error']
            }
          );
        }

      });
  }
}
