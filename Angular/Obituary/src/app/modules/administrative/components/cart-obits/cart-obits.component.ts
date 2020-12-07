import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AdminService } from 'src/app/core/services/admin.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { ConfirmDialogModel, ConfirmDialogComponent } from 'src/app/shared/ui/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseUrl } from 'src/app/config/url-config';

@Component({
  selector: 'app-cart-obits',
  templateUrl: './cart-obits.component.html',
  styleUrls: ['./cart-obits.component.scss']
})
export class CartObitsComponent implements OnInit {
  @ViewChild('paymentModal') modal: ElementRef;

  loading: boolean = false;
  singleItem: boolean = false;
  showDropdown: boolean = false;

  cartResponse: any = [];
  accountMembers: any;
  result: string = '';
  obituariesId = [];

  index: number = 0;
  ratePerObit: number = 45;
  amount: number = 0;
  editId: number = 0;
  selectedUserId:number=0;
  AdminCartLimit:number=0;
  //assets server url for binding images 
  assetsUrl = BaseUrl.assetsUrl;

  cartRequest = {
    userProfileId: null
  }

  modalRef: BsModalRef;
  styling = {
    ignoreBackdropClick: true
  };
  constructor(private adminService: AdminService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackbarComponent,
    public dialog: MatDialog,
    private modalService: BsModalService, ) { }

  ngOnInit(): void {
    
    let role = this.localStorageService.getUserCredentials().Role;
    if (role == "Admin") {
      this.showDropdown = true;
    }
    else {
      this.showDropdown = false;
      this.getObits(this.localStorageService.getUserCredentials().UserProfileId);
    }
    this.getAccountMembers();
    this.getObitPrice();
    this.getPrice();
  }
  //get obits based on role logged in (for refresh page)
  getObits(id:number) {
    
    this.loading = true;
    let userProfileId = id;
    this.adminService.getCartItems(userProfileId).subscribe(response => {
      this.cartResponse = response.Data.obituaryResponse;
      this.loading = false;
      this.getAccountMembers();
    }, error => {
      this.loading = false;
    })
  }
  //get all obits associated with the account logged in
  getAllObits(number) {
    
    this.loading = true;
    let userProfileId = number.value;
    this.selectedUserId=number.value;
    this.adminService.getCartItems(userProfileId).subscribe(response => {
      this.cartResponse = response.Data.obituaryResponse;
      this.loading = false;

    }, error => {
      this.loading = false;
    })

  }
  //get all users as per the user account logged in
  getAccountMembers() {
    this.loading = true;
    let accountId = Number(this.localStorageService.getUserCredentials().AccountId);
    this.adminService.getAccountsById(accountId).subscribe(response => {
      this.accountMembers = response.Data.usersCartResponse;
      this.loading = false;

    }, error => {
      this.loading = false;
    })
  }
  //place another obituary
  placeAnotherObituary() {
    
    this.adminService.getCartItems(this.localStorageService.getUserCredentials().UserProfileId).subscribe(response => {
      this.AdminCartLimit = response.Data.TotalRecords;
      if(this.AdminCartLimit==this.localStorageService.getUserCredentials().CartLimit){
        this.snackBar.openSnackBar("You have reached your cart limit", 'Close', 'red-snackbar');
        return false;
      }
      else{
          this.router.navigateByUrl("/admin/create-obituary");
        }
    }, error => {
     
    })

}

  //getting price of obit from db
  getPrice() {
    let accountId = this.localStorageService.getUserCredentials().AccountId;
    accountId: Number(accountId)
    this.adminService.getPrice(accountId).subscribe(response => {
      if (response.Data != null) {
        this.ratePerObit = response.Data.ObituaryPrice;
      }

    }, error => {

    })
  }
  getObitPrice() {
    let accountId = this.localStorageService.getUserCredentials().AccountId;
    accountId: Number(accountId)
    this.adminService.getObitPrice().subscribe(response => {
      if (response.Data != null) {
        this.ratePerObit = response.Data.ObitPrice;
      }

    }, error => {

    })
  }
  //the stripe form pop up opens here
  openModal() {
    if (this.modalRef)
      this.closeModal();

    this.modalRef = this.modalService.show(this.modal,
      Object.assign({}, { class: 'summaryPopUp gray modal-lg' }, this.styling)
    );
  }
  closeModal() {
    this.modalRef.hide();
  }

  editCartObit(editId) {
    
    this.editId = editId
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "obitId": editId
      }
    };
    this.router.navigate(["/admin/create-obituary"], navigationExtras)
  }
  calculateAmount(name: string, id, object) {
    
    this.obituariesId.push(id);
    if (name == 'one') {
      this.amount = 1 * this.ratePerObit;
      this.singleItem = true;
      this.openModal();
    }
  }
  submitAll(object) {
    
    this.amount = object.length * this.ratePerObit;
    object.forEach((item, index) => {
      this.obituariesId.push(item.ObituaryId)
    });
    this.singleItem = false;
    this.openModal();
  }
  //removal from cart confirmation
  confirmRemoveObit(index, data): void {
    
    const message = `Are you sure you want to remove this from cart?`;

    const dialogData = new ConfirmDialogModel("Confirm Action", message);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      this.removeCartObit(data.ObituaryId, this.result)
    });

  }
  removeCartObit(obitId, result) {
    if (result == true) {
      this.loading = true;
      this.adminService.deleteObituary(Number(obitId)).subscribe(response => {
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.loading = false;
        this.getObits(this.selectedUserId);
        this.getAccountMembers();
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
