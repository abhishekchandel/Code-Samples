import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackbarComponent } from '../../mat-snackbar/mat-snackbar.component'
import {ExhibitorService } from '../../../../core/services/exhibitor.service';

@Component({
  selector: 'app-filtered-financial-transactions',
  templateUrl: './filtered-financial-transactions.component.html',
  styleUrls: ['./filtered-financial-transactions.component.scss']
})
export class FilteredFinancialTransactionsComponent implements OnInit {
  loading = false;
  financialDetails:any;
  exhibitorId:any;
  feeTypeId:any;

  constructor(public dialogRef: MatDialogRef<FilteredFinancialTransactionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackbarComponent,
    private exhibitorService: ExhibitorService
    ) { }


  ngOnInit(): void {
    debugger;
   this.exhibitorId=this.data.exhibitorId;
   this.feeTypeId=this.data.feeTypeId;
   this.getFinancialViewDetail();
  }
  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

  getFinancialViewDetail(){
    this.loading = true;
    var data={
      feeTypeId:this.feeTypeId,
      exhibitorId:this.exhibitorId
    }
    this.exhibitorService.getFinancialDetails(data).subscribe(response => {
     this.financialDetails=response.Data.getExhibitorTransactions;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.financialDetails = null;
    }
    )
  }
}
