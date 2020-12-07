import { Component, OnInit,Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackbarComponent } from '../../mat-snackbar/mat-snackbar.component';
import { YearlyMaintenanceService } from 'src/app/core/services/yearly-maintenance.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirmation-modal/confirm-dialog.component';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-general-fee-modal',
  templateUrl: './general-fee-modal.component.html',
  styleUrls: ['./general-fee-modal.component.scss']
})
export class GeneralFeeModalComponent implements OnInit {
  @ViewChild('addGeneralFeeForm') addGeneralFeeForm: NgForm;

feeAmount : any;
feeType:any;
timeframe:any;
loading = false;
result:string;
generalFeesList:any;
yearlyMaintainenceId:any;
yearlyMaintainenceFeeId:any; 
updateMode:boolean=false;
updateRowIndex = -1;
showEditInfo = false
editFeeAmount : any;
editFeeType:any;

  constructor(public dialogRef: MatDialogRef<GeneralFeeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private yearlyService: YearlyMaintenanceService,
    private snackBar: MatSnackbarComponent,
    public dialog: MatDialog) {
    
  }

  ngOnInit(): void {
    this.yearlyMaintainenceId=this.data.YearlyMaintainenceId;
    this.getGeneralFees(this.yearlyMaintainenceId);
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

  addGeneralFee(){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var adFeeRequest={
        yearlyMaintainenceId:this.yearlyMaintainenceId,
        timeFrame:this.timeframe ==null ? '' : this.timeframe,
        amount:Number(this.feeAmount),
        feeType:this.feeType
      }

      this.yearlyService.addGeneralFees(adFeeRequest).subscribe(response => {
        this.getGeneralFees(this.yearlyMaintainenceId);
        this.addGeneralFeeForm.resetForm({type:null,amount:null,timeframeType:null});
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


  confirmRemoveFee(YearlyMaintenanceFeeId,feetypeid,timeframe): void {
    const message = `Are you sure you want to remove the record?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteGeneralFee(YearlyMaintenanceFeeId,feetypeid,timeframe)
      }
    });

  }

  
  deleteGeneralFee(YearlyMaintenanceFeeId,feetypeid,timeframe){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var deleteRequest={
        YearlyMaintenanceFeeId:Number(YearlyMaintenanceFeeId),
        FeeTypeId:Number(feetypeid),
        timeFrame:timeframe,
      }
      this.yearlyService.deleteGeneralFee(deleteRequest).subscribe(response => {
        this.getGeneralFees(this.yearlyMaintainenceId);
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

  getGeneralFees(id){
    
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.yearlyService.getGeneralFees(id).subscribe(response => {
        this.generalFeesList = response.Data.getGeneralFeesResponses;
        this.loading = false;
      }, error => {
        this.loading = false;
  
      }
      )
      resolve();
    });
  }

  editFee(index, data) {
    this.updateMode = true;
    this.updateRowIndex = index;
    this.editFeeType = data.FeeTypeId,
    this.editFeeAmount =data.Amount
  }

  cancelEdit() {
    this.updateMode = false;
    this.updateRowIndex = -1;
    this.showEditInfo = false;
    this.editFeeType = null;
    this.editFeeAmount=null
  }

  updateFee(fee) {
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var updateFeeRequest={
        yearlyMaintainenceId:this.yearlyMaintainenceId,
        amount:Number(this.editFeeAmount),
        yearlyMaintainenceFeeId:Number(fee.YearlyMaintenanceFeeId),
        timeframe:fee.TimeFrame,
        feeType:''
      }

      this.yearlyService.addGeneralFees(updateFeeRequest).subscribe(response => {
        this.getGeneralFees(this.yearlyMaintainenceId);
        this.addGeneralFeeForm.resetForm({type:null,amount:null,timeframeType:null});
        this.updateMode = false;
        this.updateRowIndex = -1;
        this.showEditInfo = false;
        this.editFeeType = null;
        this.editFeeAmount=null
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
