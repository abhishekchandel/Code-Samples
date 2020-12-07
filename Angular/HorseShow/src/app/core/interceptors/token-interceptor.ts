import { Injectable } from '@angular/core';
import { LocalStorageService } from '../services/local-storage.service';

import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private localStorageService: LocalStorageService) { }

  intercept(

    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Content Type Header
    if (request.method == "POST") {
      request = request.clone({
        setHeaders: {
          "Content-Type": "application/json"
        }
      });
    }

    // add authorization header with jwt token if available
    const isLoggedIn = this.localStorageService.isAuthenticated();
    if (isLoggedIn) {
      const token = this.localStorageService.getAuthorizationToken();
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
