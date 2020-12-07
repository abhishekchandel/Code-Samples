import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin.service';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { NgForm, NgModel } from '@angular/forms';

@Component({
  selector: 'app-update-user-modal',
  templateUrl: './update-user-modal.component.html',
  styleUrls: ['./update-user-modal.component.scss']
})
export class UpdateUserModalComponent implements OnInit {

  @Output() handleClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() pageRefresh: EventEmitter<any> = new EventEmitter<any>();
  @Input('popUpData') popUpData: any;

  updateUserModel = {
    userProfileId: 0,
    loginName: null,
    personName: null,
    email: null,
    phone: null,
    password: null,
    confirmPassword: null
  }
  loading: boolean = false;
  constructor(
    private snackBar: MatSnackbarComponent,
    private adminService: AdminService, ) { }

  ngOnInit(): void {
    this.updateUserModel.loginName = this.popUpData.LoginName;
    this.updateUserModel.personName = this.popUpData.PersonName;
    this.updateUserModel.phone = this.popUpData.Phone;
    this.updateUserModel.email = this.popUpData.Email;
    this.updateUserModel.userProfileId = this.popUpData.UserProfileId;
  }
  submit(form: NgForm) {
    if (form.valid) {
      this.loading = true;
      this.adminService.updateAdminUser(this.updateUserModel).subscribe(response => {
        this.loading = false;
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.closeModal();
        this.pageRefresh.emit();
      }, error => {
        this.loading = false;
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      })
    }
  }
  closeModal() {
    this.handleClose.emit();
  }
  isInvalidField(form: NgForm, inputControl: NgModel): boolean {
    return (form.submitted || inputControl.touched) && inputControl.invalid;
  }

}
