import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseUrl } from '../../config/url-config'
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // api = BaseUrl.baseApiUrl;
  api =environment.baseApiUrl;

  constructor(private http: HttpClient) { }

  login(data): Observable<any> {
    return this.http.post<any>(this.api + 'UserAPI/LoginUser', data);
}

register(data): Observable<any> {
  return this.http.post<any>(this.api + 'UserAPI/CreateNewAccount', data);
}

getAccountDetails(data): Observable<any> {
    return this.http.post<any>(this.api + 'UserAPI/GetAccountById', data);
}
sendResetEmail(data): Observable<any> {
  debugger;
    return this.http.post<any>(this.api + 'UserAPI/ForgotPassword', data);
}
verifyEmailToken(data): Observable<any> {
    return this.http.post<any>(this.api + 'UserAPI/ValidateResetPasswordToken', data);
}
resetPassword(data): Observable<any> {
    return this.http.post<any>(this.api + 'UserAPI/ChangePassword', data);
}
}
