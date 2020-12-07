import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ReportemailComponent } from 'src/app/shared/ui/modals/reportemail/reportemail.component';
import { ReportService } from 'src/app/core/services/report.service';
import { MatSnackbarComponent } from '../../../../shared/ui/mat-snackbar/mat-snackbar.component'
import * as moment from 'moment';
import { ExhibitorService } from '../../../../core/services/exhibitor.service';
import { BaseRecordFilterRequest } from '../../../../core/models/base-record-filter-request-model'
import { GroupService } from 'src/app/core/services/group.service';

import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
import * as jsPDF from 'jspdf';

interface jsPDFWithPlugin extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}


@Component({
  selector: 'app-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss']
})
export class StatementsComponent implements OnInit {
  loading: boolean = false;
  reportType: string = "";
  reportemailid: string = "";
  ExhibitorSponsorConfirmationReportResponse: any;
  ExhibitorGroupInformationReportResponse: any;
  ExhibitorSponsorRefundReportResponse: any;



  exhibitorBaseRequest: BaseRecordFilterRequest = {
    Page: 1,
    Limit: 5,
    OrderBy: 'ExhibitorId',
    OrderByDescending: true,
    AllRecords: true,
    SearchTerm: null
  };

  groupBaseRequest: BaseRecordFilterRequest = {
    Page: 1,
    Limit: 5,
    OrderBy: 'GroupId',
    OrderByDescending: true,
    AllRecords: true,
    SearchTerm: null

  }

  selectedRowIndex: any;
  exhibitorsList: any;
  groupsList: any;
  filteredExhibitorsList: any;
  filteredExhibitorsList2: any;
  filteredGroupsList: any;

  selectedexhibitorsponsorconfirmname: string = "";
  selectedexhibitorsponsorrefundname: string = "";
  selectedgroupstatementname: string = "";

  LinkedExhibitorSponsorConfirmID: number = null;
  LinkedExhibitorSponsorRefundID: number = null;
  LinkedGroupStatementID: number = null;

  allExhibitorSponsorConfirm: boolean = true;
  allExhibitorSponsorRefund: boolean = true;
  allGroupStatement: boolean = true;


  constructor(
    private groupService: GroupService,
    public dialog: MatDialog,
    private reportService: ReportService,
    private snackBar: MatSnackbarComponent,
    private exhibitorService: ExhibitorService,
  ) {

  }

  ngOnInit(): void {
    this.getAllExhibitors();
    this.getAllGroups();
  }


  getAllExhibitors() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.exhibitorService.getAllExhibitors(this.exhibitorBaseRequest).subscribe(response => {
        this.exhibitorsList = response.Data.exhibitorResponses;
        this.filteredExhibitorsList = response.Data.exhibitorResponses;
        this.filteredExhibitorsList2 = response.Data.exhibitorResponses;
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
      this.groupService.getAllGroups(this.groupBaseRequest).subscribe(response => {
        if (response.Data != null && response.Data.TotalRecords > 0) {
          this.groupsList = response.Data.groupResponses;
          this.filteredGroupsList = response.Data.groupResponses;
        }
        this.loading = false;
      }, error => {

        this.loading = false;
      })
      resolve();
    });
  }

  setreportType(type: string, name: string) {


    this.reportType = type;

    if (type == "email") {
      const dialogRef = this.dialog.open(ReportemailComponent, {
        maxWidth: "400px",
        data: ""
      });
      dialogRef.afterClosed().subscribe(dialogResult => {

        if (dialogResult != null && dialogResult != undefined) {
          if (dialogResult.submitted == true) {
            this.reportemailid = dialogResult.data;
            this.getReportData(name);
          }
        }

      });
    }
    else {
      this.getReportData(name);
    }
  }

  getReportData(name: string) {

    if (name == "ExhibitorSponsorConfirmationStatement") {
      if (this.allExhibitorSponsorConfirm == true) {
        this.getExhibitorSponsorConfirmationReportForAllExhibitors();
      } else {
        if (this.LinkedExhibitorSponsorConfirmID == null || this.LinkedExhibitorSponsorConfirmID == undefined ||
          Number(this.LinkedExhibitorSponsorConfirmID) == 0) {
          this.snackBar.openSnackBar("Please select exhibitor", 'Close', 'red-snackbar');
          return;
        }
        this.getExhibitorSponsorConfirmationReport(this.LinkedExhibitorSponsorConfirmID);
      }
    }


    else if (name == "GroupStatementReport") {
      if (this.allGroupStatement == true) {
        this.getExhibitorGroupInformationReportForAllGroups();
      } else {

        if (this.LinkedGroupStatementID == null || this.LinkedGroupStatementID == undefined ||
          Number(this.LinkedGroupStatementID) == 0) {
          this.snackBar.openSnackBar("Please select group", 'Close', 'red-snackbar');
          return;
        }

        this.getExhibitorGroupInformationReport(this.LinkedGroupStatementID);
      }
    }


    else if (name == "ExhibitorSponsorRefundStatement") {

      if (this.allExhibitorSponsorRefund == true) {
        this.getExhibitorsSponsorRefundReportForAllExhibitors();
      }
      else {
        if (this.LinkedExhibitorSponsorRefundID == null || this.LinkedExhibitorSponsorRefundID == undefined ||
          Number(this.LinkedExhibitorSponsorRefundID) == 0) {
          this.snackBar.openSnackBar("Please select exhibitor", 'Close', 'red-snackbar');
          return;
        }
        this.getExhibitorSponsorRefundReport(this.LinkedExhibitorSponsorRefundID);
      }


    }
  }




  getExhibitorGroupInformationReport(id) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.ExhibitorGroupInformationReportResponse = [];
      this.reportService.getExhibitorGroupInformationReport(id).subscribe(response => {
        if (response.Data != null && response.Data != undefined) {
          debugger
          this.ExhibitorGroupInformationReportResponse.push(response.Data);
          this.saveExhibitorGroupInformationReportPDF();
        }
        else {
          this.snackBar.openSnackBar("No data available", 'Close', 'red-snackbar');
          this.loading = false;
        }
      }, error => {
        this.ExhibitorGroupInformationReportResponse = [];
        this.loading = false;
        this.snackBar.openSnackBar("Error!", 'Close', 'red-snackbar');
      })
      resolve();
    });
  }

  getExhibitorGroupInformationReportForAllGroups() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.ExhibitorGroupInformationReportResponse = [];
      this.reportService.getExhibitorGroupInformationReportForAllGroups().subscribe(response => {
        if (response.Data != null && response.Data != undefined) {
          debugger
          this.ExhibitorGroupInformationReportResponse.push(response.Data);
          this.saveExhibitorGroupInformationReportPDF();
        }
        else {
          this.snackBar.openSnackBar("No data available", 'Close', 'red-snackbar');
          this.loading = false;
        }
      }, error => {
        this.ExhibitorGroupInformationReportResponse = [];
        this.loading = false;
        this.snackBar.openSnackBar("Error!", 'Close', 'red-snackbar');
      })
      resolve();
    });
  }


  getExhibitorSponsorConfirmationReport(id) {

    return new Promise((resolve, reject) => {
      this.loading = true;
      this.ExhibitorSponsorConfirmationReportResponse = [];
      var data = {
        ExhibitorId: id,
        HorseId: 0
      };
      this.reportService.getExhibitorSponsorConfirmationReport(data).subscribe(response => {
        debugger
        if (response.Data != null && response.Data != undefined) {

          this.ExhibitorSponsorConfirmationReportResponse.push(response.Data);
          this.saveExhibitorSponsorConfirmationReportPDF();
        }
        else {
          this.snackBar.openSnackBar("No data available", 'Close', 'red-snackbar');
          this.loading = false;
        }

      }, error => {
        this.ExhibitorSponsorConfirmationReportResponse = [];
        this.loading = false;
        this.snackBar.openSnackBar("Error!", 'Close', 'red-snackbar');
      })
      resolve();
    });

  }

  getExhibitorSponsorConfirmationReportForAllExhibitors() {

    return new Promise((resolve, reject) => {
      this.loading = true;
      this.ExhibitorSponsorConfirmationReportResponse = [];

      this.reportService.getExhibitorSponsorConfirmationReportForAllExhibitors().subscribe(response => {
        debugger
        if (response.Data != null && response.Data != undefined) {

          this.ExhibitorSponsorConfirmationReportResponse.push(response.Data);
          this.saveExhibitorSponsorConfirmationReportPDF();
        }
        else {
          this.snackBar.openSnackBar("No data available", 'Close', 'red-snackbar');
          this.loading = false;
        }

      }, error => {
        this.ExhibitorSponsorConfirmationReportResponse = [];
        this.loading = false;
        this.snackBar.openSnackBar("Error!", 'Close', 'red-snackbar');
      })
      resolve();
    });

  }


  getExhibitorSponsorRefundReport(id) {

    return new Promise((resolve, reject) => {
      this.loading = true;
      this.ExhibitorSponsorRefundReportResponse = [];

      this.reportService.getExhibitorSponsorRefundReport(id).subscribe(response => {
        if (response.Data != null && response.Data != undefined) {
          this.ExhibitorSponsorRefundReportResponse.push(response.Data);
          this.saveExhibitorSponsorRefundReportPDF();
        }
        else {
          this.snackBar.openSnackBar("No data available", 'Close', 'red-snackbar');
          this.loading = false;
        }

      }, error => {
        this.ExhibitorSponsorRefundReportResponse = [];
        this.loading = false;
        this.snackBar.openSnackBar("Error!", 'Close', 'red-snackbar');
      })
      resolve();
    });

  }

  getExhibitorsSponsorRefundReportForAllExhibitors() {

    return new Promise((resolve, reject) => {
      this.loading = true;
      this.ExhibitorSponsorRefundReportResponse = [];

      this.reportService.getExhibitorsSponsorRefundReportForAllExhibitors().subscribe(response => {
        if (response.Data != null && response.Data != undefined) {
          this.ExhibitorSponsorRefundReportResponse.push(response.Data);
          this.saveExhibitorSponsorRefundReportPDF();
        }
        else {
          this.snackBar.openSnackBar("No data available", 'Close', 'red-snackbar');
          this.loading = false;
        }

      }, error => {
        this.ExhibitorSponsorRefundReportResponse = [];
        this.loading = false;
        this.snackBar.openSnackBar("Error!", 'Close', 'red-snackbar');
      })
      resolve();
    });

  }





  saveExhibitorSponsorConfirmationReportPDF(): void {



    let y = 10;
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;


    var reportdatalist = [];
    if (this.allExhibitorSponsorConfirm == true) {

      reportdatalist = this.ExhibitorSponsorConfirmationReportResponse[0].getExhibitorSponsorConfirmationReports;


    } else {

      reportdatalist.push(this.ExhibitorSponsorConfirmationReportResponse[0])
    }


    reportdatalist.forEach(reportdata => {

      var img = new Image()
      img.src = 'assets/images/logo.png'
      doc.addImage(img, 'png', 10, 5, 16, 20)

      reportdata.horseinfo.forEach(info => {
        doc.setFontSize(13);
        var text = "AAYHS ADS AND SPONSORS";
        doc.text(120, y, text);
        y = y + 5;

        doc.setFontSize(10);



        doc.text(this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.Address != null
          && this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.Address != undefined
          ? this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.Address : "", 120, y);

        var cityname = this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.CityName != null
          && this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.CityName != undefined
          ? this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.CityName : "";
        var statename = this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.StateZipcode != null
          && this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.StateZipcode != undefined
          ? this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.StateZipcode : "";

        doc.text(cityname + ", " + statename, 120, y + 5)


        y = y - 5;


        doc.text(this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.Phone1 != null
          && this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.Phone1 != undefined
          ? this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.Phone1 : "", 120, y + 15);


        doc.text(this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.Email1 != null
          && this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.Email1 != undefined
          ? this.ExhibitorSponsorConfirmationReportResponse[0].getAAYHSContactInfo.Email1 : "", 120, y + 20);


        y = y + 40;




        doc.text(reportdata.exhibitorinfo.ExhibitorName != null &&
          reportdata.exhibitorinfo.ExhibitorName != undefined ?
          reportdata.exhibitorinfo.ExhibitorName : ""
          , 10, y);


        doc.text(info.HorseName != null && info.HorseName != undefined ? "Horse Name :  " + info.HorseName : "Horse Name : ", 120, y);


        doc.text(reportdata.exhibitorinfo.Address != null &&
          reportdata.exhibitorinfo.Address != undefined ?
          reportdata.exhibitorinfo.Address : ""
          , 10, y + 5);


        doc.text('Print Date :', 120, y + 5);
        var newdate = new Date()
        doc.text(String(moment(new Date()).format('MM-DD-yyyy')), 140, y + 5);


        let city = reportdata.exhibitorinfo.CityName != null &&
          reportdata.exhibitorinfo.CityName != undefined ?
          reportdata.exhibitorinfo.CityName : "";

        let state = reportdata.exhibitorinfo.StateZipcode != null &&
          reportdata.exhibitorinfo.StateZipcode != undefined ?
          reportdata.exhibitorinfo.StateZipcode : "";


        doc.text(city + ", " + state, 10, y + 10);



        doc.text(reportdata.exhibitorinfo.Phone != null &&
          reportdata.exhibitorinfo.Phone != undefined ?
          reportdata.exhibitorinfo.Phone : ""
          , 10, y + 15);



        doc.text(reportdata.exhibitorinfo.Email != null &&
          reportdata.exhibitorinfo.Email != undefined ?
          reportdata.exhibitorinfo.Email : ""
          , 10, y + 20);

        y = y + 7;


        var reporttext = this.ExhibitorSponsorConfirmationReportResponse[0].ReportText != null &&
          this.ExhibitorSponsorConfirmationReportResponse[0].ReportText != undefined ?
          this.ExhibitorSponsorConfirmationReportResponse[0].ReportText : "";

        reporttext = reporttext.replace("      ", " ");
        reporttext = reporttext.replace("     ", " ");
        reporttext = reporttext.replace("    ", " ");
        reporttext = reporttext.replace("   ", " ");
        reporttext = reporttext.replace("  ", " ");
        var length = reporttext.length;

        var lMargin = 10; //left margin in mm
        var rMargin = 10; //right margin in mm
        var pdfInMM = 210;  // width of A4 in mm
        var lines = doc.splitTextToSize(reporttext, (pdfInMM - lMargin - rMargin));
        doc.text(lMargin, y + 25, lines);

        // var splitreporttext = doc.splitTextToSize(reporttext, 280);
        // doc.text(splitreporttext, 10, y + 25);


        y = y + 30;

        doc.text(reportdata.exhibitorinfo.ExhibitorId != null &&
          reportdata.exhibitorinfo.ExhibitorId != undefined ? "Exhibitor Id:  " +
          String(reportdata.exhibitorinfo.ExhibitorId) : "Exhibitor Id:  "
          , 10, y + 30);



        doc.text(info.HorseName != null && info.HorseName != undefined ? "Horse Name:  " + info.HorseName : "Horse Name:  ", 120, y + 30);

        info.sponsordetail.forEach(ele => {
          ele.FormattedAmount = "$" + String(ele.Amount)
        });


        doc.autoTable({
          body: info.sponsordetail,
          columns:
            [
              { header: 'Sponsor Name', dataKey: 'SponsorName' },
              { header: 'Sponsor Id', dataKey: 'SponsorId' },
              { header: 'Amount Received', dataKey: 'FormattedAmount' },

            ],
          margin: { vertical: 35, horizontal: 10 },
          startY: y + 40
        })
        let finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.text(info.SponsorAmountTotal != null && info.SponsorAmountTotal != undefined ? "Total Amount:   " + "$" +
          String(info.SponsorAmountTotal) : "Total Amount:   ", 150, finalY);

        var lastrecord = reportdata.horseinfo[reportdata.horseinfo.length - 1];
        if (lastrecord === info) {

        }
        else {
          doc.addPage();
          y = 10;
        }

      });


      var lastrecord2 = reportdatalist[reportdatalist.length - 1];
      if (lastrecord2 === reportdata) {

      }
      else {
        doc.addPage();
        y = 10;
      }


    });



    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('ExhibitorSponsorConfirmationReportPDF.pdf');
      this.loading = false;
    }

    if (this.reportType == "print") {
      var printFile = window.open(doc.output('bloburl'))
      setTimeout(function () {
        printFile.print();
      }, 2000);
      this.loading = false;
    }

    if (this.reportType == "email") {
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

  saveExhibitorGroupInformationReportPDF(): void {
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(10);
    let y = 7;

    var reportdatalist = [];
    if (this.allGroupStatement == true) {

      reportdatalist = this.ExhibitorGroupInformationReportResponse[0].getExhibitorGroupInformationReports;


    } else {

      reportdatalist.push(this.ExhibitorGroupInformationReportResponse[0])
    }


    reportdatalist.forEach(reportdata => {

      var img = new Image()
      img.src = 'assets/images/logo.png'
      doc.addImage(img, 'png', 10, y, 16, 20)
      y = 10;

      doc.text(this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.Address != null
        && this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.Address != undefined
        ? this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.Address : "", 135, y);


      doc.text(this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.CityName != null
        && this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.CityName != undefined
        ? this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.CityName : "", 135, y + 5)


      doc.text(this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.StateZipcode != null
        && this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.StateZipcode != undefined
        ? this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.StateZipcode : "", 135, y + 10)


      doc.text(this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.Phone1 != null
        && this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.Phone1 != undefined
        ? this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.Phone1 : "", 135, y + 15);


      doc.text(this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.Email1 != null
        && this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.Email1 != undefined
        ? this.ExhibitorGroupInformationReportResponse[0].getAAYHSContactInfo.Email1 : "", 135, y + 20);


      doc.text('Print Date :', 135, y + 30);
      var newdate = new Date()
      doc.text(String(moment(new Date()).format('MM-DD-yyyy')), 155, y + 30);

      y = y + 5;

      doc.line(0, y + 30, 300, y + 30);

      doc.setLineWidth(5.0);

      y = y + 7;

      doc.text('Stall Assignments', 10, y + 35);

      if (reportdata.stallAndTackStallNumber.horseStalls.length > 0) {
        var horsestall = "";
        reportdata.stallAndTackStallNumber.horseStalls.forEach(element => {
          horsestall = horsestall + ", " + element.HorseStallNumber
        });
        horsestall = horsestall.replace(/^,|,$/g, '');
        doc.text(horsestall, 50, y + 35);
      }

      doc.text('Tack Stall Assignments', 10, y + 40);
      if (reportdata.stallAndTackStallNumber.tackStalls.length > 0) {
        var tackstall = "";
        reportdata.stallAndTackStallNumber.tackStalls.forEach(element => {
          tackstall = tackstall + ", " + element.TackStallNumber
        });
        tackstall = tackstall.replace(/^,|,$/g, '');
        doc.text(tackstall, 50, y + 40);
      }





      y = y + 15;

      doc.text(reportdata.getGroupInfo.GroupName != null &&
        reportdata.getGroupInfo.GroupName != undefined ?
        reportdata.getGroupInfo.GroupName : ""
        , 10, y + 40);


      doc.text(reportdata.getGroupInfo.Address != null &&
        reportdata.getGroupInfo.Address != undefined ?
        reportdata.getGroupInfo.Address : ""
        , 10, y + 45);

      let city = reportdata.getGroupInfo.CityName != null &&
        reportdata.getGroupInfo.CityName != undefined ?
        reportdata.getGroupInfo.CityName : "";

      let state = reportdata.getGroupInfo.StateZipcode != null &&
        reportdata.getGroupInfo.StateZipcode != undefined ?
        reportdata.getGroupInfo.StateZipcode : ""


      doc.text(city + ", " + state, 10, y + 50);


      doc.text(reportdata.getGroupInfo.Phone != null &&
        reportdata.getGroupInfo.Phone != undefined ?
        reportdata.getGroupInfo.Phone : ""
        , 10, y + 55);



      doc.text(reportdata.getGroupInfo.Email != null &&
        reportdata.getGroupInfo.Email != undefined ?
        reportdata.getGroupInfo.Email : ""
        , 10, y + 60);

      let finalY = y + 70;

      doc.text('Fees:', 90, finalY);
      doc.text('Total Quantity:', 140, finalY);
      doc.text('Total Amount:', 170, finalY);

      finalY = finalY + 10;


      doc.text('Total Horse Stall:', 90, finalY);

      doc.text(reportdata.financialsDetail.HorseStallQty != null &&
        reportdata.financialsDetail.HorseStallQty != undefined ?
        String(reportdata.financialsDetail.HorseStallQty) : ""
        , 150, finalY);


      doc.text(reportdata.financialsDetail.HorseStallAmount != null &&
        reportdata.financialsDetail.HorseStallAmount != undefined ?
        String(reportdata.financialsDetail.HorseStallAmount) : ""
        , 180, finalY);

      finalY = finalY + 5;



      doc.text('Total Tack stall:', 90, finalY);
      doc.text(reportdata.financialsDetail.TackStallQty != null &&
        reportdata.financialsDetail.TackStallQty != undefined ?
        String(reportdata.financialsDetail.TackStallQty) : ""
        , 150, finalY);
      doc.text(reportdata.financialsDetail.TackStallAmount != null &&
        reportdata.financialsDetail.TackStallAmount != undefined ?
        String(reportdata.financialsDetail.TackStallAmount) : ""
        , 180, finalY);

      finalY = finalY + 5;

      doc.text('Overpayment Refund:', 90, finalY);
      doc.text(reportdata.financialsDetail.Refund != null &&
        reportdata.financialsDetail.Refund != undefined ?
        String(reportdata.financialsDetail.Refund) : ""
        , 180, finalY);

      finalY = finalY + 10;



      doc.text('Total Amount:', 90, finalY);
      doc.text(reportdata.financialsDetail.AmountDue != null &&
        reportdata.financialsDetail.AmountDue != undefined ?
        String(reportdata.financialsDetail.AmountDue) : ""
        , 180, finalY);

      finalY = finalY + 5;

      doc.text('Received Amount:', 90, finalY);
      doc.text(reportdata.financialsDetail.ReceivedAmount != null &&
        reportdata.financialsDetail.ReceivedAmount != undefined ?
        String(reportdata.financialsDetail.ReceivedAmount) : ""
        , 180, finalY);


      finalY = finalY + 10;

      doc.text('Overpayment:', 90, finalY);
      doc.text(reportdata.financialsDetail.Overpayment != null &&
        reportdata.financialsDetail.Overpayment != undefined ?
        String(reportdata.financialsDetail.Overpayment) : ""
        , 180, finalY);

      finalY = finalY + 5;

      doc.text('Balance Due:', 90, finalY);
      doc.text(reportdata.financialsDetail.BalanceDue != null &&
        reportdata.financialsDetail.BalanceDue != undefined ?
        String(reportdata.financialsDetail.BalanceDue) : ""
        , 180, finalY);

      finalY = finalY + 10;


      doc.autoTable({
        body: reportdata.exhibitorDetails,
        columns:
          [
            { header: 'Exhibitor Name', dataKey: 'ExhibitorName' }
          ],
        margin: { vertical: 35, horizontal: 10 },
        startY: finalY
      })


      var lastrecord = reportdatalist[reportdatalist.length - 1];
      if (lastrecord === reportdata) {

      }
      else {
        doc.addPage();
        y = 5;
      }




    });


    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('ExhibitorGroupInformationReportPDF.pdf');
      this.loading = false;
    }

    if (this.reportType == "print") {
      var printFile = window.open(doc.output('bloburl'))
      setTimeout(function () {
        printFile.print();
      }, 2000);
      this.loading = false;

    }

    if (this.reportType == "email") {
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

  saveExhibitorSponsorRefundReportPDF(): void {

    let y = 10;
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;


    var reportdatalist = [];
    if (this.allExhibitorSponsorRefund == true) {

      reportdatalist = this.ExhibitorSponsorRefundReportResponse[0].exhibitorsHorseAndSponsors;


    } else {

      reportdatalist.push(this.ExhibitorSponsorRefundReportResponse[0])
    }
    reportdatalist.forEach(reportdata => {

      var img = new Image()
      img.src = 'assets/images/logo.png'
      doc.addImage(img, 'png', 10, 7, 16, 20)

      doc.setFontSize(13);
      var text = "AAYHS ADS AND SPONSORS";
      doc.text(120, y, text);
      y = y + 5;
      doc.setFontSize(10);

      doc.text(this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.Address != null
        && this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.Address != undefined
        ? this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.Address : "", 120, y);

      var cityname = this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.CityName != null
        && this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.CityName != undefined
        ? this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.CityName : "";
      var statename = this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.StateZipcode != null
        && this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.StateZipcode != undefined
        ? this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.StateZipcode : "";

      doc.text(cityname + ", " + statename, 120, y + 5)


      y = y - 5;


      doc.text(this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.Phone1 != null
        && this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.Phone1 != undefined
        ? this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.Phone1 : "", 120, y + 15);


      doc.text(this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.Email1 != null
        && this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.Email1 != undefined
        ? this.ExhibitorSponsorRefundReportResponse[0].getAAYHSContactInfo.Email1 : "", 120, y + 20);


      y = y + 40;

      if (reportdata.horsesSponsors == null || reportdata.horsesSponsors == undefined
        || reportdata.horsesSponsors.length <= 0) {

        doc.text(reportdata.exhibitorInfo.ExhibitorName != null &&
          reportdata.exhibitorInfo.ExhibitorName != undefined ?
          reportdata.exhibitorInfo.ExhibitorName : ""
          , 10, y);

        doc.text("Horse Name : ", 120, y);

        doc.text(reportdata.exhibitorInfo.Address != null &&
          reportdata.exhibitorInfo.Address != undefined ?
          reportdata.exhibitorInfo.Address : ""
          , 10, y + 5);

        doc.text('Print Date :', 120, y + 5);
        var newdate = new Date()
        doc.text(String(moment(new Date()).format('MM-DD-yyyy')), 140, y + 5);

        let city = reportdata.exhibitorInfo.CityName != null &&
          reportdata.exhibitorInfo.CityName != undefined ?
          reportdata.exhibitorInfo.CityName : "";

        let state = reportdata.exhibitorInfo.StateZipcode != null &&
          reportdata.exhibitorInfo.StateZipcode != undefined ?
          reportdata.exhibitorInfo.StateZipcode : "";

        doc.text(city + ", " + state, 10, y + 10);

        doc.text(reportdata.exhibitorInfo.Phone != null &&
          reportdata.exhibitorInfo.Phone != undefined ?
          reportdata.exhibitorInfo.Phone : ""
          , 10, y + 15);

        doc.text(reportdata.exhibitorInfo.Email != null &&
          reportdata.exhibitorInfo.Email != undefined ?
          reportdata.exhibitorInfo.Email : ""
          , 10, y + 20);

        y = y + 7;

        doc.text(reportdata.exhibitorInfo.ExhibitorId != null &&
          reportdata.exhibitorInfo.ExhibitorId != undefined ? "Exhibitor Id:  " +
          String(reportdata.exhibitorInfo.ExhibitorId) : "Exhibitor Id:  "
          , 10, y + 30);

        doc.text("Horse Name:  ", 120, y + 30);


        doc.autoTable({
          body: [],
          columns:
            [
              { header: 'Sponsor Name', dataKey: 'SponsorName' },
              { header: 'Sponsor Id', dataKey: 'SponsorId' },
              { header: 'Amount Received', dataKey: 'Amount' },

            ],
          margin: { vertical: 35, horizontal: 10 },
          startY: y + 40
        })

        let finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.text("Total Amount:   ", 150, finalY);
        doc.line(0, finalY + 3, 300, finalY + 3);

      }
      else {
        reportdata.horsesSponsors.forEach(info => {

          doc.text(reportdata.exhibitorInfo.ExhibitorName != null &&
            reportdata.exhibitorInfo.ExhibitorName != undefined ?
            reportdata.exhibitorInfo.ExhibitorName : ""
            , 10, y);


          doc.text(info.HorseName != null && info.HorseName != undefined ? "Horse Name :  " + info.HorseName : "Horse Name : ", 120, y);


          doc.text(reportdata.exhibitorInfo.Address != null &&
            reportdata.exhibitorInfo.Address != undefined ?
            reportdata.exhibitorInfo.Address : ""
            , 10, y + 5);


          doc.text('Print Date :', 120, y + 5);
          var newdate = new Date()
          doc.text(String(moment(new Date()).format('MM-DD-yyyy')), 140, y + 5);


          let city = reportdata.exhibitorInfo.CityName != null &&
            reportdata.exhibitorInfo.CityName != undefined ?
            reportdata.exhibitorInfo.CityName : "";

          let state = reportdata.exhibitorInfo.StateZipcode != null &&
            reportdata.exhibitorInfo.StateZipcode != undefined ?
            reportdata.exhibitorInfo.StateZipcode : "";


          doc.text(city + ", " + state, 10, y + 10);



          doc.text(reportdata.exhibitorInfo.Phone != null &&
            reportdata.exhibitorInfo.Phone != undefined ?
            reportdata.exhibitorInfo.Phone : ""
            , 10, y + 15);



          doc.text(reportdata.exhibitorInfo.Email != null &&
            reportdata.exhibitorInfo.Email != undefined ?
            reportdata.exhibitorInfo.Email : ""
            , 10, y + 20);

          y = y + 7;



          doc.text(reportdata.exhibitorInfo.ExhibitorId != null &&
            reportdata.exhibitorInfo.ExhibitorId != undefined ? "Exhibitor Id:  " +
            String(reportdata.exhibitorInfo.ExhibitorId) : "Exhibitor Id:  "
            , 10, y + 30);



          doc.text(info.HorseName != null && info.HorseName != undefined ? "Horse Name:  " + info.HorseName : "Horse Name:  ", 120, y + 30);



          info.horseSponsorInfos.forEach(ele => {
            ele.FormattedAmount = "$" + String(ele.Amount)
          });


          doc.autoTable({
            body: info.horseSponsorInfos,
            columns:
              [
                { header: 'Sponsor Name', dataKey: 'SponsorName' },
                { header: 'Sponsor Id', dataKey: 'SponsorId' },
                { header: 'Amount Received', dataKey: 'Amount' },

              ],
            margin: { vertical: 35, horizontal: 10 },
            startY: y + 40
          })

          let finalY = (doc as any).lastAutoTable.finalY + 10;
          doc.text(info.TotalAmount != null && info.TotalAmount != undefined ? "Total Amount:   " + "$" +
            String(info.TotalAmount) : "Total Amount:   ", 150, finalY);

          if (info.refundableCosts != null && info.TotalAmount != undefined) {
            doc.text("REFUNDABLE SHOW COSTS", 10, finalY + 20)
            doc.text("Incentive" + info.refundableCosts.Incentive, 10, finalY + 25)
            var splitText = doc.splitTextToSize(info.refundableCosts.IncentiveText != null ? info.refundableCosts.IncentiveText : '', 180)
            doc.text(splitText, 10, finalY + 30)
            doc.line(0, finalY + 3, 300, finalY + 3);
            doc.setLineWidth(5.0);
          }

          doc.text("Exhibitor #", 30, finalY + 45)
          doc.text(String(info.ExhibitorId), 50, finalY + 45)

          doc.text("Pre-Entries Classes", 30, finalY + 50)
          doc.text('$' + String(info.showCosts.ClassFee), 150, finalY + 50)

          doc.text("Box Stall", 30, finalY + 55)
          doc.text('$' + String(info.showCosts.HorseStallFee), 150, finalY + 55)

          doc.text("Tack Stall", 30, finalY + 60)
          doc.text('$' + String(info.showCosts.TackStallFee), 150, finalY + 60)

          doc.text("Program", 30, finalY + 65)
          doc.text('$' + String(info.showCosts.ProgramFee), 150, finalY + 65)

          doc.text("Total", 30, finalY + 70)
          doc.text('$' + String(info.TotalShowCost), 150, finalY + 70)

          var lastrecord = reportdata.horsesSponsors[reportdata.horsesSponsors.length - 1];
          if (lastrecord === info) {

          }
          else {
            doc.addPage();
            y = 20;
          }
        });
      }

      var lastrecord2 = reportdatalist[reportdatalist.length - 1];
      if (lastrecord2 === reportdata) {

      }
      else {
        doc.addPage();
        y = 10;
      }


    });

    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('ExhibitorSponsorRefundReportPDF.pdf');
      this.loading = false;
    }

    if (this.reportType == "print") {
      var printFile = window.open(doc.output('bloburl'))
      setTimeout(function () {
        printFile.print();
      }, 2000);
      this.loading = false;

    }

    if (this.reportType == "email") {
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




  filterExhibitorSponsorConfirm(val: any, makeexhibitornull: boolean) {

    if (makeexhibitornull == true) {
      this.LinkedExhibitorSponsorConfirmID = null;
    }

    if (this.exhibitorsList != null && this.exhibitorsList != undefined && this.exhibitorsList.length > 0) {
      this.filteredExhibitorsList = this.exhibitorsList.filter(option =>
        option.FirstName.toLowerCase().includes(val.toLowerCase())
        || option.LastName.toLowerCase().includes(val.toLowerCase()));
    }
  }

  filterExhibitorSponsorRefund(val: any, makeexhibitornull: boolean) {

    if (makeexhibitornull == true) {
      this.LinkedExhibitorSponsorRefundID = null;
    }

    if (this.exhibitorsList != null && this.exhibitorsList != undefined && this.exhibitorsList.length > 0) {
      this.filteredExhibitorsList2 = this.exhibitorsList.filter(option =>
        option.FirstName.toLowerCase().includes(val.toLowerCase())
        || option.LastName.toLowerCase().includes(val.toLowerCase()));
    }
  }

  filterGroupStatement(val: any, makegroupnull: boolean) {

    if (makegroupnull == true) {
      this.LinkedGroupStatementID = null;
    }

    if (this.groupsList != null && this.groupsList != undefined && this.groupsList.length > 0) {
      this.filteredGroupsList = this.groupsList.filter(option =>
        option.GroupName.toLowerCase().includes(val.toLowerCase())
      );
    }
  }





  getFilteredExhibitorSponsorConfirm(id: number, event: any) {

    if (event.isUserInput) {
      this.LinkedExhibitorSponsorConfirmID = id;

    }
  }

  getFilteredExhibitorSponsorRefund(id: number, event: any) {

    if (event.isUserInput) {
      this.LinkedExhibitorSponsorRefundID = id;

    }
  }

  getFilteredGroupStatement(id: number, event: any) {

    if (event.isUserInput) {
      this.LinkedGroupStatementID = id;
    }
  }





  selectReport(i) {
    this.selectedRowIndex = i;
  }

  checkChange(value, type) {
    debugger
    if (type == "exhibitorsponsorconfirm") {
      debugger
      this.allExhibitorSponsorConfirm = value == "all" ? true : false
      this.allGroupStatement = true;
      this.allExhibitorSponsorRefund = true;
    }
    else if (type == "groupstatementreport") {
      this.allGroupStatement = value == "all" ? true : false;
      this.allExhibitorSponsorRefund = true;
      this.allExhibitorSponsorConfirm = true;
    }
    else if (type == "exhibitorsponsorrefund") {
      this.allExhibitorSponsorRefund = value == "all" ? true : false;
      this.allGroupStatement = true;
      this.allExhibitorSponsorConfirm = true;
    }
  }

  showpopupbox(elementid: string, hidearrow: string,showarrow: string) {

    var popboxes = document.getElementsByClassName("mmHoverContent");
    if (popboxes != null && popboxes != undefined && popboxes.length > 0) {
      for (var i = 0; i < popboxes.length; i++) {
        popboxes[i].classList.remove("showmybox");
        popboxes[i].classList.add("hidemybox");
      }
    }

    var element = document.getElementById(elementid);
    if (element != null && element != undefined) {
      element.classList.remove("hidemybox");
      element.classList.add("showmybox");
    }

    
    var hideElement = document.getElementById(hidearrow);
    if (hideElement != null && hideElement != undefined) {
      hideElement.classList.add("hidemybox");
      hideElement.classList.remove("showmybox");
    }

    var showElement = document.getElementById(showarrow);
    if (showElement != null && showElement != undefined) {
      showElement.classList.remove("hidemybox");
      showElement.classList.add("showmybox");
    }

  }



  hidepopupbox(elementid: string, hidearrow: string,showarrow: string) {

    var element = document.getElementById(elementid);
    if (element != null && element != undefined) {
      element.classList.remove("showmybox");
      element.classList.add("hidemybox");
    }

    var hideElement = document.getElementById(hidearrow);
    if (hideElement != null && hideElement != undefined) {
      hideElement.classList.add("hidemybox");
      hideElement.classList.remove("showmybox");
    }

    var showElement = document.getElementById(showarrow);
    if (showElement != null && showElement != undefined) {
      showElement.classList.remove("hidemybox");
      showElement.classList.add("showmybox");
    }
  }
}
