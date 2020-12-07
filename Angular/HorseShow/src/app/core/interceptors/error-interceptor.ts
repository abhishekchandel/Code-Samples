import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LocalStorageService } from "../services/local-storage.service";
import { MatSnackbarComponent } from '../../shared/ui/mat-snackbar/mat-snackbar.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private _localStorageService: LocalStorageService,
    private _route: Router, private _activatedRoute: ActivatedRoute,
    private snackBar: MatSnackbarComponent) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (err.status === 401) {
        this._localStorageService.logout();
        window.location.href = "aayhs/login";
      }

      const error = err.error.Message || err.statusText;
      return throwError(error);
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
    }));
  }
}
