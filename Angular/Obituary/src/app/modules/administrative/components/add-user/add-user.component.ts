import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { AdminService } from 'src/app/core/services/admin.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  @Input('accountId') accountId: number;

  @ViewChild('userForm') userForm?: NgForm;

  profileTypes: any;
  loading: boolean = false;
  disableButton: boolean = false;

  constructor(private authService: AuthService,
    private snackBar: MatSnackbarComponent,
    private adminService: AdminService,
    private localStorageService: LocalStorageService) { }

  user = {
    userProfileId: 0,
    accountId: 0,
    userType: null,
    personName: null,
    loginName: null,
    password: null,
    confirmPassword: null,
    email: null,
    phone: null,
    createdBy: null,
    comments: "",
    active: "1"
  }
  ngOnInit(): void {
    
  
      this.user.accountId = this.accountId;
      this.getProfileTypes();

  }
  initialiseTab() {
    this.user = {
      userProfileId: 0,
      accountId: 0,
      userType: null,
      personName: null,
      loginName: null,
      password: null,
      confirmPassword: null,
      email: null,
      phone: null,
      createdBy: null,
      comments: "",
      active: "1"
    }
  }
  getProfileTypes() {
    this.adminService.getProfileTypes().subscribe(response => {
      this.profileTypes = response.Data.globalCodeResponse;
    }, error => {
    })
  }
  onSubmit(form: NgForm) {
    if (form.valid) {
      this.loading = true;
      this.user.userType = Number(this.user.userType)
      this.user.createdBy = this.localStorageService.getUserCredentials().LoginName;
      this.adminService.createUser(this.user).subscribe(response => {
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.loading = false;
        this.userForm.resetForm()
      }, error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
        this.loading = false;

      })
    }
  }
  isInvalidField(form: NgForm, inputControl: NgModel): boolean {
    return (form.submitted || inputControl.touched) && inputControl.invalid;
  }
}
