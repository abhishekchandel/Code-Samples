import { Injectable } from '@angular/core';
import { BaseUrl } from '../../config/url-config';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HorseService {

  // api = BaseUrl.baseApiUrl;
  api =environment.baseApiUrl;

  constructor(private http: HttpClient) { }

  getAllHorses(data){
    return this.http.post<any>(`${this.api}HorseAPI/GetAllHorses`,data);
  }

  deleteHorse(id:number){
    return this.http.delete<any>(`${this.api}HorseAPI/RemoveHorse?horseId=${id}`);
  }

  createUpdateHorse(data){
    return this.http.post<any>(`${this.api}HorseAPI/AddUpdateHorse`,data);
  }

  getLinkedExhibitors(data){
    return this.http.post<any>(`${this.api}HorseAPI/LinkedExhibitors`,data);
  }

  getHorseDetails(id:number){
    return this.http.get<any>(`${this.api}HorseAPI/GetHorse?horseId=${id}`);
  }

  getGroups(){
    return this.http.get<any>(`${this.api}HorseAPI/GetGroups`);
  }

  getHorseType(data){
    return this.http.get<any>(`${this.api}CommonAPI/GetGlobalCode?categoryName=${data}`);
  }

  getJumpHeight(data){
    return this.http.get<any>(`${this.api}CommonAPI/GetGlobalCode?categoryName=${data}`);
  }
}
