import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { NgForm } from '@angular/forms';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

declare const Stripe;
@Component({
  selector: 'app-stripe-payment-form',
  templateUrl: './stripe-payment-form.component.html',
  styleUrls: ['./stripe-payment-form.component.scss']
})
export class StripePaymentFormComponent implements OnInit {
  @Output() handleClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() pageRefresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() submitForPayment: EventEmitter<any> = new EventEmitter<any>();
  @Input('amount') amount: any;
  @Input('obituariesId') obituariesId = [];
  @Input('selectedUserId') selectedUserId : any;
  @Input('singleItem') singleItem: any;
  @Input('accountDetails') accountDetails: any;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  message: string;
  loading = false;
  email: string
  password: string;
  success: boolean = true;

  stripeRequest = {
    userName: null,
    email: null,
    phone: null
  }
  billingInfo = {
    BillingContact: null,
    Phone: null,
    Email: null
  };

  constructor(private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackbarComponent,
    private localStorageService: LocalStorageService) { }

  private stripe: any;
  private stripePublishKey: any
  private stripeCard: any;
  stripeError = true;
  ngOnInit() {
    
    this.getBillingInfo();
  this.selectedUserId;
  };
  // initialise stripe and elements
  initStripe() {
    const stripeElements = this.stripe.elements();
    const style = { base: { fontSize: '16px', color: "#32325d" } };

    this.stripeCard = stripeElements.create('card', { hidePostalCode: true, style: style });

    this.stripeCard.mount('#card-element');

    const self = this;
    this.stripeCard.addEventListener('change', function (event) {
      const displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
        self.stripeError = true;
      } else {
        displayError.textContent = '';
        self.stripeError = false;
      }
    });
  }
  //get stripe key from app settings 
  getStripeKey() {
    
    this.adminService.getStripeKey().subscribe(response => {
      this.stripePublishKey = response.Data.StripePublishKey;
      this.stripe = Stripe(this.stripePublishKey);
      this.initStripe();
    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
    })
  }
  //get billing details for payment
  getBillingInfo() {
    let accoundId = this.localStorageService.getUserCredentials().AccountId;

    this.adminService.getBillingInfo(Number(accoundId)).subscribe(response => {
      this.billingInfo = response.Data;
      this.stripeRequest.email = this.billingInfo.Email
      this.stripeRequest.phone = this.billingInfo.Phone
      this.stripeRequest.userName = this.billingInfo.BillingContact
      this.getStripeKey();
    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
    })
  }
  //pay button fires this function
  submitPayment(stripeForm: NgForm) {
    if (stripeForm.valid) {
      this.loading = true;
      const customerData = this.stripeRequest.email;
      let accountId = this.localStorageService.getUserCredentials().AccountId
      this.stripe.createToken(this.stripeCard).then(result => {
        if (result.error) {
          const errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
          this.loading = false;
        }
        else {
          const paymentRequest = {
            token: result.token.id,
            amount: Number(this.amount),
            email: this.billingInfo.Email,
            createdBy: this.localStorageService.getUserCredentials().LoginName,
            userProfileId: Number(this.localStorageService.getUserCredentials().UserProfileId),
            ObituariesIds: this.obituariesId
          }
          this.adminService.submitPayment(paymentRequest).subscribe(response => {
            this.loading = false;
            this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
            if (this.singleItem == true) {
              this.getAllObits(this.selectedUserId);
            }
            else {
              this.getAllObits(this.selectedUserId);
            }
            this.closeModal();
          }, error => {
            this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
            this.loading = false;
          })
        }
      });
    }
  }
  //handles the closing of the pop up screen
  closeModal() {
    this.handleClose.emit();
  }
  //handling the page refresh 
  getAllObits(id) {
    this.pageRefresh.emit(id);
  }
}
