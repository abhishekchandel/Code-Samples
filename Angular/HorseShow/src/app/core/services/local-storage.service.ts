import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  LOCALSTORAGE_TOKEN_KEY: string = 'AuthToken';
  LOCALSTORAGE_FORGOT_TOKEN_KEY: string = 'ForgotToken';
  LOCALSTORAGE_USER_DETAIL_KEY: string = 'UserDetails';
  LOCALSTORAGE_USER_CREDENTIALS_KEY: string = 'UserCredentials';

  constructor(private router: Router) { }

  storeAuthToken(token) {
    localStorage.setItem(this.LOCALSTORAGE_TOKEN_KEY, token);
  }
  storeForgotToken(token) {
    localStorage.setItem(this.LOCALSTORAGE_FORGOT_TOKEN_KEY, token);
  }

  removeAuthToken() {
    localStorage.removeItem(this.LOCALSTORAGE_TOKEN_KEY);
  }

  getAuthorizationToken() {
    return localStorage.getItem(this.LOCALSTORAGE_TOKEN_KEY);
  }
  getForgotToken() {
    return localStorage.getItem(this.LOCALSTORAGE_FORGOT_TOKEN_KEY);
  }


  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.LOCALSTORAGE_TOKEN_KEY);
    if (token && token != '') {
      return true;
    }
    return false;
  }

  storeUserDetail(data) {
    localStorage.setItem(this.LOCALSTORAGE_USER_DETAIL_KEY, JSON.stringify(data));
  }

  getUserDetail() {
    let userDetailData = localStorage.getItem(this.LOCALSTORAGE_USER_DETAIL_KEY);

    if (userDetailData)
      return JSON.parse(userDetailData);

    return { UserName: "", Password: "" };
  }

  storeUserCredentials(data) {

    localStorage.setItem(this.LOCALSTORAGE_USER_CREDENTIALS_KEY, JSON.stringify(data));
  }
  getUserCredentials() {
    let userCredentials = localStorage.getItem(this.LOCALSTORAGE_USER_CREDENTIALS_KEY);

    if (userCredentials)
      return JSON.parse(userCredentials);


    return { UserName: "", Password: "" };
  }

  logout() {
    localStorage.removeItem(this.LOCALSTORAGE_TOKEN_KEY);
    localStorage.removeItem(this.LOCALSTORAGE_USER_DETAIL_KEY);
    localStorage.removeItem(this.LOCALSTORAGE_USER_CREDENTIALS_KEY);
    this.router.navigateByUrl("/login");
  }
}
