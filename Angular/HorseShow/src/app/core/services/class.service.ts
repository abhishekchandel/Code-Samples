import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseUrl } from '../../config/url-config';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ClassService {

  // api = BaseUrl.baseApiUrl;
  api =environment.baseApiUrl;

  constructor(private http: HttpClient) { }


  getAllClasses(data){
    return this.http.post<any>(`${this.api}ClassAPI/GetAllClasses`,data);
  }

  deleteSponsor(id:number){
    return this.http.delete<any>(`${this.api}ClassAPI/RemoveClass?sponsorId=${id}`);
  }

  getClassById(id:number){
    return this.http.get<any>(`${this.api}ClassAPI/GetClass?classId=${id}`);
  }

  getClassExhibitors(id:number){
    return this.http.get<any>(`${this.api}ClassAPI/GetClassExhibitors?classId=${id}`);
  }

  createUpdateClass(data){
    return this.http.post<any>(`${this.api}ClassAPI/CreateUpdateClass`,data);
  }

  getClassEnteries(data){
    return this.http.post<any>(`${this.api}ClassAPI/GetClassEntries`,data);
  }
  
  getClassResult(data){
    return this.http.post<any>(`${this.api}ClassAPI/GetResultOfClass`,data);
  }

  deleteClassExhibitor(id:number){
    return this.http.delete<any>(`${this.api}ClassAPI/DeleteClassExhibitor?exhibitorClassId=${id}`);
  }

  deleteClass(id:number){
    return this.http.delete<any>(`${this.api}ClassAPI/RemoveClass?classId=${id}`);
  }

  createUpdateSplitClass(data){
    return this.http.post<any>(`${this.api}ClassAPI/AddUpdateSplitClass`,data);
  }

  getbackNumber(id:number){
    return this.http.get<any>(`${this.api}ClassAPI/GetBackNumberForAllExhibitor?classId=${id}`);
  }

  getExhibitorReults(id:number){
    return this.http.get<any>(`${this.api}ClassAPI/GetResultExhibitorDetails?classId=${id}`);
  }

  addClassResult(data){
    return this.http.post<any>(`${this.api}ClassAPI/AddClassResult`,data);
  }

  getExhibitorHorses(id:number){
    return this.http.get<any>(`${this.api}ClassAPI/GetExhibitorHorses?exhibitorId=${id}`);
  }

  addExhibitorToClass(data){
    return this.http.post<any>(`${this.api}ClassAPI/AddExhibitorToClass`,data);
  }

  getAllBackNumbers(id){
    return this.http.get<any>(`${this.api}ClassAPI/GetBackNumberForAllExhibitor?classId=${id}`);
  }

  getExhibitorDetails(data){
    return this.http.post<any>(`${this.api}ClassAPI/GetResultExhibitorDetails`,data);
  }

  addResult(data){
    return this.http.post<any>(`${this.api}ClassAPI/AddClassResult`,data);
  }

  updateScratch(data){
    return this.http.post<any>(`${this.api}ClassAPI/UpdateClassExhibitorScratch`,data);
  }

  getClassHeaders(){
    return this.http.get<any>(`${this.api}CommonAPI/GetGlobalCode?categoryName=ClassHeaderType`);
  }

  deleteClassResult(id:number){
    return this.http.delete<any>(`${this.api}ClassAPI/DeleteClassResult?resultId=${id}`);
  }

  updateResult(data){
    return this.http.post<any>(`${this.api}ClassAPI/UpdateClassResult`,data);
  }
}