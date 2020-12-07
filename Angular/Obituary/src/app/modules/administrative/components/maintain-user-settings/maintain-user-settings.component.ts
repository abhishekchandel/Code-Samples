import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-maintain-user-settings',
  templateUrl: './maintain-user-settings.component.html',
  styleUrls: ['./maintain-user-settings.component.scss']
})
export class MaintainUserSettingsComponent implements OnInit {

  headingsClass: string[] = ['User Name', 'Person Name', 'Type Of User', 'Status', 'Actions'];

  userResponse: any;
  profileTypes: any;
  totalItems: any;
  dataSource = new MatTableDataSource();
  loading: boolean = false;
  disableButtons: boolean = false;
  editField: any;
  personCheckedIndex = -1;
  filter: string;

  user = {
    userProfileId: 0,
    accountId: 0,
    profileTypeId: null,
    personName: null,
    loginName: null,
    active: null,
    modifiedBy: null
  }
  currentPage: number = 1;
  isEditable: boolean = false;
  allUsersRequest = {
    accountId: 0,
    Page: 1,
    Limit: 10,
    OrderBy: "UserProfileId",
    OrderByDescending: true,
    AllRecords: false
  }
  checkBoxValue: any;

  constructor(private adminService: AdminService,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackbarComponent) { }

  ngOnInit(): void {
    if (this.localStorageService.getUserCredentials().Role != 'Admin') {
      this.disableButtons = true;
    }
    this.getAllUsers();
    this.getProfileTypes();
  }
  getProfileTypes() {
    this.adminService.getProfileTypes().subscribe(response => {
      this.profileTypes = response.Data.globalCodeResponse;
    }, error => {
    })
  }
  getDataById(object, event: any, clickedIndex: number) {
    
    this.personCheckedIndex = clickedIndex
    this.isEditable = this.isEditable == true ? false : true;
    this.user.active = object.Active;
    this.user.accountId = Number(object.AccountId);
    this.user.loginName = object.LoginName;
    this.user.personName = object.PersonName;
    this.user.profileTypeId = object.ProfileTypeId;
    this.user.userProfileId = object.UserProfileId;

  }
  getAllUsers() {
    this.loading = true;
    this.allUsersRequest.accountId = Number(this.localStorageService.getUserCredentials().AccountId);
    this.adminService.getUserByAccount(this.allUsersRequest).subscribe(response => {
      this.userResponse = response.Data.UsersResponse;
      this.dataSource.data = this.userResponse;
      this.totalItems = response.Data.TotalRecords;
      this.loading = false;

    }, error => {
      this.loading = false;
    })
  }
  initialiseModel() {
    this.user = {
      userProfileId: 0,
      accountId: 0,
      profileTypeId: null,
      personName: null,
      loginName: null,
      active: null,
      modifiedBy: null
    }
    this.personCheckedIndex = -1
  }
  updateRecord() {
    if (this.user.userProfileId == 0) {
      this.snackBar.openSnackBar("Please select a user to edit", 'Close', 'red-snackbar');
      return false;
    }
    this.loading = true;
    this.user.modifiedBy = this.localStorageService.getUserCredentials().LoginName;
    this.user.profileTypeId = Number(this.user.profileTypeId);
    this.adminService.updateUser(this.user).subscribe(response => {
      this.loading = false;
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      this.initialiseModel();
      this.getAllUsers();
      this.isEditable = false;
    }, error => {
      this.loading = false;
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
    })
  }
  getUserType(event: any) {
    this.checkBoxValue = event.target.value;
  }

  changeValue(id: number, property: string, event: any) {
    if (this.localStorageService.getUserCredentials().Role != 'Admin' && property == 'userType') {
      this.userResponse[id].ProfileTypeId = this.checkBoxValue;
      event.target.value = this.checkBoxValue;
      this.snackBar.openSnackBar("Permission Denied", 'Close', 'red-snackbar');
      return false;
    }
    switch (property) {
      case 'loginName': this.user.loginName = event.target.textContent;
        break;
      case 'personName': this.user.personName = event.target.textContent;
        break;

      case 'userType': this.user.profileTypeId = Number(event.target.value);
        break;
      case 'status': this.user.active = event.target.value;
        break;

    }
  }


  deleteUser(index) {
    if (this.localStorageService.getUserCredentials().Role != 'Admin') {
      this.snackBar.openSnackBar("Permission Denied", 'Close', 'red-snackbar');
      return false;
    }
    this.loading = true;
    let userProfileId = this.userResponse[index].UserProfileId
    let request = {
      userProfileId: userProfileId,
      deletedBy: this.localStorageService.getUserCredentials().LoginName
    }
    let confirmation = confirm('Do you want to delete this record?');
    if (confirmation) {
      this.adminService.deleteUser(request).subscribe(response => {
        this.loading = false;
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.getAllUsers();
      }, error => {
        this.loading = false;
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      })
    }
    else {
      this.loading = false;
    }
  }
  getPage(page: number) {
    
    this.allUsersRequest.Page = page;
    this.currentPage = page;
    this.getAllUsers();
  }
}
