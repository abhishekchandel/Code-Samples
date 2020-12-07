import { Injectable } from '@angular/core';
import { BaseUrl } from 'src/app/config/url-config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  api = BaseUrl.baseApiUrl;
  assetsUrl = BaseUrl.assetsUrl;
  constructor(private http: HttpClient) { }

  getServerFileUrl(path): string {
    return this.assetsUrl + path;
  }


  getAllStates(): Observable<any> {
    return this.http.post<any>(this.api + 'CommonAPI/GetStates', {});
  }
  getAllCities(data): Observable<any> {
    return this.http.post<any>(this.api + 'CommonAPI/GetCities?StateId=' + data, "");
  }
  getImageTypes(): Observable<any> {
    return this.http.post<any>(this.api + 'CommonAPI/GetPhotoTypeImages', {});
  }
  getEmblems(): Observable<any> {
    return this.http.post<any>(this.api + 'CommonAPI/GetEmblems', {});
  }
  getServiceTypes(): Observable<any> {
    return this.http.post<any>(this.api + 'CommonAPI/GetServiceTypes', {});
  }
  createUser(data): Observable<any> {
    return this.http.post<any>(this.api + 'UserAPI/CreateUpdateUser', data);
  }
  getProfileTypes(): Observable<any> {
    return this.http.post<any>(this.api + 'CommonAPI/GetProfileType', {});
  }
  getUserByAccount(data): Observable<any> {
    return this.http.post<any>(this.api + 'UserAPI/GetAllUsers', data);
  }
  //submit obituary
  submitObituary(data): Observable<any> {
    return this.http.post<any>(this.api + 'ObituaryAPI/CreateObituary', data);
  }
  //edit the obituary
  editObituary(data): Observable<any> {
    return this.http.post<any>(this.api + 'ObituaryAPI/EditObituary', data);
  }
  //stripe payment
  submitPayment(data): Observable<any> {
    return this.http.post<any>(this.api + 'ObituaryAPI/AcceptPayment', data);
  }
  //price for the obit
  getPrice(data): Observable<any> {
    return this.http.post<any>(this.api + 'AccountAPI/Getprice', data);
  }
  //for billing information of an account holder
  getBillingInfo(data): Observable<any> {
    return this.http.post<any>(this.api + 'AccountAPI/GetBillingInfo', data);
  }
  //for maintain users
  updateUser(data): Observable<any> {
    return this.http.post<any>(this.api + 'UserAPI/UpdateUser', data);
  }
  updateAdminUser(data): Observable<any> {
    return this.http.post<any>(this.api + 'UserAPI/CreateUpdateUser', data);
  }
  deleteUser(data): Observable<any> {
    return this.http.post<any>(this.api + 'UserAPI/DeleteUser', data);
  }
  getAccountBillingHistory(data): Observable<any> {
    return this.http.post<any>(this.api + 'AccountAPI/GetAccountBilling', data);
  }
  saveBillingInfo(data): Observable<any> {
    return this.http.post<any>(this.api + 'AccountAPI/UpdateBillingInformation', data);
  }
  saveAccountComments(data,url): Observable<any> {
    return this.http.put<any>(url + '/api/AccountAPI/UpdateAccount', data);
  }
  //default price for the obit
  getObitPrice(): Observable<any> {
    return this.http.get(this.api + 'CommonAPI/GetObitPrice');
  }
  //get stripe publish key
  getStripeKey(): Observable<any> {
    return this.http.get(this.api + 'ObituaryAPI/GetStripePublishKey');
  }
  //maintain cart obits
  getCartItems(data): Observable<any> {
    return this.http.post<any>(this.api + 'ObituaryAPI/GetUsersCartItems', data);
  }
  //get all users by account id 
  getAccountsById(data): Observable<any> {
    return this.http.post<any>(this.api + 'ObituaryAPI/GetAccountUsersCart', data);
  }
  //deletes the obituary
  deleteObituary(data): Observable<any> {
    return this.http.post<any>(this.api + 'ObituaryAPI/DeleteObituary', data);
  }
  //get detailed obituary
  getObituaryById(data): Observable<any> {
    return this.http.post<any>(this.api + 'ObituaryAPI/GetObituaryById', data);
  }
  //get dashboard url for binding of the logo
  getServerUrl(): Observable<any> {
    return this.http.get(this.api + 'CommonAPI/GetDashboardUrl');
  }
}
