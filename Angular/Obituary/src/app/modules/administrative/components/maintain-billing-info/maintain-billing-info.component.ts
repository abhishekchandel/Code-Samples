import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { AdminService } from 'src/app/core/services/admin.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import * as moment from 'moment';

@Component({
  selector: 'app-maintain-billing-info',
  templateUrl: './maintain-billing-info.component.html',
  styleUrls: ['./maintain-billing-info.component.scss']
})
export class MaintainBillingInfoComponent implements OnInit {
  @Input('accountId') accountId: number;

  @ViewChild('billingInfoForm') billingInfoForm?: NgForm;


  loading: boolean = false;
  disableButton: boolean = false;
  billingInfodata: any;

  maxDate = moment(new Date()).format('YYYY-MM-DD');
  minDate: string;


  constructor(private snackBar: MatSnackbarComponent,
    private adminService: AdminService,
    private localStorageService: LocalStorageService) { }

  billingRequest = {
    billingId: 0,
    billingContact: null,
    billingPhone: null,
    billingEmail: null,
    billingDate: null,
    billingMethod: null,
    cardNumber: null,
    expiryMonth: null,
    expiryYear: null,
    modifiedBy: null
  }
  billingInfoRequest = {
    accountId: 0
  }
  ngOnInit(): void {
    this.disableButton = false;
    this.billingInfoRequest.accountId = this.accountId;
    this.getBilingInfo();
  }
  initialiseTab() {
    this.billingRequest = {
      billingId: 0,
      billingContact: null,
      billingPhone: null,
      billingEmail: null,
      billingDate: null,
      billingMethod: null,
      cardNumber: null,
      expiryMonth: null,
      expiryYear: null,
      modifiedBy: null
    }
  }
  getBilingInfo() {
    this.loading = true;
    this.adminService.getBillingInfo(this.accountId).subscribe(response => {
      this.billingInfodata = response.Data;
      if (response.Data) {
        this.billingRequest.billingId = this.billingInfodata.BillingId;
        this.billingRequest.billingContact = this.billingInfodata.BillingContact;
        this.billingRequest.billingDate = this.billingInfodata.BillingDate;
        this.minDate = moment(this.billingInfodata.BillingDate).format('YYYY-MM-DD')
        this.billingRequest.billingMethod = this.billingInfodata.Method.replace(/ /g, '');;
        this.billingRequest.billingEmail = this.billingInfodata.Email;
        this.billingRequest.billingPhone = this.billingInfodata.Phone;
        this.billingRequest.cardNumber = this.billingInfodata.CardNumber;
        this.billingRequest.expiryMonth = this.billingInfodata.ExpiryMonth;
        this.billingRequest.expiryYear = this.billingInfodata.ExpiryYear;
      }
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }
  onSubmit(form: NgForm) {
    if (form.valid) {
      this.loading = true;
      this.billingRequest.billingDate = moment(this.billingRequest.billingDate).format('YYYY-MM-DD');
      this.billingRequest.expiryMonth = Number(this.billingRequest.expiryMonth)
      this.billingRequest.expiryYear = Number(this.billingRequest.expiryYear)
      this.adminService.saveBillingInfo(this.billingRequest).subscribe(response => {
        this.loading = false;
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.getBilingInfo();
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
