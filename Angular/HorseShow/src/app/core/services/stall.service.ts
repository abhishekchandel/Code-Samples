import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseUrl } from '../../config/url-config';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StallService {
  // api = BaseUrl.baseApiUrl;
  api =environment.baseApiUrl;

  constructor(private http: HttpClient) { }

  getAllAssignedStalls(){
    return this.http.get<any>(`${this.api}StallAssignmentAPI/GetAllAssignedStalls`,{});
  }


  deleteAssignedStall(id:number){
      return this.http.get<any>(`${this.api}StallAssignmentAPI/DeleteAssignedStall?StallAssignmentId=${id}`);
  }


}
