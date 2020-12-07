import { Component, OnInit } from '@angular/core';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
import * as jsPDF from 'jspdf';
interface jsPDFWithPlugin extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}
import { ReportemailComponent } from 'src/app/shared/ui/modals/reportemail/reportemail.component';
import { ReportService } from 'src/app/core/services/report.service'
import { formatDate } from '@angular/common';
import { ClassService } from 'src/app/core/services/class.service';
import { BaseRecordFilterRequest } from 'src/app/core/models/base-record-filter-request-model';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  loading = false;
  entriesPerClassReport: any;
  classesList: any;
  classresultsclassesList: any;
  paddocksheetclassesList: any;
  programsheetclassesList: any;
  resultClassId: any = null;
  selectedresultClasssname = "";
  allResultClass: boolean = true;
  YearShowSummary: any;

  paddockClassId: any = null;
  selectedpaddockClasssname = "";
  allPaddockClass: boolean = true

  programClassId: any = null;
  selectedprogramClasssname = "";
  allProgramClass: boolean = true;

  selectedRowIndex: any;
  reportName: any;
  reportType: any;
  reportemailid: string = "";
  classResults: any;
  nsbaClassResults: any;
  paddockReport: any;
  sponsorPatronList: any;
  administrativeReport: any;
  programReport = [];
  baseRequest: BaseRecordFilterRequest = {
    Page: 1,
    Limit: 5,
    OrderBy: 'ClassId',
    OrderByDescending: true,
    AllRecords: true,
    SearchTerm: null

  };

  nsbaExhibitorReport: any;

  constructor(private reportService: ReportService, private dialog: MatDialog,
    private classService: ClassService,
    private snackBar: MatSnackbarComponent) { }

  ngOnInit(): void {
    this.getAllClasses();
  }


  downloadEntriesPerClassReport() {
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(10);
    var text = "<b>Number of Entries Per Class</b> ";
    var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.fromHTML(text, textOffset, 10);

    text = "Date Printed :" + formatDate(new Date(), 'MM/dd/yyyy', 'en');;
    textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.fromHTML(text, 75, 15);

    var time = new Date();
    var ampm = time.getHours() >= 12 ? 'PM' : 'AM';
    text = "Time Printed :" + time.getHours() + ":" + time.getMinutes() + ampm;
    textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.fromHTML(text, 75, 20);


    doc.line(0, 35, 300, 35);
    doc.setLineWidth(5.0);

    let yaxis = 40;

    doc.autoTable({
      body: this.entriesPerClassReport,
      columns:
        [
          { header: 'Class #', dataKey: 'ClassNumber' },
          { header: 'Class Name', dataKey: 'ClassName' },
          { header: 'Class Age Group', dataKey: 'ClassAgeGroup' },
          { header: 'Entry Total', dataKey: 'EntryTotal' },
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: yaxis + 10
    })




    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('EntriesPerClass.pdf');
      this.loading = false;
    }

    if (this.reportType == "print") {
      var printFile= window.open(doc.output('bloburl'))
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

  getAllClasses() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.classService.getAllClasses(this.baseRequest).subscribe(response => {
        this.classesList = response.Data.classesResponse;
        this.classresultsclassesList = response.Data.classesResponse;
        this.paddocksheetclassesList = response.Data.classesResponse;
        this.programsheetclassesList = response.Data.classesResponse;
        this.loading = false;
      }, error => {
        this.loading = false;

      }
      )
      resolve();
    });
  }

  downloadClassEntriesReport() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.reportService.getClassPerEntriesReport(-1).subscribe(response => {
        this.entriesPerClassReport = response.Data.getClassEntriesCount;
        this.downloadEntriesPerClassReport();
        this.loading = false;
      }, error => {
        this.loading = false;

      }
      )
      resolve();
    });

  }

  download() {
    if (this.validate()) {

      if (this.reportName == "result") {
        if (this.allResultClass == true) {
          this.getClassResults();
        }
        else {
          this.getClassResult(this.resultClassId)
        }

      }

      else if (this.reportName == "nsbaclassresult") {
        this.getNSBAClassResults();
      }

      else if (this.reportName == "entries") {
        this.downloadClassEntriesReport()
      }

      else if (this.reportName == "paddock") {
        if (this.allPaddockClass == true) {
          this.getPaddockSheetForAllClasses();
        }
        else {
          this.getPaddockSheet(this.paddockClassId);
        }
      }

      else if (this.reportName == "program") {
        if (this.allProgramClass == true) {
          this.getProgramSheetForAllClasses();
        }
        else {
          this.getProgramSheet(this.programClassId);
        }
      }

      else if (this.reportName == "patron") {
        this.getSponsorPatronList()
      }

      else if (this.reportName == "administrative") {
        this.getAdministrativeReport()
      }

      else if (this.reportName == "nsba") {
        this.getNsbaExhibitorReport()
      }

      else if (this.reportName == "nsbaclasses") {
        this.getNsbaClassesExhibitorReport()
      }

      else if (this.reportName == "summary") {
        this.getYearShowSummary()
      }

    }
  }


  getProgramSheet(id) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.programReport = [];
      this.reportService.getProgramSheet(id).subscribe(response => {
        this.programReport.push(response.Data);
        this.downloadProgramSheet();
      }, error => {
        this.loading = false;
        this.programReport = [];
      }
      )
      resolve();
    });
  }

  getProgramSheetForAllClasses() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.programReport = [];
      this.reportService.getProgramSheetForAllClasses().subscribe(response => {
        this.programReport.push(response.Data.getProgramReport);
        this.downloadProgramSheet();
      }, error => {
        this.loading = false;
        this.programReport = [];
      }
      )
      resolve();
    });
  }

  downloadProgramSheet(): void {
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(10);

    let y = 15;
    debugger
    var reportdata = [];
    if (this.allProgramClass == true) {
      reportdata = this.programReport[0];
    } else {
      reportdata.push(this.programReport[0])
    }

    reportdata.forEach(report => {


      var text = "<b>Class</b> " + report.ClassNumber;
      var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
      doc.fromHTML(text, textOffset, y);

      text = report.ClassName + " <b>Age</b> " + report.Age;
      textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      textOffset = (doc.internal.pageSize.width - textWidth) / 2;
      doc.fromHTML(text, textOffset, y + 5);


      doc.text("Sponsored By", 90, y + 18);


      doc.line(0, 35, 300, y + 20);
      doc.setLineWidth(5.0);

      //check if there are sponsors for the class
      let yaxis = y + 25;
      if (report.sponsorInfo != null && report.sponsorInfo.length > 0) {
        if (report.sponsorInfo.length >= 1) {
          doc.text(report.sponsorInfo[0].SponsorName, 10, 40);
          doc.text(report.sponsorInfo[0].City + ' ' + report.sponsorInfo[0].StateZipcode, 10, 45);
          yaxis = 45;
        }

        if (report.sponsorInfo.length >= 2) {
          doc.text(report.sponsorInfo[1].SponsorName, 130, 40);
          doc.text(report.sponsorInfo[1].City + ' ' + report.sponsorInfo[1].StateZipcode, 130, 45);
          yaxis = 45;
        }

        if (report.sponsorInfo.length >= 3) {
          doc.text(report.sponsorInfo[2].SponsorName, 10, 55);
          doc.text(report.sponsorInfo[2].City + ' ' + report.sponsorInfo[2].StateZipcode, 10, 60);
          yaxis = 60;
        }

        if (report.sponsorInfo.length >= 4) {
          doc.text(report.sponsorInfo[3].SponsorName, 130, 55);
          doc.text(report.sponsorInfo[3].City + ' ' + report.sponsorInfo[3].StateZipcode, 130, 60);
          yaxis = 60;
        }

      }
      doc.autoTable({
        body: report.classInfo,
        columns:
          [
            { header: 'Back#', dataKey: 'BackNumber' },
            { header: 'NSBA', dataKey: 'NSBA' },
            { header: 'Horse', dataKey: 'HorseName' },
            { header: 'Exhibitor', dataKey: 'ExhibitorName' },
            { header: 'City/State', dataKey: 'CityState' },

          ],
        margin: { vertical: 35, horizontal: 10 },
        startY: yaxis + 10
      })

      var lastrecord = this.programReport[this.programReport.length - 1];
      if (lastrecord === report) {

      }
      else {
        doc.addPage();
        y = 15;
      }



    });




    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('ProgramSheet.pdf');
      this.loading = false;
    }

    if (this.reportType == "print") {
      var printFile= window.open(doc.output('bloburl'))
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
        if (response != null || response != undefined) {

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



  getPaddockSheet(id) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.paddockReport = [];
      this.reportService.getPaddockSheet(id).subscribe(response => {
        this.paddockReport.push(response.Data);
        this.downloadPaddockSheet();
      }, error => {
        this.loading = false;
        this.paddockReport = [];
      }
      )
      resolve();
    });
  }

  getPaddockSheetForAllClasses() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.paddockReport = [];
      this.reportService.getPaddockSheetForAllClasses().subscribe(response => {
        this.paddockReport.push(response.Data.getPaddockReport);
        this.downloadPaddockSheet();
      }, error => {
        this.loading = false;
        this.paddockReport = [];
      }
      )
      resolve();
    });
  }

  downloadPaddockSheet() {
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(10);
    let y = 15;
    var number : number=0;

    var reportdata = [];
    if (this.allPaddockClass == true) {

      reportdata = this.paddockReport[0];


    } else {

      reportdata.push(this.paddockReport[0])
    }



    reportdata.forEach(report => {

      var text = "<b>Class</b> " + report.ClassNumber;
      var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
      doc.fromHTML(text, textOffset, y);


      text = report.ClassName + " <b>Age</b> " + report.Age;
      textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      textOffset = (doc.internal.pageSize.width - textWidth) / 2;
      doc.fromHTML(text, textOffset, y + 5);

      doc.line(0, y + 20, 300, y + 20);
      doc.setLineWidth(5.0);

      
      report.classDetails.forEach(ele => {
        number=number + 1
        ele.serialNumber=number
      });

      doc.autoTable({
        body: report.classDetails,
        columns:
          [
            {header  : '#',dataKey:'serialNumber'},
            { header: 'Back#', dataKey: 'BackNumber' },
            { header: 'Scratch', dataKey: 'Scratch' },
            { header: 'NSBA', dataKey: 'NSBA' },
            { header: 'Horse', dataKey: 'HorseName' },
            { header: 'Exhibitor', dataKey: 'ExhibitorName' },
            { header: 'City/State', dataKey: 'CityState' },
            { header: 'Split#', dataKey: 'Split' },

          ],
        margin: { vertical: 35, horizontal: 10 },
        startY: y + 30
      })
      number=0;
      var lastrecord = this.paddockReport[this.paddockReport.length - 1];
      if (lastrecord === report) {

      }
      else {
        doc.addPage();
        y = 15;
      }


    });

    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('Paddockheet.pdf');
      this.loading = false;
    }

    if (this.reportType == "print") {
      var printFile= window.open(doc.output('bloburl'))
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
        if (response != null || response != undefined) {

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

  checkChange(value, type) {
    if (type == "result") {
      this.allResultClass = value == "all" ? true : false
      this.allProgramClass = true
      this.allPaddockClass = true
      this.reportName = "result"
    }
    else if (type == "paddock") {
      this.allPaddockClass = value == "all" ? true : false
      this.reportName = "paddock"
      this.allResultClass = true
      this.allProgramClass = true
    }
    else if (type == "program") {
      this.allProgramClass = value == "all" ? true : false
      this.reportName = "program"
      this.allResultClass = true
      this.allPaddockClass = true
    }
  }

  selectReport(i, report) {
    this.selectedRowIndex = i;
    this.reportName = report;
  }

  setreportType(type: string, name: string) {
    this.reportName = name;
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
            this.download();
          }
        }

      });
    }
    else {
      this.download();
    }
  }

  getClassResults() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.reportService.getClassResults().subscribe(response => {
        this.classResults = response.getClassesResult;
        this.downloadClassResultsReport()
        this.loading = false;
      }, error => {
        this.loading = false;

      }
      )
      resolve();
    });
  }

  getNSBAClassResults() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.nsbaClassResults = null;
      this.reportService.getNSBAClassResults().subscribe(response => {
        this.nsbaClassResults = response.getClassesResult;
        this.downloadNSBAClassResultsReport()
        this.loading = false;
      }, error => {
        this.loading = false;
        this.nsbaClassResults = null;
      }
      )
      resolve();
    });
  }

  getClassResult(id) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.reportService.getClassResult(Number(id)).subscribe(response => {
        this.classResults = response.Data;
        this.downloadClassResult()
        this.loading = false;
      }, error => {
        this.loading = false;

      }
      )
      resolve();
    });
  }

  downloadClassResult() {
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(10);

    // write class category
    var text = "<b>" + this.classResults.ClassHeader + "</b> ";
    var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.fromHTML(text, textOffset, 10);


    doc.text(this.classResults.ClassNumber + " " + this.classResults.ClassName + " " + this.classResults.AgeGroup, 85, 23);
    // write sponsors of the class

    if (this.classResults.getClassesSponsors != null && this.classResults.getClassesSponsors.length > 0) {

      if (this.classResults.getClassesInfoAndResult[0].getClassesSponsors.length >= 1) {
        doc.text(this.classResults.getClassesSponsors[0].SponsorName, 10, 40);
      }

      if (this.classResults.getClassesSponsors.length >= 2) {
        doc.text(this.classResults.getClassesSponsors[1].SponsorName, 130, 40);
      }

      if (this.classResults.getClassesSponsors.length >= 3) {
        doc.text(this.classResults.getClassesSponsors[2].SponsorName, 10, 45);
      }

      if (this.classResults.getClassesSponsors.length >= 4) {
        doc.text(this.classResults.getClassesSponsors[3].SponsorName, 130, 45);
      }

    }

    // Append datatable
    doc.line(0, 35, 300, 35);
    doc.setLineWidth(5.0);

    let yaxis = 40;

    doc.autoTable({
      body: this.classResults.getClassResults,
      columns:
        [
          { header: 'Place', dataKey: 'Place' },
          { header: 'Back No.', dataKey: 'BackNumber' },
          { header: 'Exhibitor Name', dataKey: 'ExhibitorName' },
          { header: 'Horse Name', dataKey: 'HorseName' },
          { header: 'Group Name', dataKey: 'GroupName' },
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: yaxis + 10
    })

    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('ClassResult.pdf');
      this.loading = false;
    }

    if (this.reportType == "print") {
      var printFile= window.open(doc.output('bloburl'))
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

  downloadClassResultsReport() {
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(10);
    var y = 5;
    // iterate over all classes
    for (let i = 0; i < this.classResults.length; i++) {
      y = 5;
      // write class category
      var text = "<b>" + this.classResults[i].ClassHeader + "</b> ";
      var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
      doc.fromHTML(text, textOffset, y);
      y = y + 5;
      //if there is no data move to next page
      if (this.classResults[i].getClassesInfoAndResult.length === 0) {
        doc.addPage()
      }

      //iterate over particular class of class category
      for (let j = 0; j <= this.classResults[i].getClassesInfoAndResult.length - 1; j++) {

        doc.text(this.classResults[i].getClassesInfoAndResult[j].ClassNumber + " "
          + this.classResults[i].getClassesInfoAndResult[j].ClassName + " "
          + this.classResults[i].getClassesInfoAndResult[j].AgeGroup, 85, y + 10);
        // write sponsors of the class
     


        if (this.classResults[i].getClassesInfoAndResult[j].getClassesSponsors != null
          && this.classResults[i].getClassesInfoAndResult[j].getClassesSponsors.length > 0) {


          if (this.classResults[i].getClassesInfoAndResult[j].getClassesSponsors.length >= 1) {
            doc.text(this.classResults[i].getClassesInfoAndResult[j].getClassesSponsors[0].SponsorName, 10, y + 30);
          }

          if (this.classResults[i].getClassesInfoAndResult[j].getClassesSponsors.length >= 2) {
            doc.text(this.classResults[i].getClassesInfoAndResult[j].getClassesSponsors[1].SponsorName, 135, y + 30);
          }

          if (this.classResults[i].getClassesInfoAndResult[j].getClassesSponsors.length >= 3) {
            doc.text(this.classResults[i].getClassesInfoAndResult[j].getClassesSponsors[2].SponsorName, 10, y + 35);
          }

          if (this.classResults[i].getClassesInfoAndResult[j].getClassesSponsors.length >= 4) {
            doc.text(this.classResults[i].getClassesInfoAndResult[j].getClassesSponsors[3].SponsorName, 135, y + 35);
          }


        }

        // Append datatable
     
        doc.line(0, y + 20, 300, y + 20);
        doc.setLineWidth(5.0);

        let yaxis = y + 35;

        doc.autoTable({
          body: this.classResults[i].getClassesInfoAndResult[j].getClassResults,
          columns:
            [
              { header: 'Place', dataKey: 'Place' },
              { header: 'Back No.', dataKey: 'BackNumber' },
              { header: 'Exhibitor Name', dataKey: 'ExhibitorName' },
              { header: 'Horse Name', dataKey: 'HorseName' },
              { header: 'Group Name', dataKey: 'GroupName' },
            ],
          margin: { vertical: 35, horizontal: 10 },
          startY: yaxis + 10
        })
        y = (doc as any).lastAutoTable.finalY+10;
       
        doc.line(0, (doc as any).lastAutoTable.finalY+5, 300, (doc as any).lastAutoTable.finalY+5);
        doc.setLineWidth(5.0);

        //  doc.addPage()
      }
      doc.addPage()
    }


    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('ClassResults.pdf');
      this.loading = false;
    }

    if (this.reportType == "print") {
      var printFile= window.open(doc.output('bloburl'))
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


  downloadNSBAClassResultsReport() {
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;

    // iterate over all classes
    for (let i = 0; i < this.nsbaClassResults.length; i++) {
      doc.setFontSize(13);
      // write class category
      var text = this.nsbaClassResults[i].ClassHeader;
      var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
      doc.text(text, textOffset, 10);

      //if there is no data move to next page
      if (this.nsbaClassResults[i].getClassesInfoAndResult.length === 0) {
        doc.addPage()
      }

      //iterate over particular class of class category
      for (let j = 0; j <= this.nsbaClassResults[i].getClassesInfoAndResult.length - 1; j++) {
        doc.setFontSize(10);
        var classinfotxt = this.nsbaClassResults[i].getClassesInfoAndResult[j].ClassNumber + " " +
          this.nsbaClassResults[i].getClassesInfoAndResult[j].ClassName + " " +
          this.nsbaClassResults[i].getClassesInfoAndResult[j].AgeGroup;

        var textWidth = doc.getStringUnitWidth(classinfotxt) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        var textOffset = (doc.internal.pageSize.width - textWidth) / 2;

        doc.text(classinfotxt, textOffset, 23);

        // Append datatable
        doc.line(0, 35, 300, 35);
        doc.setLineWidth(5.0);

        let yaxis = 40;

        doc.autoTable({
          body: this.nsbaClassResults[i].getClassesInfoAndResult[j].getClassResults,
          columns:
            [
              { header: 'Place', dataKey: 'Place' },
              { header: 'Back No.', dataKey: 'BackNumber' },
              { header: 'Exhibitor Name', dataKey: 'ExhibitorName' },
              { header: 'Horse Name', dataKey: 'HorseName' },
              { header: 'Group Name', dataKey: 'GroupName' },
            ],
          margin: { vertical: 35, horizontal: 10 },
          startY: yaxis + 10
        })
        doc.addPage()
      }

    }


    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('NSBAClassesResults.pdf');
      this.loading = false;
    }

    if (this.reportType == "print") {
      var printFile= window.open(doc.output('bloburl'))
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

  setResultClass(value) {
    this.resultClassId = Number(value)
  }

  filterresultclass(val, makeresultclassnull) {
    if (makeresultclassnull == true) {
      this.resultClassId = null;
    }

    if (this.classesList != null && this.classesList != undefined && this.classesList.length > 0) {
      this.classresultsclassesList = this.classesList.filter(option =>
        option.Name.toLowerCase().includes(val.toLowerCase())
        || (option.AgeGroup.toString()).includes(val.toLowerCase()));
    }

  }

  getFilteredresultclass(value, event) {
    this.resultClassId = Number(value)
  }

  filterpaddockclass(val, makepaddockclass) {
    if (makepaddockclass == true) {
      this.paddockClassId = null;
    }

    if (this.classesList != null && this.classesList != undefined && this.classesList.length > 0) {
      this.paddocksheetclassesList = this.classesList.filter(option =>
        option.Name.toLowerCase().includes(val.toLowerCase())
        || (option.AgeGroup.toString()).includes(val.toLowerCase()));
    }

  }

  getFilteredpaddockclass(value, event) {
    this.paddockClassId = Number(value)
  }

  filterprogramclass(val, makeprogramclassnull) {
    if (makeprogramclassnull == true) {
      this.programClassId = null;
    }

    if (this.classesList != null && this.classesList != undefined && this.classesList.length > 0) {
      this.programsheetclassesList = this.classesList.filter(option =>
        option.Name.toLowerCase().includes(val.toLowerCase())
        || (option.AgeGroup.toString()).includes(val.toLowerCase()));
    }

  }

  getFilteredprogramclass(value, event) {

    this.programClassId = Number(value)
  }

  setPaddockClass(value) {
    this.paddockClassId = Number(value)
  }

  setProgramClass(value) {
    this.programClassId = Number(value)
  }

  validate() {
    if (this.reportName === "result" && this.allResultClass === false && this.resultClassId === null) {
      this.snackBar.openSnackBar("Please select class", 'Close', 'red-snackbar');
      return false;
    }

    if (this.reportName === "paddock" && this.allPaddockClass === false && this.paddockClassId === null) {
      this.snackBar.openSnackBar("Please select class", 'Close', 'red-snackbar');
      return false;
    }

    if (this.reportName === "program" && this.allProgramClass === false && this.programClassId === null) {
      this.snackBar.openSnackBar("Please select class", 'Close', 'red-snackbar');
      return false;
    }
    return true;
  }

  getSponsorPatronList() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.reportService.getSponsorPatronList().subscribe(response => {
        this.sponsorPatronList = response.Data.sponsors;
        this.downloadFile(this.sponsorPatronList)
        this.loading = false;
      }, error => {
        this.loading = false;

      }
      )
      resolve();
    });
  }

  downloadPatronList() {
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(10);
    var text = String(new Date().getFullYear()) + ' -' + ' ' + 'ALL AMERICAN YOUTH HORSE SHOW PATRONS';
    var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.fromHTML(text, textOffset, 10);

    doc.line(0, 20, 300, 20);
    doc.setLineWidth(5.0);
    let yaxis = 20;

    doc.autoTable({
      body: this.sponsorPatronList,
      columns:
        [
          { header: '', dataKey: 'SponsorName' },
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: yaxis + 10
    })


    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('SponsorPatron.pdf');
      this.loading = false;
    }

    if (this.reportType == "print") {
      var printFile= window.open(doc.output('bloburl'))
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

  async downloadFile(data) {
    let csvData = this.ConvertToCSV(data);
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    const base64data = await this.blobToData(blob)
    var url = URL.createObjectURL(blob);
    var dwldLink: HTMLAnchorElement
    let html='&emsp;' + '&emsp;' + '&emsp;' + '&emsp;' + '&emsp;'  + String(new Date().getFullYear()) + ' -' + ' ' + 'ALL AMERICAN YOUTH HORSE SHOW PATRONS'+'<br><br>';;
    for (let i = 0; i < data.length; i++) {
      let line = data[i].SponsorName + '<br>';
      html += line;
    }
    if (this.reportType == "display") {
      let printContents, popupWin;
      printContents = html;
      popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
      popupWin.document.open();
      popupWin.document.write(`
      <html>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
      );
      this.loading = false;
    }

    if (this.reportType == "download") {
      dwldLink = document.createElement("a");
      let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
      if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
        dwldLink.setAttribute("target", "_blank");
      }
      dwldLink.setAttribute("href", url);
      dwldLink.setAttribute("download", 'SponsorPatron' + ".csv");
      dwldLink.style.visibility = "hidden";
      document.body.appendChild(dwldLink);
      dwldLink.click();
      document.body.removeChild(dwldLink);
    }

    if (this.reportType == "print") {
      let printContents, popupWin;
      printContents = html;
      popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
      popupWin.document.open();
      popupWin.document.write(`
      <html>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
      );
      popupWin.document.close();
      setTimeout(function () {
        popupWin.close();
      }, 10);
      this.loading = false;
    }

    if (this.reportType == "email") {
      this.loading = true;

      var emailRequest = {
        emailid: this.reportemailid,
        reportfile: base64data,
      }
      this.reportService.SaveAndEmail(emailRequest).subscribe(response => {
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

  ConvertToCSV(objArray) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '\t' + '\t' + String(new Date().getFullYear()) + ' -' + ' ' + 'ALL AMERICAN YOUTH HORSE SHOW PATRONS';

    row = row.slice(0, -1);
    str += row + '\r\n' + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = array[i].SponsorName + '\r\n';
      str += line;
    }
    return str;
  }

  getAdministrativeReport() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.reportService.getAdministrativeReport().subscribe(response => {
        this.administrativeReport = response.Data;
        this.downloadAdministrativeReport()
        this.loading = false;
      }, error => {
        this.loading = false;

      }
      )
      resolve();
    });
  }

  downloadAdministrativeReport() {
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(8);
    let y = 8;
    doc.text('Print Date :', 160, 8)
    doc.text(String(moment(new Date()).format('MM-DD-yyyy')), 180, 8)
    doc.line(0, 10, 300, 10);

    var text = String(new Date().getFullYear() + '&nbsp<b>Administrative Report</b>');
    var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.fromHTML(text, textOffset, 10);

    let pageHeight = doc.internal.pageSize.height;
    doc.fromHTML('<b>Fees & Categories</b> :', 10, 25)
    doc.fromHTML(String('<b>Ad Fee</b>'), textOffset, 38)

if(this.administrativeReport.getFeeCategories.getAdFees !=null)
{

    this.administrativeReport.getFeeCategories.getAdFees.forEach(ele => {
      ele.FormattedAmount = "$" + String(ele.Amount)
    });

  }
    doc.autoTable({
      body: this.administrativeReport.getFeeCategories.getAdFees,
      columns:
        [
          { header: 'FeeName', dataKey: 'FeeName' },
          { header: 'Amount', dataKey: 'FormattedAmount' },
          { header: 'Active', dataKey: 'Active' },
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: 50
    })

    let finalY = (doc as any).lastAutoTable.finalY;
    doc.fromHTML(String('<b>Category</b>'), textOffset, finalY + 10)
    doc.autoTable({
      body: this.administrativeReport.getFeeCategories.getClassCategories,
      columns:
        [
          { header: 'Category Name', dataKey: 'CategoryName' },
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: finalY + 22
    })

    finalY = (doc as any).lastAutoTable.finalY;
    doc.fromHTML(String('<b>General Fee</b>'), textOffset, finalY + 10)
    if(this.administrativeReport.getFeeCategories.getGeneralFees !=null)
{

    this.administrativeReport.getFeeCategories.getGeneralFees.forEach(ele => {
      ele.FormattedAmount = "$" + String(ele.Amount)
    });

  }
    doc.autoTable({
      body: this.administrativeReport.getFeeCategories.getGeneralFees,
      columns:
        [
          { header: 'FeeType', dataKey: 'FeeName' },
          { header: 'TimeFrame', dataKey: 'TimeFrame' },
          { header: 'Amount', dataKey: 'FormattedAmount' },
          { header: 'Active', dataKey: 'Active' },
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: finalY + 22
    })

    finalY = (doc as any).lastAutoTable.finalY;
    doc.fromHTML(String('<b>Scratch Refunds</b>'), textOffset, finalY + 10)
    if(this.administrativeReport.getFeeCategories.getScratchRefunds !=null)
{

    this.administrativeReport.getFeeCategories.getScratchRefunds.forEach(ele => {
      ele.FormattedRefund = "$" + String(ele.Refund)
      ele.FormattedDateAfter = String(moment(ele.DateAfter).format('MM-DD-yyyy'))
      ele.FormattedDateBefore = String(moment(ele.DateBefore).format('MM-DD-yyyy'))
    });

  }
    doc.autoTable({
      body: this.administrativeReport.getFeeCategories.getScratchRefunds,
      columns:
        [
          { header: 'DateAfter', dataKey: 'FormattedDateAfter' },
          { header: 'DateBefore', dataKey: 'FormattedDateBefore' },
          { header: 'RefundType', dataKey: 'RefundType' },
          { header: 'Refund', dataKey: 'FormattedRefund' },
          { header: 'Active', dataKey: 'Active' },
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: finalY + 22
    })

    finalY = (doc as any).lastAutoTable.finalY;
    doc.fromHTML(String('<b>Sponsor Incentive Refunds</b>'), textOffset, finalY + 10)
    if(this.administrativeReport.getFeeCategories.getIncentiveRefunds !=null)
{

    this.administrativeReport.getFeeCategories.getIncentiveRefunds.forEach(ele => {
      ele.FormattedAmount = "$" + String(ele.SponsorAmount)
    });

  }
    doc.autoTable({
      body: this.administrativeReport.getFeeCategories.getIncentiveRefunds,
      columns:
        [
          { header: 'Award', dataKey: 'Award' },
          { header: 'Amount', dataKey: 'FormattedAmount' },
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: finalY + 22
    })

    finalY =10;
    if (this.administrativeReport.getStatement != null) {
      doc.addPage()
      doc.fromHTML(String('<b>Statement Text</b>'), textOffset,5)
      for (let i = 0; i < this.administrativeReport.getStatement.sponsorRefundStatements.length - 1; i++) {
        doc.text("StatementName : " + this.administrativeReport.getStatement.sponsorRefundStatements[i].StatementName, 5, finalY + 5)
        // doc.text(this.administrativeReport.getStatement.sponsorRefundStatements[i].StatementName,5,finalY + 5)

        doc.text("StatementNumber : " + this.administrativeReport.getStatement.sponsorRefundStatements[i].StatementNumber, 5, finalY + 10)
        // doc.text(this.administrativeReport.getStatement.sponsorRefundStatements[i].StatementNumber,5,finalY + 10)

        doc.text("Incentive : " + (this.administrativeReport.getStatement.sponsorRefundStatements[i].Incentive != null ? String(this.administrativeReport.getStatement.sponsorRefundStatements[i].Incentive) : ''), 5, finalY + 15)
        // doc.text(String(this.administrativeReport.getStatement.sponsorRefundStatements[i].Incentive),5,finalY + 15)

        doc.text("Statement Text", 5, finalY + 20)
        doc.text(doc.splitTextToSize((this.administrativeReport.getStatement.sponsorRefundStatements[i].StatementText), 180), 5, finalY + 25)

        finalY = finalY + 35
      }

    }

    doc.addPage()
    if (this.administrativeReport.getAAYHSInfo != null) {

      doc.fromHTML('<b>Show Address </b>:', 5, 10)

      //Show address
      doc.text("Show Location", 5, 20)
      doc.text(this.administrativeReport.getAAYHSInfo.ShowLocation != null && this.administrativeReport.getAAYHSInfo.ShowLocation != undefined ? String(this.administrativeReport.getAAYHSInfo.ShowLocation) : '', 55, 20)

      doc.text("Email 1", 5, 25)
      doc.text(this.administrativeReport.getAAYHSInfo.Email1 != null && this.administrativeReport.getAAYHSInfo.Email1 != undefined ? String(this.administrativeReport.getAAYHSInfo.Email1) : '', 55, 25)

      doc.text("Email 1", 5, 30)
      doc.text(this.administrativeReport.getAAYHSInfo.Email2 != null && this.administrativeReport.getAAYHSInfo.Email2 != undefined ? String(this.administrativeReport.getAAYHSInfo.Email2) : '', 55, 30)

      doc.text("Phone 1", 5, 35)
      doc.text(this.administrativeReport.getAAYHSInfo.Phone1 != null && this.administrativeReport.getAAYHSInfo.Phone1 != undefined ? String(this.administrativeReport.getAAYHSInfo.Phone1) : '', 55, 35)

      doc.text("Phone 2", 5, 40)
      doc.text(this.administrativeReport.getAAYHSInfo.Phone2 != null && this.administrativeReport.getAAYHSInfo.Phone2 != undefined ? String(this.administrativeReport.getAAYHSInfo.Phone2) : '', 55, 40)

      doc.text("Address", 5, 45)
      doc.text(this.administrativeReport.getAAYHSInfo.Address != null && this.administrativeReport.getAAYHSInfo.Address != undefined ? String(this.administrativeReport.getAAYHSInfo.Address) : '', 55, 45)

      doc.text("City", 5, 50)
      doc.text(this.administrativeReport.getAAYHSInfo.City != null && this.administrativeReport.getAAYHSInfo.City != undefined ? String(this.administrativeReport.getAAYHSInfo.City) : '', 55, 50)

      doc.text("State", 5, 55)
      doc.text(this.administrativeReport.getAAYHSInfo.State != null && this.administrativeReport.getAAYHSInfo.State != undefined ? String(this.administrativeReport.getAAYHSInfo.State) : '', 55, 55)

      doc.text("ZipCode", 5, 60)
      doc.text(this.administrativeReport.getAAYHSInfo.ZipCode != null && this.administrativeReport.getAAYHSInfo.ZipCode != undefined ? String(this.administrativeReport.getAAYHSInfo.ZipCode) : '', 55, 60)


      // Exhibitor sponsor confirmation

      doc.fromHTML('<b>Exhibitor sponsor confirmation </b>:', 5, 70)

      doc.text("Address", 5, 80)
      doc.text(this.administrativeReport.getAAYHSInfo.exhibitorSponsorConfirmation.Address != null && this.administrativeReport.getAAYHSInfo.exhibitorSponsorConfirmation.Address != undefined ? String(this.administrativeReport.getAAYHSInfo.exhibitorSponsorConfirmation.Address) : '', 55, 80)

      doc.text("City", 5, 85)
      doc.text(this.administrativeReport.getAAYHSInfo.exhibitorSponsorConfirmation.City != null && this.administrativeReport.getAAYHSInfo.exhibitorSponsorConfirmation.City != undefined ? String(this.administrativeReport.getAAYHSInfo.exhibitorSponsorConfirmation.City) : '', 55, 85)

      doc.text("State", 5, 90)
      doc.text(this.administrativeReport.getAAYHSInfo.exhibitorSponsorConfirmation.State != null && this.administrativeReport.getAAYHSInfo.exhibitorSponsorConfirmation.State != undefined ? String(this.administrativeReport.getAAYHSInfo.exhibitorSponsorConfirmation.State) : '', 55, 90)

      doc.text("ZipCode", 5, 95)
      doc.text(this.administrativeReport.getAAYHSInfo.exhibitorSponsorConfirmation.ZipCode != null && this.administrativeReport.getAAYHSInfo.exhibitorSponsorConfirmation.ZipCode != undefined ? String(this.administrativeReport.getAAYHSInfo.exhibitorSponsorConfirmation.ZipCode) : '', 55, 95)


      // Exhibitor refund statement

      doc.fromHTML('<b>Exhibitor refund statement </b>:', 5, 105)

      doc.text("Address", 5, 115)
      doc.text(this.administrativeReport.getAAYHSInfo.exhibitorRefundStatement.Address != null && this.administrativeReport.getAAYHSInfo.exhibitorRefundStatement.Address != undefined ? String(this.administrativeReport.getAAYHSInfo.exhibitorRefundStatement.Address) : '', 55, 115)

      doc.text("City", 5, 120)
      doc.text(this.administrativeReport.getAAYHSInfo.exhibitorRefundStatement.City != null && this.administrativeReport.getAAYHSInfo.exhibitorRefundStatement.City != undefined ? String(this.administrativeReport.getAAYHSInfo.exhibitorRefundStatement.City) : '', 55, 120)

      doc.text("State", 5, 125)
      doc.text(this.administrativeReport.getAAYHSInfo.exhibitorRefundStatement.State != null && this.administrativeReport.getAAYHSInfo.exhibitorRefundStatement.State != undefined ? String(this.administrativeReport.getAAYHSInfo.exhibitorRefundStatement.State) : '', 55, 125)

      doc.text("ZipCode", 5, 130)
      doc.text(this.administrativeReport.getAAYHSInfo.exhibitorRefundStatement.ZipCode != null && this.administrativeReport.getAAYHSInfo.exhibitorRefundStatement.ZipCode != undefined ? String(this.administrativeReport.getAAYHSInfo.exhibitorRefundStatement.ZipCode) : '', 55, 130)


      // Confirmation entries and stalls

      doc.fromHTML('<b>Exhibitor entries and stalls </b>:', 5, 140)

      doc.text("Address", 5, 150)
      doc.text(this.administrativeReport.getAAYHSInfo.confirmationEntriesAndStalls.Address != null && this.administrativeReport.getAAYHSInfo.confirmationEntriesAndStalls.Address != undefined ? String(this.administrativeReport.getAAYHSInfo.confirmationEntriesAndStalls.Address) : '', 55, 150)

      doc.text("City", 5, 155)
      doc.text(this.administrativeReport.getAAYHSInfo.confirmationEntriesAndStalls.City != null && this.administrativeReport.getAAYHSInfo.confirmationEntriesAndStalls.City != undefined ? String(this.administrativeReport.getAAYHSInfo.confirmationEntriesAndStalls.City) : '', 55, 155)

      doc.text("State", 5, 160)
      doc.text(this.administrativeReport.getAAYHSInfo.confirmationEntriesAndStalls.State != null && this.administrativeReport.getAAYHSInfo.confirmationEntriesAndStalls.State != undefined ? String(this.administrativeReport.getAAYHSInfo.confirmationEntriesAndStalls.State) : '', 55, 160)

      doc.text("ZipCode", 5, 165)
      doc.text(this.administrativeReport.getAAYHSInfo.confirmationEntriesAndStalls.ZipCode != null && this.administrativeReport.getAAYHSInfo.confirmationEntriesAndStalls.ZipCode != undefined ? String(this.administrativeReport.getAAYHSInfo.confirmationEntriesAndStalls.ZipCode) : '', 55, 165)

    }


    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('SponsorPatron.pdf');
      this.loading = false;
    }

    if (this.reportType == "print") {
      var printFile= window.open(doc.output('bloburl'))
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

  getNsbaExhibitorReport() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.reportService.getNsbaExhibitorFeeReport().subscribe(response => {
        this.nsbaExhibitorReport = response.Data.nSBAExhibitorFee;
        this.downloadNsbaExhibitorReport()
        this.loading = false;
      }, error => {
        this.loading = false;

      }
      )
      resolve();
    });
  }

  getNsbaClassesExhibitorReport() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.reportService.getNsbaClassesExhibitorFeeReport().subscribe(response => {
        this.nsbaExhibitorReport = response.Data.nSBAExhibitorFee;
        this.downloadNsbaExhibitorReport()
        this.loading = false;
      }, error => {
        this.loading = false;

      }
      )
      resolve();
    });
  }

  downloadNsbaExhibitorReport() {
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(10);
    var text = '<b>NSBA Exhibitor Fee Totals</b>';
    if(this.reportName=="nsbaclasses")
    {
      text = '<b>NSBA Classes Exhibitor Fee Totals</b>';
    }
    
    var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.fromHTML(text, textOffset, 10);

    doc.line(0, 20, 300, 20);
    doc.setLineWidth(5.0);
    let yaxis = 20;

    doc.autoTable({
      body: this.nsbaExhibitorReport,
      columns:
        [
          { header: 'Back #', dataKey: 'BackNumber' },
          { header: 'Exhibitor', dataKey: 'Exhibitor' },
          { header: 'Horse', dataKey: 'Horse' },
          { header: 'Pre Entry Total', dataKey: 'PreEntryTotal' },
          { header: 'Post Entry Total', dataKey: 'PostEntryTotal' },
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: yaxis + 10
    })


    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('SponsorPatron.pdf');
      this.loading = false;
    }

    if (this.reportType == "print") {
      var printFile= window.open(doc.output('bloburl'))
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

  blobToData = (blob: Blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  }

  getYearShowSummary() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.YearShowSummary = null;
      this.reportService.getYearShowSummary().subscribe(response => {
        if (response.Data != null && response.Data != undefined) {
          this.YearShowSummary = response.Data;
          this.saveYearShowSummary();
        }
        else {
          this.snackBar.openSnackBar("No data available", 'Close', 'red-snackbar');
          this.loading = false;
        }

      }, error => {
        this.YearShowSummary = null;
        this.loading = false;
        this.snackBar.openSnackBar("Error!", 'Close', 'red-snackbar');
      })
      resolve();
    });
  }

  saveYearShowSummary() {
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(8);
    doc.text('Print Date :', 160, 8)
    doc.text(String(moment(new Date()).format('MM-DD-yyyy')), 180, 8)
    doc.line(0, 10, 300, 10);

    var text = String(new Date().getFullYear() + '&nbsp<b>Show Summary</b>');
    var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.fromHTML(text, textOffset, 10);


    doc.line(0, 20, 300, 20);
    doc.fromHTML('<b>Total Number Of Exhibitors</b> :', 10, 25)
    doc.text(String(this.YearShowSummary.TotalNumberOfExhibiitors), 67, 31)

    doc.fromHTML('<b>Number of Classes Offered </b>:', 10, 35)
    doc.text('Total Pre Entries:', 15, 48)
    doc.text('Total Post Entries :', 15, 53)
    doc.line(15, 56, 100, 56);
    doc.text('Total Entries:', 15, 61)

    if (this.YearShowSummary.numberOfClasses != null) {
      doc.text(this.YearShowSummary.numberOfClasses.TotalPreEntries != null && this.YearShowSummary.numberOfClasses.TotalPreEntries != undefined ?  String(this.YearShowSummary.numberOfClasses.TotalPreEntries) : '', 55, 48)
      doc.text(this.YearShowSummary.numberOfClasses.TotalPostEntries != null && this.YearShowSummary.numberOfClasses.TotalPostEntries != undefined ?  String(this.YearShowSummary.numberOfClasses.TotalPostEntries) : '', 55, 53)
      doc.text(this.YearShowSummary.numberOfClasses.TotalEntries != null && this.YearShowSummary.numberOfClasses.TotalEntries != undefined ?  String(this.YearShowSummary.numberOfClasses.TotalEntries) : '', 55, 61)
    }

    //NSBA
    doc.fromHTML('<b>Number of NSBA Classes Offered</b> :', 10, 62)
    doc.text('Total Pre Entries :', 15, 75)
    doc.text('Total Post Entries:', 15, 80)
    doc.line(15, 83, 100, 83);
    doc.text('Total Entries :', 15, 88)

    if (this.YearShowSummary.numberOfNSBAClasses != null) {
      doc.text(this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries != null && this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries != undefined ?  String(this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries) : '', 55, 75)
      doc.text(this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries != null && this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries != undefined ?  String(this.YearShowSummary.numberOfNSBAClasses.TotalPostEntries) : '', 55, 80)
      doc.text(this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries != null && this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries != undefined ?  String(this.YearShowSummary.numberOfNSBAClasses.TotalEntries) : '', 55, 88)
    }

    //General Fees
    doc.fromHTML('<b>General Fees</b>:', 10, 94)
    doc.text('Adminstration Fees :', 15, 107)
    doc.text('Box Stall Fees :', 15, 112)
    doc.text('Tack Stall Fees:', 15, 117)
    doc.text('Program Fees :', 15, 122)
    doc.text('NSBA Entry Fee :',15,127)
    doc.line(15, 130, 100, 130);
    doc.text('Total Fees:', 15, 135)

    if (this.YearShowSummary.generalFees != null) {
      doc.text(this.YearShowSummary.generalFees.AdminstrationsFee != null && this.YearShowSummary.generalFees.AdminstrationsFee != undefined ? '$' + String(this.YearShowSummary.generalFees.AdminstrationsFee) : '', 55, 107)
      doc.text(this.YearShowSummary.generalFees.BoxStallFee != null && this.YearShowSummary.generalFees.BoxStallFee != undefined ? '$' + String(this.YearShowSummary.generalFees.BoxStallFee) : '', 55, 112)
      doc.text(this.YearShowSummary.generalFees.TackStallFee != null && this.YearShowSummary.generalFees.TackStallFee != undefined ? '$' + String(this.YearShowSummary.generalFees.TackStallFee) : '', 55, 117)
      doc.text(this.YearShowSummary.generalFees.ProgramFee != null && this.YearShowSummary.generalFees.ProgramFee != undefined ? '$' + String(this.YearShowSummary.generalFees.ProgramFee) : '', 55, 122)
      doc.text(this.YearShowSummary.generalFees.NsbaEntryFee != null && this.YearShowSummary.generalFees.NsbaEntryFee != undefined ? '$' + String(this.YearShowSummary.generalFees.NsbaEntryFee) : '', 55, 127)
      doc.text(this.YearShowSummary.generalFees.TotalFees != null && this.YearShowSummary.generalFees.TotalFees != undefined ? '$' + String(this.YearShowSummary.generalFees.TotalFees) : '', 55, 135)
    }

    //Stalls
    doc.fromHTML('<b>Number of Stalls Assigned</b>', 10, 147)
    doc.text('Total Portable Stalls:', 15, 162)
    doc.text('Total Permanent Stalls :', 15, 167)
    doc.line(15, 170, 100, 170);
    doc.text('Total Stalls:', 15, 175)

    if (this.YearShowSummary.numberOfStall != null) {
      doc.text(this.YearShowSummary.numberOfStall.TotalPortableStalls != null && this.YearShowSummary.numberOfStall.TotalPortableStalls != undefined ?  String(this.YearShowSummary.numberOfStall.TotalPortableStalls) : '', 55, 162)
      doc.text(this.YearShowSummary.numberOfStall.TotalPermanentStalls != null && this.YearShowSummary.numberOfStall.TotalPermanentStalls != undefined ?  String(this.YearShowSummary.numberOfStall.TotalPermanentStalls) : '', 55, 167)
      doc.text(this.YearShowSummary.numberOfStall.TotalStalls != null && this.YearShowSummary.numberOfStall.TotalStalls != undefined ?  String(this.YearShowSummary.numberOfStall.TotalStalls) : '', 55, 175)
    }

    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('SponsorPatron.pdf');
      this.loading = false;
    }

    if (this.reportType == "print") {
      var printFile= window.open(doc.output('bloburl'))
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
