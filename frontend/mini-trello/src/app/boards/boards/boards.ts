import { Component, OnInit } from '@angular/core';

import { Board } from '../models/board';
import { BoardService } from '../../core/services/board.service';

@Component({
  selector: 'app-boards',
  standalone: false,
  templateUrl: './boards.html',
  styleUrl: './boards.scss',
})
export class Boards implements OnInit {

  boards: Board[] = [];

  showIds = false;

  constructor(
    private boardService: BoardService
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
}
