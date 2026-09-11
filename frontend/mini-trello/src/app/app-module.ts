import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Login } from './auth/login/login';

import { ReactiveFormsModule } from '@angular/forms';

import { authInterceptor } from './core/interceptors/auth.interceptor';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Boards } from './boards/boards/boards';

import { MatCardModule } from '@angular/material/card';
import { BoardDetails } from './boards/board-details/board-details';


@NgModule({
  declarations: [
    App,
    Login,
    Boards,
    BoardDetails
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    )
  ],
  bootstrap: [App]
})
export class AppModule { }
