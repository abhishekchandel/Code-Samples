import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject,ViewChild } from '@angular/core';
import { MatSnackbarComponent } from '../../mat-snackbar/mat-snackbar.component'
import {FeeModel} from '../../../../core/models/fee.model'
import {ExhibitorService } from '../../../../core/services/exhibitor.service';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import { BaseUrl } from 'src/app/config/url-config';
import { ConfirmDialogComponent, ConfirmDialogModel } from'../../../../shared/ui/modals/confirmation-modal/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-financial-transactions',
  templateUrl: './financial-transactions.component.html',
  styleUrls: ['./financial-transactions.component.scss']
})
export class FinancialTransactionsComponent implements OnInit {
  @ViewChild('feeForm') feeForm: NgForm;

//for binding images with server url
filesUrl = BaseUrl.filesUrl;
exhibitorTransactions:any;
    ExhibitorId:any;
    ExhibitorName:any
  
  constructor(public dialogRef: MatDialogRef<FinancialTransactionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackbarComponent,
    private exhibitorService: ExhibitorService,
    public dialog: MatDialog,) { }
    result: string = '';
    date = new Date();
    document:File;
    allFees:any
    filteredFee:any;
    filteredTimeframeFee:any;
    loading = false;
    isSponsorRefund:boolean=false;
    feeType:string=null;
    isRefund:boolean=false;
    updateMode:boolean=false;
    updateRowIndex = -1;
    showEditInfo = false;
    editRefund:any;
    editAmount:any=0;
    isRefundEdit:boolean=false
    timeframe:any;
    fee:FeeModel={
      PayDate:new Date(),
      FeeTypeId:null,
      Amount:null,
      AmountPaid:null,
      RefundAmount:null,
      TimeFrameType:null,
      ExhibitorId:null
    }
    isReadOnly:boolean=false

  ngOnInit(): void {
     this.ExhibitorId=this.data.ExhibitorId;
     this.ExhibitorName=this.data.ExhibitorName;
     this.getFees(this.data.feeDetails)
     this.isRefund=this.data.isRefund;
     this.getExhibitorTransactions(this.data.ExhibitorId);
     this.isReadOnly=this.data.isReadOnly;
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

  addTransaction(){
      this.loading = true;
      this.fee.RefundAmount=this.fee.RefundAmount !=null ? Number(this.fee.RefundAmount) :0;
      this.fee.FeeTypeId= Number(this.fee.FeeTypeId);
      this.fee.ExhibitorId=this.ExhibitorId;
      this.fee.Amount=this.fee.Amount !=null ? Number(this.fee.Amount) :0;
      this.fee.AmountPaid=this.fee.AmountPaid !=null ? Number(this.fee.AmountPaid) :0;
      this.fee.PayDate=moment(this.fee.PayDate).format("yyyy/MM/DD");
      this.exhibitorService.addTranaction(this.fee).subscribe(response => {
        this.loading = false;
        this.feeForm.resetForm({ classControl: null });
        this.resetFees();
        this.getExhibitorTransactions(this.ExhibitorId);
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
    
      }, error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
        this.loading = false;
      })   
  }

  resetFees(){
    this.fee.PayDate=null
    this.fee.PayDate=new Date()
    this.fee.FeeTypeId=null
    this.fee.Amount=null
    this.fee.AmountPaid=null
    this.fee.RefundAmount=null
    this.fee.TimeFrameType=null
    this.fee.ExhibitorId=null
    this.feeType=null;
    this.isSponsorRefund=false;
  }

  handleFeeDateSelection() {
    this.fee.PayDate = moment(this.fee.PayDate).format('MM-dd-yyyy');
  }

  setFeeType(e){
    let amount;
   this.fee.FeeTypeId=Number(e.target.value);
   this. feeType=e.target.options[e.target.options.selectedIndex].text;
    this.fee.TimeFrameType=this.timeframe;

   if(this.feeType =="Class Entry"
   || this.feeType=="Stall"
    || this.feeType=="Tack"
     || this.feeType=="Administration"
     || this.feeType=="NSBA Entry"){
     amount= this.filteredFee.find(i =>i.FeeName==this.feeType).Amount;
     this.isSponsorRefund=false
     this.fee.RefundAmount=null
     this.fee.AmountPaid=null
   }

   else if(this.feeType=="Sponsor Refund"){
    this.isSponsorRefund=true;
    this.fee.RefundAmount=null;
    this.fee.AmountPaid=null
   }
   
   else if(this.feeType=="Additional Programs"){
    this.isSponsorRefund=false;
    this.fee.TimeFrameType=null;
    this.fee.RefundAmount=null
    this.fee.AmountPaid=null
    amount=this.filteredFee.find(i =>i.FeeName==this.feeType).Amount;
  }
  else if(this.feeType=="Scratch Refund"){
    this.isSponsorRefund=true;
    this.fee.TimeFrameType=null
    this.fee.RefundAmount=null
    this.fee.AmountPaid=null
    amount=this.filteredFee.find(i =>i.FeeName==this.feeType).Amount;
  }
   else
   {
    this.fee.RefundAmount=null;
    this.isSponsorRefund=false
   }
   this.fee.Amount=amount;

  }

  viewDocument(path){
    if(path==null)
    {
      this.snackBar.openSnackBar('No document uploaded for display', 'Close', 'red-snackbar');
    }
      else{
        window.open(this.filesUrl+path.replace(/\s+/g, '%20'), '_blank');

    }
  }

 setAmount(feeType){
   if(feeType=="Pre")
   {
    this.filteredTimeframeFee=this.allFees.getFees.filter(x=>x.TimeFrameType==feeType);
    let amount=this.filteredTimeframeFee.find(i =>i.FeeName==this.feeType && i.TimeFrameType==feeType).Amount;
    this.fee.Amount=amount;
   }
   else{
    this.filteredTimeframeFee=this.allFees.getFees.filter(x=>x.TimeFrameType==feeType);
    let amount=this.filteredTimeframeFee.find(i =>i.FeeName==this.feeType && i.TimeFrameType==feeType).Amount;
    this.fee.Amount=amount;
   }
 }
  uploadDocument($event,id){
    this.loading = true;
    this.document=($event.target.files[0]);
    var reader = new FileReader();
    const file = $event.target.files[0];
    reader.readAsDataURL(file);
    const formData :any= new FormData();
   formData.append('exhibitorPaymentId',id);
   formData.append('document', this.document);
      this.exhibitorService.uploadFinancialDocument(formData).subscribe(response => {
       this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
       this.loading = false;
       this.document=null;
       this.getExhibitorTransactions(this.ExhibitorId);
     }
     , error => {
       this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
       this.loading = false;

     });
  }

  confirmDeleteFee(id){
    const message = `Are you sure you want to remove the transaction?`;
  const dialogData = new ConfirmDialogModel("Confirm Action", message);
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    maxWidth: "400px",
    data: dialogData
  });
  dialogRef.afterClosed().subscribe(dialogResult => {
    this.result = dialogResult;
    if (this.result) {
      this.deleteFee(id)
    }
  });
  }
  deleteFee(id){
    this.loading = true;
    this.exhibitorService.deleteFee(id).subscribe(response => {
      this.loading = false;
      this.getExhibitorTransactions(this.ExhibitorId);
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
    }, error => {
      this.snackBar.openSnackBar(error.error.Message, 'Close', 'red-snackbar');
      this.loading = false;
  
    })
  }

  getExhibitorTransactions(id){
    this.loading = true;
    this.exhibitorService.getExhibitorTransactions(id).subscribe(response => {
     this.exhibitorTransactions=response.Data.getExhibitorTransactions;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.exhibitorTransactions = null;
    }
    )
  }

  editTransaction(index, data) {
    this.updateMode = true;
    this.updateRowIndex = index;
    this.editRefund = data.RefundAmount,
    this.editAmount =data.AmountPaid
    this.isRefundEdit=data.TypeOfFee==='Scratch Refund' ? true :false
  }

  cancelEdit() {
    this.updateMode = false;
    this.updateRowIndex = -1;
    this.showEditInfo = false;
    this.editRefund = null;
    this.editAmount=null
    this.isRefundEdit=false
  }

  updateTransaction(fee) {
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var updateTransactionRequest={
        ExhibitorPaymentId:fee.ExhibitorPaymentDetailId,
        AmountReceived:this.editAmount==null ? 0 :Number(this.editAmount),
        RefundAmount:this.editRefund==null ? 0 :Number(this.editRefund),
      }

        this.exhibitorService.updateTranaction(updateTransactionRequest).subscribe(response => {
        this.getExhibitorTransactions(this.ExhibitorId);
        this.updateMode = false;
        this.updateRowIndex = -1;
        this.showEditInfo = false;
        this.editRefund = null;
        this.editAmount=null
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
  getFees(data){
    if(data !=null)
    {
  this.allFees=data;
  this.timeframe=data.DefaultTimeFrame
  this.filteredFee=data.getFees.filter(x=>x.TimeFrameType==this.timeframe || x.TimeFrameType=="");
  }
}
}
