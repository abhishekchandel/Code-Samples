import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseUrl } from '../../config/url-config';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdvertisementService {
  // api = BaseUrl.baseApiUrl;
  api =environment.baseApiUrl;

  constructor(private http: HttpClient) { }


  getAllAdvertisements(data){
    return this.http.post<any>(`${this.api}AdvertisementAPI/GetAllAdvertisements`,data);
  }
}
