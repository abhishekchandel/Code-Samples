import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { AdminService } from 'src/app/core/services/admin.service';

@Component({
  selector: 'app-maintain-admin-settings',
  templateUrl: './maintain-admin-settings.component.html',
  styleUrls: ['./maintain-admin-settings.component.scss']
})
export class MaintainAdminSettingsComponent implements OnInit {

  accountId: any;
  bindingData: any;
  dashboardUrl: any;

  bindingModel = {
    accountEmail: null,
    accountName: null,
    contactName: null,
    phone: null
  }
  constructor(private localStorageService: LocalStorageService,
    private authService: AuthService,
    private adminService: AdminService) { }

  ngOnInit(): void {
    this.accountId = Number(this.localStorageService.getUserCredentials().AccountId);
    this.getDashboardUrl();
  }
  //api for getting dashboard url used for logos of accounts
  getDashboardUrl() {
    this.adminService.getServerUrl().subscribe(response => {
      this.dashboardUrl = response.Data.EveryobitDashboardUrl;
      this.getAccountDetails(this.dashboardUrl);
      console.log(this.dashboardUrl);
    }, error => {

    })
  }
  getAccountDetails(url) {
    
    this.authService.getAccountDetails(this.accountId, url).subscribe(response => {
      this.bindingData = response.Data;
      this.bindingModel.accountEmail = this.bindingData.AccountEmail;
      this.bindingModel.accountName = this.bindingData.AccountName;
      this.bindingModel.contactName = this.bindingData.ContactName;
      this.bindingModel.phone = this.bindingData.Phone;

    }, error => {
    })
  }
}
