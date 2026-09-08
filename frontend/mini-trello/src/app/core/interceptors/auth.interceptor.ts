import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {

  const token =
    localStorage.getItem('mini_trello_token');

  if (token) {

    const authenticatedRequest =
      request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

    return next(authenticatedRequest);
  }

  return next(request);
};
