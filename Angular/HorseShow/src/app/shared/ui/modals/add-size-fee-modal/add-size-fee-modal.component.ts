import { Component, OnInit,Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import {YearlyMaintenanceService} from 'src/app/core/services/yearly-maintenance.service'
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../confirmation-modal/confirm-dialog.component';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-size-fee-modal',
  templateUrl: './add-size-fee-modal.component.html',
  styleUrls: ['./add-size-fee-modal.component.scss']
})
export class AddSizeFeeModalComponent implements OnInit {
  @ViewChild('addAdFeeForm') addAdFeeForm: NgForm;


  size:any;
  addAmount:any;
  loading = false;
  result:string;
  adFeesList:any;
  yearlyMaintainenceId:any;
  
  constructor(public dialogRef: MatDialogRef<AddSizeFeeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private yearlyService: YearlyMaintenanceService,
    private snackBar: MatSnackbarComponent,
    public dialog: MatDialog) {
    
  }

  ngOnInit(): void {
    this.yearlyMaintainenceId=this.data.YearlyMaintainenceId;
    this.getAdFees(this.data.YearlyMaintainenceId); 
   }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

 

  addAdFee(){
    if(this.yearlyMaintainenceId ==null)
    {
      this.snackBar.openSnackBar("Please select a year", 'Close', 'red-snackbar');
      return false;
    }
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var adFeeRequest={
        yearlyMaintainenceId:this.yearlyMaintainenceId,
        adSize:this.size,
        amount:Number(this.addAmount)
      }
      this.yearlyService.addAdFee(adFeeRequest).subscribe(response => {
        this.getAdFees(this.yearlyMaintainenceId);
        this.addAdFeeForm.resetForm({addSize:null,amount:null});
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.loading = false;
      }, error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;
      }
      )
      resolve();
    });
  }


  confirmRemoveFee(id,AdSizeId): void {
    const message = `Are you sure you want to remove the record?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteAdFee(id,AdSizeId)
      }
    });

  }

  
  deleteAdFee(id,AdSizeId){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      let DeleteAdFee={
       YearlyMaintenanceFeeId:id,
       AdSizeId:AdSizeId
      }
      this.yearlyService.deleteAdFee(DeleteAdFee).subscribe(response => {
        this.getAdFees(this.yearlyMaintainenceId);
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.loading = false;
      }, error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;
      }
      )
      resolve();
    });
  }

  getAdFees(id){
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.yearlyService.getAdFees(id).subscribe(response => {
        if(response.Data!=null && response.Data!=undefined)
        {
        this.adFeesList = response.Data.getAdFees;
        this.loading = false;
        }
        else{
          this.adFeesList = null;
          this.loading = false;
        }
      }, error => {
        this.loading = false;
  
      }
      )
      resolve();
    });
  }

  confirmFeeActiveInactive(id,e){
    e.preventDefault()
    const message = e.target.checked ? `Are you sure you want to active the fee?` : `Are you sure you want to inactive the fee?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.activeInactiveAdFee(id,e);
      }   
    });
  }
  
  activeInactiveAdFee(id,e){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var feeRequest={
        YearlyMaintenanceFeeId:id,
        IsActive:!e.target.checked
      }
      this.yearlyService.activeInActiveAdFee(feeRequest).subscribe(response => {
        this.getAdFees(this.yearlyMaintainenceId)
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.loading = false;
      }, error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;
      }
      )
      resolve();
    });
  }
}
