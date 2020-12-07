import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  api =environment.baseApiUrl;
  constructor(private http: HttpClient) { }

  getProgramSheet(id:number){
    return this.http.get<any>(`${this.api}Report/GetProgramsReport?classId=${id}`);
  }
  getProgramSheetForAllClasses(){
    return this.http.get<any>(`${this.api}Report/GetProgramReportOfAllClasses`);
  }
  getPaddockSheet(id:number){
    return this.http.get<any>(`${this.api}Report/GetPaddockReport?classId=${id}`);
  }
  getPaddockSheetForAllClasses(){
    return this.http.get<any>(`${this.api}Report/GetPaddockReportOfAllClasses`);
  }

  getExhibitorRegistrationReport(exhibitorIdst:number){
    return this.http.get<any>(`${this.api}Report/GetExhibitorRegistrationReport?exhibitorIdst=${exhibitorIdst}`);
  }

  getExhibitorSponsorConfirmationReport(data){
    return this.http.post<any>(this.api +'Report/GetExhibitorSponsorConfirmation',data);
  }

  getExhibitorSponsorConfirmationReportForAllExhibitors(){
    return this.http.get<any>(`${this.api}Report/GetExhibitorSponsorConfirmationReportForAllExhibitors`);
  }

  getClassPerEntriesReport(id:number){
    return this.http.get<any>(`${this.api}Report/GetAllClassesEntries?classId=${id}`);
  }

  getClassResults(){
    return this.http.get<any>(`${this.api}Report/GetClassResultReport`);
  }

  getNSBAClassResults(){
    return this.http.get<any>(`${this.api}Report/GetNSBAClassesResultReport`);
  }

  getClassResult(id:number){
    return this.http.get<any>(`${this.api}Report/GetSingleClassResult?classId=${id}`);
  }

  getExhibitorSponsorRefund(data){
    return this.http.post<any>(this.api +'Report/GetExhibitorSponsorRefundReport',data);
  }

  SaveAndEmail(data){
    return this.http.post<any>(`${this.api}Report/SaveAndEmail`,data);
   
  }
  
  getExhibitorSponsorRefundReport(id){
    return this.http.get<any>(`${this.api}Report/GetExhibitorSponsorRefundReport?exhibitorId=${id}`);
  }

  getExhibitorsSponsorRefundReportForAllExhibitors(){
    return this.http.get<any>(`${this.api}Report/GetExhibitorsSponsorRefundReportForAllExhibitors`);
  }

getExhibitorGroupInformationReport(groupId:number){
  return this.http.get<any>(`${this.api}Report/ExhibitorGroupInformationReport?groupId=${groupId}`);
}

getExhibitorGroupInformationReportForAllGroups(){
  return this.http.get<any>(`${this.api}Report/GetExhibitorGroupInformationReportForAllGroups`);
}

getSponsorPatronList(){
  return this.http.get<any>(`${this.api}Report/AllPatronSponsorsYearly`);
 }

 getYearShowSummary(){
  return this.http.get<any>(`${this.api}Report/ShowSummaryReport`);
 }

 getAdministrativeReport(){
  return this.http.get<any>(`${this.api}Report/GetAdministrativeReport`);  
 }

 getNsbaExhibitorFeeReport(){
  return this.http.get<any>(`${this.api}Report/GetNSBAExhibitorsFeeReport`); 
 }
 getNsbaClassesExhibitorFeeReport(){
  return this.http.get<any>(`${this.api}Report/GetNSBAandClassesExhibitorsFeeReport`); 
 }
}
