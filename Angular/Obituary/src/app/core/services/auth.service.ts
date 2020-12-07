import { Injectable } from '@angular/core';
import { BaseUrl } from '../../config/url-config'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    api = BaseUrl.baseApiUrl;
    constructor(private http: HttpClient
    ) { }

    login(data): Observable<any> {
        return this.http.post<any>(this.api + 'AuthAPI/Login', data);
    }
    getAccountDetails(data, url): Observable<any> {
        
        return this.http.post<any>(url + '/api/AccountAPI/GetAccountById', data);
    }
    sendResetEmail(data): Observable<any> {
        return this.http.post<any>(this.api + 'AuthAPI/ForgotPassword', data);
    }
    verifyEmailToken(data): Observable<any> {
        return this.http.post<any>(this.api + 'AuthAPI/ValidateResetPasswordToken', data);
    }
    resetPassword(data): Observable<any> {
        return this.http.post<any>(this.api + 'AuthAPI/ResetPassword', data);
    }

}

