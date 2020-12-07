import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseRecordFilterRequest } from '../../../../core/models/base-record-filter-request-model'
import { ExhibitorService } from '../../../../core/services/exhibitor.service';
import { GroupService } from '../../../../core/services/group.service';
import { MatDialog } from '@angular/material/dialog';
import { FilteredFinancialTransactionsComponent } from '../../../../shared/ui/modals/filtered-financial-transactions/filtered-financial-transactions.component';
import { FinancialTransactionsComponent } from 'src/app/shared/ui/modals/financial-transactions/financial-transactions.component';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
interface jsPDFWithPlugin extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}
import { MatSnackbarComponent } from '../../../../shared/ui/mat-snackbar/mat-snackbar.component'
import { ReportService } from 'src/app/core/services/report.service';
import { ReportemailComponent } from 'src/app/shared/ui/modals/reportemail/reportemail.component';
import * as moment from 'moment';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-financials',
  templateUrl: './financials.component.html',
  styleUrls: ['./financials.component.scss']
})
export class FinancialsComponent implements OnInit {
  @ViewChild('groupForm') groupForm: NgForm;

  loading = false;
  exhibitorsList: any;
  filterExhibitorList: any;
  groupsList: any;
  filterGroupList: any;
  selectedExhibitor: string = "";
  selectedGroup: string = "";
  billedSummary: any;
  receievedSummary: any;
  outstanding: any;
  overPayment: any;
  feeBilledTotal: any;
  moneyReceivedTotal: any
  refunds: any;
  exhibitorId: number;
  groupId: number = -1;
  groupDetails: any;
  firstName: string = "";
  lastName: string = "";
  reportemailid: string = "";
  groupFinancials: any;
  exhibitorTransactions: any;

  exhibitorRequest: BaseRecordFilterRequest = {
    Page: 1,
    Limit: 5,
    OrderBy: 'ExhibitorId',
    OrderByDescending: true,
    AllRecords: true,
    SearchTerm: null
  };
  groupRequest: BaseRecordFilterRequest = {
    Page: 1,
    Limit: 5,
    OrderBy: 'GroupId',
    OrderByDescending: true,
    AllRecords: true,
    SearchTerm: null
  };

  constructor(private exhibitorService: ExhibitorService,
    private groupService: GroupService,
    private snackBar: MatSnackbarComponent,
    private reportService: ReportService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getAllExhibitors();
    this.getAllGroups();
    this.getAllGroupsFinancials();
  }

  getAllExhibitors() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.exhibitorService.getAllExhibitors(this.exhibitorRequest).subscribe(response => {
        this.exhibitorsList = response.Data.exhibitorResponses;
        this.filterExhibitorList = response.Data.exhibitorResponses;
        this.loading = false;
      }, error => {
        this.loading = false;
      }
      )
      resolve();
    });
  }

  getAllGroups() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.groupsList = null;
      this.groupService.getAllGroups(this.groupRequest).subscribe(response => {
        if (response.Data != null && response.Data.TotalRecords > 0) {
          this.groupsList = response.Data.groupResponses;
          this.filterGroupList = response.Data.groupResponses;
        }
        this.loading = false;
      }, error => {
        this.loading = false;
      })
      resolve();
    });
  }

  filterExhibitor(value) {
    const filterValue = value.toLowerCase();
    this.filterExhibitorList = this.exhibitorsList.filter(option => option.FirstName.toLowerCase().indexOf(filterValue) === 0 || (option.LastName.toLowerCase().indexOf(filterValue) === 0));
  }

  filterGroup(value) {
    const filterValue = value.toLowerCase();
    this.filterGroupList = this.groupsList.filter(option => option.GroupName.toLowerCase().indexOf(filterValue) === 0);
  }

  getBilllingDetails(exhibitor, event: any) {
    if (event.isUserInput) {
      this.firstName = exhibitor.FirstName;
      this.lastName = exhibitor.LastName;
      this.getbilledFeesSummary(exhibitor.ExhibitorId);
      this.getExhibitorTransactions(exhibitor.ExhibitorId)
    }
  }

  getbilledFeesSummary(exhibitorId) {
    this.loading = true;
    this.exhibitorId = Number(exhibitorId)
    this.exhibitorService.getbilledFeesSummary(this.exhibitorId).subscribe(response => {
      this.billedSummary = response.Data.exhibitorFeesBilled;
      this.feeBilledTotal = response.Data.FeeBilledTotal
      this.receievedSummary = response.Data.exhibitorMoneyReceived
      this.moneyReceivedTotal = response.Data.MoneyReceivedTotal
      this.overPayment = response.Data.OverPayment
      this.outstanding = response.Data.Outstanding
      this.refunds = response.Data.Refunds
      this.loading = false;
    }, error => {
      this.loading = false;
      this.billedSummary = null;
      this.receievedSummary = null;
      this.feeBilledTotal = null;
      this.moneyReceivedTotal = null;
      this.overPayment = null
      this.outstanding = null
      this.refunds = null
    })
  }

  getExhibitorTransactions(id) {
    this.loading = true;
    this.exhibitorService.getExhibitorTransactions(Number(id)).subscribe(response => {
      this.exhibitorTransactions = response.Data.getExhibitorTransactions;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.exhibitorTransactions = null;
    }
    )
  }

  openTransactionDetails(id) {
    var data = {
      feeTypeId: id,
      exhibitorId: this.exhibitorId,
    }

    const dialogRef = this.dialog.open(FilteredFinancialTransactionsComponent, {
      maxWidth: "400px",
      data
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
    });
  }



  setGroup(value) {
    if (value == "All") {
      this.groupId = -1;
      this.getAllGroupsFinancials();
      this.groupForm.resetForm({ groupauto: null });
    }
  }

  showFinancialTransaction() {
    var data = {
      ExhibitorId: this.exhibitorId,
      ExhibitorName: this.firstName + ' ' + this.lastName,
      isRefund: false,
      feeDetails: null,
      isReadOnly: true
    }
    const dialogRef = this.dialog.open(FinancialTransactionsComponent, {
      maxWidth: "500px",
      data
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
    });
  }

  downloadExhibitorSummaryReport(action) {
    if (this.exhibitorId == null || this.exhibitorId == undefined || Number(this.exhibitorId) <= 0) {
      this.snackBar.openSnackBar("Please select exhibitor!", 'Close', 'red-snackbar');
      return;
    }

    if(this.billedSummary !=null)
{
    this.billedSummary.forEach(ele => {
      ele.FormattedAmount = "$" + String(ele.Amount)
    });
  }

    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    var text = String(new Date().getFullYear() + '&nbsp<b>Administrative Report</b>');
    var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    var pageHeight = doc.internal.pageSize.height; //get total page height

    let yaxis = 35;
    doc.fromHTML('<b>Summary of Fees Billed to Exhibitor</b>', textOffset, 23);
    doc.setFontSize(9)
    doc.text('Exhibitor :' + " " + this.firstName + ' ' + this.lastName, 10, 35)
    doc.autoTable({
      body: this.billedSummary,
      columns:
        [
          { header: 'QTY', dataKey: 'Qty' },
          { header: 'FEE', dataKey: 'FeeType' },
          { header: 'AMOUNT', dataKey: 'FormattedAmount' },
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: yaxis + 5
    })

    let finalY = (doc as any).lastAutoTable.finalY;
    doc.fromHTML('<b>Total :</b> ' + this.feeBilledTotal, 150, finalY + 10);

    doc.fromHTML('<b>Money Received from Exhibitor</b>', textOffset, finalY + 25);
    if(this.receievedSummary !=null)
    {
    this.receievedSummary.forEach(ele => {
      ele.FormattedAmount = "$" + String(ele.Amount),
        ele.FormattedDate = String(moment(ele.Date).format('MM-DD-yyyy'))
    });
  }

    doc.autoTable({
      body: this.receievedSummary,
      columns:
        [
          { header: 'DATE', dataKey: 'FormattedDate' },
          { header: 'AMOUNT', dataKey: 'FormattedAmount' },
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: finalY + 35
    })
    finalY = (doc as any).lastAutoTable.finalY;
    doc.fromHTML('<b>Total :</b> ' + this.moneyReceivedTotal, 150, finalY + 10);


    doc.fromHTML('<b>Financial Transaction details</b>', textOffset, finalY + 25);
    if(this.receievedSummary !=null)
    {
    this.exhibitorTransactions.forEach(ele => {
      ele.FormattedAmount = "$" + String(ele.Amount),
        ele.FormattedDate = String(moment(ele.PayDate).format('MM-DD-yyyy')),
        ele.FormattedAmountPaid = "$" + String(ele.AmountPaid),
        ele.FormattedRefundAmount = "$" + String(ele.RefundAmount)
    });
    doc.autoTable({
      body: this.exhibitorTransactions,
      columns:
        [
          { header: 'DATE', dataKey: 'FormattedDate' },
          { header: 'TRANSACTION TYPE', dataKey: 'TypeOfFee' },
          { header: 'PRE/POST', dataKey: 'TimeFrameType' },
          { header: 'AMT CHARGE PER TYPE', dataKey: 'FormattedAmount' },
          { header: 'AMT RECEIVED', dataKey: 'FormattedAmountPaid' },
          { header: ' REFUND AMT', dataKey: 'FormattedRefundAmount' }
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: finalY + 35
    })
  }
    finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontType("bold");
debugger;
    // check page length 
    if (pageHeight < finalY + 10) {
      doc.addPage();
      doc.text('OUTSTANDING : $' + this.outstanding, 150,7);
      doc.text('OVERPAYMENT :  $' + this.overPayment, 150, 14);
      doc.text('REFUND :  $' + this.refunds, 150, 21);

    }
    else {
      doc.text('OUTSTANDING :  $' + this.outstanding, 150, finalY + 25);
      if (pageHeight < finalY + 32) {
        doc.addPage();
        doc.text('OVERPAYMENT :  $' + this.overPayment, 150, 7);
        doc.text('REFUND :  $' + this.refunds, 150, 14);
  
      }
      else {
        doc.text('OVERPAYMENT :  $'+ this.overPayment, 150, finalY + 32);
      }
      if (pageHeight < finalY + 39) {
        doc.addPage();
        doc.text('REFUND :  $' + this.refunds, 150,  7);
      }
      else {
        doc.text('REFUND :  $' + this.refunds, 150, finalY + 39);
  
      }
    }

    if (action == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }


    if (action == "print") {
      var blobPDF = new Blob([doc.output()], { type: 'application/pdf' });
      var fileURL = URL.createObjectURL(blobPDF);
      var printFile = window.open(fileURL);
      setTimeout(function () {
        printFile.print();
      }, 2000);
      this.loading = false;
    }

    if (action == "email") {
      this.loading = true;
      var datauristring = doc.output('datauristring');
      var data = {
        emailid: this.reportemailid,
        reportfile: datauristring
      }
      this.reportService.SaveAndEmail(data).subscribe(response => {
        if (response != null && response != undefined) {
          this.snackBar.openSnackBar(response.message, 'Close', 'green-snackbar');
        }
        this.loading = false;
      },
        error => {
          this.snackBar.openSnackBar("Error!", 'Close', 'red-snackbar');
          this.loading = false;
        }

      )
    }
  }

  setreportType(type) {
    if (this.exhibitorId == null || this.exhibitorId == undefined || Number(this.exhibitorId) <= 0) {
      this.snackBar.openSnackBar("Please select exhibitor!", 'Close', 'red-snackbar');
      return;
    }
    if (type == "email") {
      const dialogRef = this.dialog.open(ReportemailComponent, {
        maxWidth: "400px",
        data: ""
      });
      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult != null && dialogResult != undefined) {
          if (dialogResult.submitted == true) {
            this.reportemailid = dialogResult.data;
            this.downloadExhibitorSummaryReport('email');
          }
        }

      });
    }

  }

  getAllGroupFinancials(id, event: any) {
    if (event.isUserInput) {
      this.groupId = Number(id);
      return new Promise((resolve, reject) => {
        this.loading = true;
        this.groupsList = null;
        this.groupService.getAllGroupFinancials(this.groupId).subscribe(response => {
          if (response.Data != null) {
            this.groupFinancials = response.Data.getGroupFinacialsTotalsList;
          }
          this.loading = false;
        }, error => {
          this.loading = false;
        })
        resolve();
      });
    }
  }

  getAllGroupsFinancials() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.groupsList = null;
      this.groupService.getAllGroupsFinancials().subscribe(response => {
        if (response.Data != null) {
          debugger;
          this.groupFinancials = response.Data.getGroupFinacialsTotalsList;
        }
        this.loading = false;
      }, error => {
        this.loading = false;
      })
      resolve();
    });
  }

  setEmail() {
    if (this.groupId == null || this.groupId == undefined) {
      this.snackBar.openSnackBar("Please select group!", 'Close', 'red-snackbar');
      return;
    }
    const dialogRef = this.dialog.open(ReportemailComponent, {
      maxWidth: "400px",
      data: ""
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult != null && dialogResult != undefined) {
        if (dialogResult.submitted == true) {
          this.reportemailid = dialogResult.data;
          this.downloadFinancial('email');
        }
      }
    });
  }

  downloadFinancial(action) {
    if (this.groupId == null || this.groupId == undefined) {
      this.snackBar.openSnackBar("Please select group!", 'Close', 'red-snackbar');
      return;
    }

    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(10);
    if(this.groupFinancials !=null)
    {
        this.groupFinancials.forEach(ele => {
          ele.FormattedPreTotal = "$" + String(ele.PreTotal)
          ele.FormattedPostTotal = "$" + String(ele.PostTotal)
          ele.FormattedPrePostTotal = "$" + String(ele.PrePostTotal)
        });
      }
    doc.autoTable({
      body: this.groupFinancials,
      columns:
        [
          { header: 'Group Name', dataKey: 'GroupName' },
          { header: 'Pre Total', dataKey: 'FormattedPreTotal' },
          { header: 'Post', dataKey: 'FormattedPostTotal' },
          { header: 'Total', dataKey: 'FormattedPrePostTotal' },
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: 10
    })


    if (action == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }


    if (action == "print") {
      var blobPDF = new Blob([doc.output()], { type: 'application/pdf' });
      var fileURL = URL.createObjectURL(blobPDF);
      var printFile = window.open(fileURL);
      setTimeout(function () {
        printFile.print();
      }, 2000);

      this.loading = false;

    }

    if (action == "email") {
      this.loading = true;
      var datauristring = doc.output('datauristring');
      var data = {
        emailid: this.reportemailid,
        reportfile: datauristring
      }
      this.reportService.SaveAndEmail(data).subscribe(response => {
        if (response != null && response != undefined) {
          this.snackBar.openSnackBar(response.message, 'Close', 'green-snackbar');
        }
        this.loading = false;
      },
        error => {
          this.snackBar.openSnackBar("Error!", 'Close', 'red-snackbar');
          this.loading = false;
        }

      )
    }
  }

}
