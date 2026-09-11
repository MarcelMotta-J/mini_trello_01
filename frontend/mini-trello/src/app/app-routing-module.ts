import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Login } from './auth/login/login';

import { Boards } from './boards/boards/boards';

import { authGuard } from './core/guards/auth.guard';

import { BoardDetails } from './boards/board-details/board-details';

const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'boards',
    component: Boards,
    canActivate: [authGuard]
  },
  {
    path: 'boards/:boardId',
    component: BoardDetails,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
