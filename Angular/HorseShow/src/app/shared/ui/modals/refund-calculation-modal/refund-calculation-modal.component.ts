import { Component, OnInit,Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { YearlyMaintenanceService } from 'src/app/core/services/yearly-maintenance.service';
import { MatSnackbarComponent } from '../../mat-snackbar/mat-snackbar.component';
import { NgForm } from '@angular/forms';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirmation-modal/confirm-dialog.component';
import { ExhibitorService } from 'src/app/core/services/exhibitor.service';

@Component({
  selector: 'app-refund-calculation-modal',
  templateUrl: './refund-calculation-modal.component.html',
  styleUrls: ['./refund-calculation-modal.component.scss']
})
export class RefundCalculationModalComponent implements OnInit {
  @ViewChild('addRefundForm') addRefundForm: NgForm;
  feeDetails:any;
 afterDate:any;
 beforeDate:any;
 feeTypeId:any;
 refundPercent:number;
 yearlyMaintainenceId:number;
 loading = false;
//  refundList={
//    DateAfter:null,
//    DateBefore:null,
//    RefundType:null,
//    Refund:null,
//    Active:null
//  };
refundList:any
 result:string;

  constructor(public dialogRef: MatDialogRef<RefundCalculationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private yearlyService: YearlyMaintenanceService,
    private snackBar: MatSnackbarComponent,
    public dialog: MatDialog,
    private exhibitorService: ExhibitorService) {
    
  }

  ngOnInit(): void {
    this.yearlyMaintainenceId=this.data.YearlyMaintainenceId;
    this.getRefunds(this.yearlyMaintainenceId);
    this.getFees()
  }
  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

  handleAfterDate(){
   this.afterDate== moment(this.afterDate).format('MM-dd-yyyy');
  }

  handleBeforeDate(){
    this.beforeDate== moment(this.beforeDate).format('MM-dd-yyyy');
  }


  addRefund(){
    if(this.yearlyMaintainenceId ==null)
    {
      this.snackBar.openSnackBar("Please select a year", 'Close', 'red-snackbar');
      return false;
    }
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var adFeeRequest={
        yearlyMaintenanceId:this.yearlyMaintainenceId,
        dateAfter:this.afterDate,
        dateBefore:this.beforeDate,
        feeTypeId:Number(this.feeTypeId),
        refund:Number(this.refundPercent)
      }
      this.yearlyService.addRefund(adFeeRequest).subscribe(response => {
        this.getRefunds(this.yearlyMaintainenceId);
        this.addRefundForm.resetForm({dayAfter:null,dayBefore:null,refundType:null,refund:null});
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

  setFeeType(value){
  this.feeTypeId=Number(value);
  }

  getRefunds(id){
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.yearlyService.getRefunds(id).subscribe(response => {
        this.refundList = response.Data.getRefunds;
        this.loading = false;
      }, error => {
        this.loading = false;
      }
      )
      resolve();
    });
  }

  deleteRefund(id){
    return new Promise((resolve, reject) => {   
      this.loading = true;   
      this.yearlyService.deleteRefund(Number(id)).subscribe(response => {
        this.getRefunds(this.yearlyMaintainenceId);
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

  confirmRemoveFee(id): void {
    const message = `Are you sure you want to remove the record?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteRefund(id)
      }
    });

  }

  getFees(){
    this.loading = true;
    this.exhibitorService.getFees().subscribe(response => {    
     this.feeDetails = response.Data.getFees;
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  confirmActiveInactiveScratchRefund(id,e){
    e.preventDefault()
    const message = e.target.checked ? `Are you sure you want to active the scratch refund?` : `Are you sure you want to inactive the scratch refund?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.activeInactiveScratchRefund(id,e);
      }   
    });
  }
  
  activeInactiveScratchRefund(id,e){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var feeRequest={
        RefundDetailId:id,
        IsActive:!e.target.checked
      }
      this.yearlyService.activeInActiveScratchRefund(feeRequest).subscribe(response => {
        this.getRefunds(this.yearlyMaintainenceId);
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
