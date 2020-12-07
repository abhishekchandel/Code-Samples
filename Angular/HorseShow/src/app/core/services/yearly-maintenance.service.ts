import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class YearlyMaintenanceService {

  api =environment.baseApiUrl;

  constructor(private http: HttpClient) { }

  getYearlyMaintenanceSummary(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/GetAllYearlyMaintenance`,data);
  }


  getNewRegisteredUsers(){
    return this.http.get<any>(`${this.api}YearlyMaintenance/GetAllUsers`);
  }

  verifyUser(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/ApprovedUser`,data);
  }

  deleteUser(id){
    return this.http.delete<any>(`${this.api}YearlyMaintenance/Deleteuser?userId=${id}`);
  }

  addYear(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/AddUpdateYearly`,data);
  }

  deleteYear(id){
    return this.http.delete<any>(`${this.api}YearlyMaintenance/DeleteYearly?yearlyMaintainenceId=${id}`);
  }

  getAdFees(id){
    return this.http.get<any>(`${this.api}YearlyMaintenance/GetAllAdFees?yearlyMaintenanceId=${id}`);
  }

  addAdFee(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/AddAdFee`,data);
  }

  deleteAdFee(DeleteAdFee){
    return this.http.post<any>(`${this.api}YearlyMaintenance/DeleteAdFee`,DeleteAdFee);
  }

  getYearlyMaintenanceById(id){
    return this.http.get<any>(`${this.api}YearlyMaintenance/GetYearlyMaintenanceById?yearlyMaintenanceId=${id}`);
  }

  deleteApprovedUser(id){
    return this.http.delete<any>(`${this.api}YearlyMaintenance/RemoveApprovedUser?userId=${id}`);
  }

  getApprovedUser(){
    return this.http.get<any>(`${this.api}YearlyMaintenance/GetAllUsersApproved`);
  }

  getRoles(){
    return this.http.get<any>(`${this.api}YearlyMaintenance/GetAllRoles`);

  }

  getClassCategory(){
    return this.http.get<any>(`${this.api}YearlyMaintenance/GetAllClassCategory`);
  }

  addClassCategory(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/AddClassCategory`,data);
  }

  deleteClassCategory(id){
    return this.http.delete<any>(`${this.api}YearlyMaintenance/RemoveClassCategory?globalCodeId=${id}`);
  }


  getGeneralFees(id){
    return this.http.get<any>(`${this.api}YearlyMaintenance/GetAllGeneralFees?yearlyMaintenanceId=${id}`);
  }

  addGeneralFees(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/AddGeneralFees`,data);
  }

  deleteGeneralFee(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/RemoveGeneralFee`,data);
  }

  getContactInfo(id){
    return this.http.get<any>(`${this.api}YearlyMaintenance/GetContactInfo?yearlyMaintenanceId=${id}`);
  }

  addUpdateContact(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/AddUpdateContactInfo`,data);
  }

  getRefunds(id){
    return this.http.get<any>(`${this.api}YearlyMaintenance/GetRefund?yearlyMaintenanceId=${id}`);
  }

  addRefund(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/AddRefund`,data);
  }

  deleteRefund(id){
    return this.http.delete<any>(`${this.api}YearlyMaintenance/RemoveRefund?refundId=${id}`);
  }

  getFees(){
    return this.http.get<any>(`${this.api}ExhibitorAPI/GetFees`);
  }


  getSponsorIncentive(id){
    return this.http.get<any>(`${this.api}YearlyMaintenance/GetSponsorIncentive?yearlyMaintenanceId=${id}`);
  }

  addUpdateIncentive(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/AddAndUpdateSponsorIncentive`,data);
  }

  deleteIncentive(id){
    return this.http.delete<any>(`${this.api}YearlyMaintenance/DeleteSponsorIncentive?sponsorIncentiveId=${id}`);
  }

  getScannedDocuments(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/GetAllScan`,data);
  }

  getReportsInfo(id){
    return this.http.get<any>(`${this.api}YearlyMaintenance/GetYearlyStatementText?yearlyMaintenanceId=${id}`);
  }

  addUpdateReportsInfo(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/AddUpdateYearlyStatementText`,data);
  }

  activeInactiveUser(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/ActiveInActiveUser`,data);
  }

  activeInActiveGeneralFee(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/ActiveInActiveGeneralFee`,data);
  }

  activeInActiveAdFee(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/ActiveInActiveAdFee`,data);
  }

  activeInActiveClassCategory(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/ActiveInActiveClassCategory`,data);
  }

  activeInActiveScratchRefund(data){
    return this.http.post<any>(`${this.api}YearlyMaintenance/ActiveInActiveScratchRefund`,data);
  }

  copyData(id){
    return this.http.post<any>(`${this.api}YearlyMaintenance/YearlyDataForNextYear`,id)
  }
}
