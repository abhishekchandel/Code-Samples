import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { AdminService } from 'src/app/core/services/admin.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
  selector: 'app-account-comments',
  templateUrl: './account-comments.component.html',
  styleUrls: ['./account-comments.component.scss']
})
export class AccountCommentsComponent implements OnInit {
  @Input('accountId') accountId: number;
  @ViewChild('commentsForm') commentsForm?: NgForm;
  @Output() pageRefresh: EventEmitter<any> = new EventEmitter<any>();

  loading: boolean = false;
  disableButton: boolean = false;
  editAccount: boolean = false;
  bindingData: any;
  id: any;
  dashboardUrl: any=null;

  imageUrl: string | ArrayBuffer = "https://bulma.io/images/placeholders/480x480.png";
  myFiles: File[] = [];

  constructor(
    private snackBar: MatSnackbarComponent,
    private adminService: AdminService,
    private authService: AuthService,
    private localStorageService: LocalStorageService) { }

  request = {
    accountId: 0,
    comments: null,
    email: null,
    phone: null,
    trialDays: 0,
    modifiedBy: null,
    WebsiteUrl: null,
    Logo: null
  }
  ngOnInit(): void {
    this.request.accountId = this.accountId;
    // this.getAllComments();
    this.getDashboardUrl();
  }
  initialiseTab() {
    this.request = {
      accountId: 0,
      comments: null,
      email: null,
      phone: null,
      trialDays: null,
      modifiedBy: null,
      WebsiteUrl: null,
      Logo: null
    }
  }
  //api for getting dashboard url used for logos of accounts
  getDashboardUrl() {
    this.adminService.getServerUrl().subscribe(response => {
      this.dashboardUrl = response.Data.EveryobitDashboardUrl;
      this.getAllComments(this.dashboardUrl);
      console.log(this.dashboardUrl);
    }, error => {

    })
  }
  getAllComments(url: string) {
    this.editAccount = false;
    this.authService.getAccountDetails(this.accountId, url).subscribe(response => {
      this.bindingData = response.Data;
      this.request.comments = this.bindingData.Comments;
      this.request.email = this.bindingData.AccountEmail;
      this.request.phone = this.bindingData.Phone;
      this.request.trialDays = this.bindingData.TrialDays;
      this.request.WebsiteUrl = this.bindingData.WebsiteUrl;
      this.request.Logo = this.bindingData.Logo;
      this.imageUrl = this.bindingData.Logo != null ? this.bindingData.Logo : this.imageUrl;
    }, error => {
    })
  }
  public prepareUpdateRequest() {
    var formData = new FormData();
    Object.entries(this.request).map(function ([key, val]) {
      formData.append(key, val);

    });
    return formData;
  }
  //for logo upload-update and preview the existing logo
  onFileChange($event) {
    for (var i = 0; i < $event.target.files.length; i++) {
      this.myFiles.push($event.target.files[i]);
      var reader = new FileReader();
      const file = $event.target.files[0];
      const fileName = $event.target.attributes['data-key'].value;
      reader.readAsDataURL(file);
    }
  }
  public uploadFile = () => {
    for (var i = 0; i < this.myFiles.length; i++) {
      this.request.Logo = this.myFiles[0];
    }
    console.log(this.request.Logo);
  }
  /*for preview of image*/
  public onChange(file: File) {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imageUrl = reader.result;
      };
      this.editAccount = true;
    }
  }
  submit(form: NgForm) {
    
    if (form.valid) {
      this.loading = true;
      if (this.editAccount == false) {
        this.request.Logo = null;
      }
      this.request.trialDays = Number(this.request.trialDays);
      this.request.modifiedBy = this.localStorageService.getUserCredentials().LoginName;
      this.adminService.saveAccountComments(this.prepareUpdateRequest(), this.dashboardUrl).subscribe(response => {
        this.loading = false;
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.getAllComments(this.dashboardUrl);
        this.pageRefresh.emit(this.dashboardUrl);
      }, error => {
        this.loading = false;
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      })
    }
  }
  isInvalidField(form: NgForm, inputControl: NgModel): boolean {
    return (form.submitted || inputControl.touched) && inputControl.invalid;
  }

}
