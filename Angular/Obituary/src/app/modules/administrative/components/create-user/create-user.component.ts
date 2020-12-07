import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin.service';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  constructor(private adminService: AdminService,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackbarComponent) { }
  profileTypes: any;
  loading: boolean = false;

  userRequest = {
    accountId: 0,
    userProfileId:0,
    userType: null,
    personName: null,
    password: null,
    confirmPassword: null,
    loginName: null, //username
    email: null,
    phone: null,
    comments: null,
    createdBy:null,
    active:'1'
  }
  ngOnInit(): void {
    this.getProfileTypes();
  }
  getProfileTypes() {
    this.adminService.getProfileTypes().subscribe(response => {
      this.profileTypes = response.Data.globalCodeResponse;
    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
    })
  }
  createUser(userForm) {
    if (userForm.valid) {
      this.loading = true;
      this.userRequest.userType = Number(this.userRequest.userType);
      let accoundId = this.localStorageService.getUserCredentials().AccountId;
     this.userRequest.createdBy= this.localStorageService.getUserCredentials().LoginName;
      this.userRequest.accountId = Number(accoundId);
      this.adminService.createUser(this.userRequest).subscribe(response => {
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.loading = false;
        userForm.resetForm({ profileTypeId: null });
      }, error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
        this.loading = false;
      })

    }
    else {
      return;
    }
  }
}
