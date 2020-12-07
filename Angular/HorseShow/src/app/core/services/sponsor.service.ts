import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import{SponsorInformationViewModel} from '../models/sponsor-model'
import{SponsorViewModel} from '../models/sponsor-model'
import { BaseUrl } from '../../config/url-config';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SponsorService {

  // api = BaseUrl.baseApiUrl;
  api =environment.baseApiUrl;

  constructor(private http: HttpClient) { }

  getSponsor(id:number){
  return this.http.get<any>(`${this.api}SponsorAPI/GetSponsorById?sponsorId=${id}`);
  }

  addUpdateSponsor(data){
    return this.http.post<any>(this.api +'SponsorAPI/AddUpdateSponsor',data);
  }
  
  getAllSponsers(data){
    return this.http.post<any>(`${this.api}SponsorAPI/GetAllSponsors`,data);
  }
  
  getAllTypes(type:string){
    return this.http.get<any>(`${this.api}CommonAPI/GetGlobalCode?categoryName=${type}`);
  }
  getAllSponsorAdTypes(){
    return this.http.get<any>(`${this.api}ExhibitorAPI/GetSponsorAdTypes`);
  }

  deleteSponsor(id:number){
    return this.http.delete<any>(`${this.api}SponsorAPI/DeleteSponsor?sponsorId=${id}`);
  }
  deleteSponsorExhibitor(SponsorExhibitorId:number){
    return this.http.delete<any>(`${this.api}SponsorExhibitorAPI/DeleteSponsorExhibitor?SponsorExhibitorId=${SponsorExhibitorId}`);
  }
  getCities(stateId:number){
    return this.http.get<any>(`${this.api}CommonAPI/GetCities?stateId=${stateId}`);
  }
  getAllStates(){
    return this.http.get<any>(`${this.api}CommonAPI/GetStates`,{});
  }
  getZipCodes(data) {
    return this.http.post<any>(this.api + 'CommonAPI/GetZipCodes', data);
  }
  GetSponsorExhibitorBySponsorId(sponsorId:number){
    return this.http.get<any>(`${this.api}SponsorExhibitorAPI/GetSponsorExhibitorBySponsorId?SponsorId=${sponsorId}`);
  }
  GetSponsorClasses(sponsorId:number){
    return this.http.get<any>(`${this.api}ClassSponsorAPI/GetSponsorClassesbySponsorId?SponsorId=${sponsorId}`);
  }
  DeleteSponsorClasse(ClassSponsorId:number){
    return this.http.delete<any>(`${this.api}ClassSponsorAPI/DeleteClassSponsor?ClassSponsorId=${ClassSponsorId}`);
  }
 
  GetClassExhibitorsAndHorses(ClassId:number){
    return this.http.get<any>(`${this.api}ClassAPI/GetClassExhibitorsAndHorses?ClassId=${ClassId}`);
  }

  AddUpdateSponsorExhibitor(data){
    
    return this.http.post<any>(this.api +'SponsorExhibitorAPI/AddUpdateSponsorExhibitor',data);
  }
  AddUpdateSponsorClass(data){
    
    return this.http.post<any>(this.api +'ClassSponsorAPI/AddUpdateClassSponsor',data);
  }

 
}

