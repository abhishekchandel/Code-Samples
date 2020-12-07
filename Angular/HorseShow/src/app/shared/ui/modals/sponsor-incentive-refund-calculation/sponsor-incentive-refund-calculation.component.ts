import { Component, OnInit,Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { YearlyMaintenanceService } from 'src/app/core/services/yearly-maintenance.service';
import { MatSnackbarComponent } from '../../mat-snackbar/mat-snackbar.component';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../confirmation-modal/confirm-dialog.component';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-sponsor-incentive-refund-calculation',
  templateUrl: './sponsor-incentive-refund-calculation.component.html',
  styleUrls: ['./sponsor-incentive-refund-calculation.component.scss']
})
export class SponsorIncentiveRefundCalculationComponent implements OnInit {

  @ViewChild('addIncentiveForm') addIncentiveForm: NgForm;

  yearlyMaintainenceId:any;
  loading = false;
  result:string;
  sponsorIncentiveList:any;
  updateMode:boolean=false;
  updateRowIndex = -1;
  showEditInfo = false
  editIncentiveAmount : any;
  editIncentiveAward:any;
  sponsorIncentive={
  Amount:null,
  Award:null,
  SponsorIncentiveId:null
 }
 incentiveAmount:number;
 awardIncentive:number;
  constructor(public dialogRef: MatDialogRef<SponsorIncentiveRefundCalculationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private yearlyService: YearlyMaintenanceService,
    private snackBar: MatSnackbarComponent,
    public dialog: MatDialog) {
    
  }

  ngOnInit(): void {
    this.yearlyMaintainenceId=this.data.YearlyMaintainenceId
    this.getSponsorIncentive(this.data.YearlyMaintainenceId);
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

  addUpdateIncentive(){
    
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var incentiveRequest={
        YearlyMaintenanceId:this.yearlyMaintainenceId,
         Amount:Number(this.sponsorIncentive.Amount),
         Award:Number(this.sponsorIncentive.Award),
         SponsorIncentiveId:this.sponsorIncentive.SponsorIncentiveId ==null ? 0 : this.sponsorIncentive.SponsorIncentiveId,
      }
      this.yearlyService.addUpdateIncentive(incentiveRequest).subscribe(response => {
        this.addIncentiveForm.resetForm({ amount: null, award: null })
        this.getSponsorIncentive(this.yearlyMaintainenceId);
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

  getSponsorIncentive(id){
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.yearlyService.getSponsorIncentive(id).subscribe(response => {
        this.sponsorIncentiveList = response.Data.getSponsorIncentives;
        this.loading = false;
      }, error => {
        this.loading = false;
      }
      )
      resolve();
    });
  }

  confirmRemoveIncentive(id): void {
    const message = `Are you sure you want to remove the record?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteIncentive(id)
      }
    });

  }
 
  deleteIncentive(id){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      this.yearlyService.deleteIncentive(Number(id)).subscribe(response => {
        this.getSponsorIncentive(this.yearlyMaintainenceId);
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

  editIncentive(index, data) {
    this.updateMode = true;
    this.updateRowIndex = index;
    this.editIncentiveAward = data.Award,
    this.editIncentiveAmount =data.SponsorAmount
  }

  cancelEdit() {
    this.updateMode = false;
    this.updateRowIndex = -1;
    this.showEditInfo = false;
    this.editIncentiveAward = null;
    this.editIncentiveAmount=null
  }

  updateIncentive(data){
    
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var incentiveRequest={
        YearlyMaintenanceId:this.yearlyMaintainenceId,
         Amount:Number(this.editIncentiveAmount),
         Award:Number(this.editIncentiveAward),
         SponsorIncentiveId:data.SponsorIncentiveId,
      }
      this.yearlyService.addUpdateIncentive(incentiveRequest).subscribe(response => {
        this.addIncentiveForm.resetForm({ amount: null, award: null })
        this.getSponsorIncentive(this.yearlyMaintainenceId);
        this.updateMode = false;
        this.updateRowIndex = -1;
        this.showEditInfo = false;
        this.editIncentiveAward = null;
        this.editIncentiveAmount=null
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
