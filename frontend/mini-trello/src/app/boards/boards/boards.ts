import { Component, OnInit } from '@angular/core';

import { Board } from '../models/board';
import { BoardService } from '../../core/services/board.service';

import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

import { CreateBoardRequest } from '../models/create-board-request';

import {
  FormControl,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-boards',
  standalone: false,
  templateUrl: './boards.html',
  styleUrl: './boards.scss',
})
export class Boards implements OnInit {

  boards: Board[] = [];

  showIds = false;

  creatingBoard = false;

  constructor(
    private boardService: BoardService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.boardService
      .findAll()
      .subscribe({

        next: boards => {

          this.boards = boards;

          console.log(
            'Boards carregados:',
            boards
          );
        },

        error: error => {

          console.error(
            'Erro ao carregar boards:',
            error
          );
        }

      });
  }

  toggleIds(): void {
    this.showIds = !this.showIds;
  }

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);
  }

  newBoardTitle = new FormControl(
    '',
    {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }
  );

  createBoard(): void {

    if (this.creatingBoard) {
      return;
    }

    if (this.newBoardTitle.invalid) {
      this.newBoardTitle.markAsTouched();
      return;
    }

    const title = this.newBoardTitle.value.trim();

    if (!title) {
      this.newBoardTitle.setErrors({
        required: true
      });

      this.newBoardTitle.markAsTouched();

      return;
    }

    const request: CreateBoardRequest = {
      title
    };

    this.creatingBoard = true;

    this.boardService
      .create(request)
      .subscribe({

        next: board => {

          this.boards.push(board);

          this.newBoardTitle.reset();

          this.creatingBoard = false;

          console.log(
            'Board criado:',
            board
          );
        },

        error: error => {

          this.creatingBoard = false;

          console.error(
            'Erro ao criar board:',
            error
          );
        }

      });
  }

  openBoard(boardId: string): void {

    this.router.navigate([
      '/boards',
      boardId
    ]);
  }
}
