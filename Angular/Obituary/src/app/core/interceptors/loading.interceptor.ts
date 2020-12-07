import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  activeRequests: number = 0;


  // URLs for which the loading screen should not be enabled
  skippUrls = [
      '/your-urls',
  ];
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let displayLoadingScreen = true;
    for (const skippUrl of this.skippUrls) {
        if (new RegExp(skippUrl).test(request.url)) {
            displayLoadingScreen = false;
            break;
        }
    }
    return next.handle(request);
}
}
