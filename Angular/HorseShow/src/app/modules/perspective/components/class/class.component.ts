

import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ClassInfoModel } from '../../../../core/models/class-model'
import { ConfirmDialogComponent, ConfirmDialogModel } from '../../../../shared/ui/modals/confirmation-modal/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { AddSplitClassModalComponent } from '../../../../shared/ui/modals/add-split-class-modal/add-split-class-modal.component';
import { BaseRecordFilterRequest } from '../../../../core/models/base-record-filter-request-model'
import { MatSnackbarComponent } from '../../../../shared/ui/mat-snackbar/mat-snackbar.component'
import { MatTabGroup } from '@angular/material/tabs'
import { NgForm } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs'
import { ClassService } from '../../../../core/services/class.service';
import { MatSort } from '@angular/material/sort';
import * as moment from 'moment';
import { ExportAsService, ExportAsConfig, SupportedExtensions } from 'ngx-export-as';
import * as jsPDF from 'jspdf';
import { ExportConfirmationModalComponent } from '../../../../shared/ui/modals/export-confirmation-modal/export-confirmation-modal.component'
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
import { GlobalService } from '../../../../core/services/global.service'
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Observable } from "rxjs";
import { ReportService } from 'src/app/core/services/report.service'
import { ReportemailComponent } from 'src/app/shared/ui/modals/reportemail/reportemail.component';

interface jsPDFWithPlugin extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.scss']
})
export class ClassComponent implements OnInit {
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  @ViewChild('classInfoForm') classInfoForm: NgForm;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('resultForm') resultForm: NgForm;
  @ViewChild('entriesForm') entriesForm: NgForm;
  @ViewChild('content') content: ElementRef;

  config: ExportAsConfig = {
    type: 'pdf',
    elementIdOrContent: 'results',

  };


  result: string = '';
  selectedRowIndex: any;
  reportType:string="";
  reportemailid:string="";
  

  classRequest = {
    ClassId: 0,
    Page: 1,
    Limit: 5,
    OrderBy: 'ExhibitorClassId',
    OrderByDescending: true,
    AllRecords: false
  }
  totalItems: number = 0;
  sortColumn: string = "";
  reverseSort: boolean = false
  entriesSortColumn: string = ""
  entriesReverseSort: boolean = false
  classesList: any
  loading = false;
  classEntries: any;
  exhibitorsResponse: any
  classHeaders: any;
  exhibitorsHorsesResponse: any
  exhibitorId: number = null;
  horseId: number = null;
  backNumber: number = null;
 // initialPostion: number = 1;
  resultPosition: number;
  resultResponse: any
  showPosition: boolean = false;
  backNumbersResponse: any;
  updatemode = false;
  updateRowIndex = -1;
  place: number = null;
  editBackNumber: number = null
  showEditInfo = false
  resultExhibitorId: number = null
  resultHorseId: number = null
  exhibitorInfo = {
    ExhibitorId: null,
    ExhibitorName: null,
    BirthYear: null,
    HorseId:null,
    HorseName: null,
    Address: null,
    AmountPaid: null,
    AmountDue: null,
    Place: null
  };
  dataForExcel = [];
  programReport: any;
  paddockReport: any;
  editExhibitorInfo = {
    ExhibitorId: null,
    ExhibitorName: null,
    BirthYear: null,
    HorseId:null,
    HorseName: null,
    Address: null,
    AmountPaid: null,
    AmountDue: null,
    Place: null
  };

  baseRequest: BaseRecordFilterRequest = {
    Page: 1,
    Limit: 5,
    OrderBy: 'ClassId',
    OrderByDescending: true,
    AllRecords: false,
    SearchTerm: null

  };
  classInfo: ClassInfoModel = {
    ClassId: 0,
    ClassHeaderId: null,
    ClassNumber: null,
    Name: null,
    AgeGroup: null,
    ScheduleDate: null,
    getClassSplit: null,
    SplitNumber: 0,
    ChampionShipIndicator: false,
    IsNSBAMember:false
  }


  seletedclassexhibitorname: string = "";
  exhibitorsResponsefilteredOptions: Observable<string[]>;

  seletedbacknumbername: string = "";
  backNumbersFilteredOptions: Observable<string[]>;

  constructor(
    public dialog: MatDialog,
    private classService: ClassService,
    private snackBar: MatSnackbarComponent,
    private exportAsService: ExportAsService,
    private data: GlobalService,
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    this.data.searchTerm.subscribe((searchTerm: string) => {
      this.baseRequest.SearchTerm = searchTerm;
      this.getAllClasses();
      this.baseRequest.Page = 1;
    });
    this.getClassheaders();
  }

  confirmRemoveClass(e, index, data): void {
    e.stopPropagation();
    const message = `Are you sure you want to remove the class?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteClass(data, index)
      }
    });

  }

  confirmRemoveExhibitor(index, data): void {
    const message = `Are you sure you want to remove the exhibitor?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteExhibitor(data, index)
      }
    });

  }

  confirmScratch(index, isScratch, id): void {
    const message = `Are you sure you want to make the changes?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.updateScratch(id, isScratch, index);
      }
    });

  }
  updateScratch(id, isScratch, index) {
    var exhibitorScratch = {
      ExhibitorClassId: id,
      IsScratch: isScratch
    }

    this.loading = true;
    this.classService.updateScratch(exhibitorScratch).subscribe(response => {
      this.loading = false;
      this.getClassEntries(this.classInfo.ClassId);
      this.getAllBackNumbers(this.classInfo.ClassId);
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
    }, error => {
      this.snackBar.openSnackBar("Error", 'Close', 'red-snackbar');
      this.loading = false;

    })
  }

  confirmRemoveResult(index, data): void {
    const message = `Are you sure you want to remove the result?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteClassResult(data, index)
      }
    });

  }
  showSplitClass() {
    var data = {
      splitNumber: this.classInfo.SplitNumber,
      entries: this.classInfo.getClassSplit,
      className: this.classInfo.Name,
      classNumber: this.classInfo.ClassNumber,
      championshipIndicator: this.classInfo.ChampionShipIndicator
    }
    const dialogRef = this.dialog.open(AddSplitClassModalComponent, {
      maxWidth: "400px",
      data
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      const result: any = dialogResult;
      if (result && result.submitted == true) {
        this.classInfo.SplitNumber = result.data.splitNumber;
        this.classInfo.getClassSplit = result.data.entries;
        this.classInfo.ChampionShipIndicator = result.data.championshipIndicator
      }
    });
  }

  getAllClasses() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.classService.getAllClasses(this.baseRequest).subscribe(response => {
        this.classesList = response.Data.classesResponse;
        this.totalItems = response.Data.TotalRecords;
        if (this.baseRequest.Page === 1) {
          this.paginator.pageIndex = 0;
        }
        this.loading = false;
      }, error => {
        this.loading = false;

      }
      )
      resolve();
    });
  }
  sortData(column) {
    this.reverseSort = (this.sortColumn === column) ? !this.reverseSort : false
    this.sortColumn = column
    this.baseRequest.OrderBy = column;
    this.baseRequest.OrderByDescending = this.reverseSort;
    this.resetForm();
    this.getAllClasses()
  }

  getSort(column) {
    if (this.sortColumn === column) {
      return this.reverseSort ? 'arrow-down'
        : 'arrow-up';
    }
  }

  highlight(id, i) {
    this.resetForm()
    this.selectedRowIndex = i;
    this.getClassDetails(id);
    this.getClassEntries(id);
    this.getClassExhibitors(id)
    this.getClassResult(id)
    this.getAllBackNumbers(id)
    this.exhibitorId = null;
  }
  getClassDetails = (id: number) => {
    this.loading = true;
    this.classService.getClassById(id).subscribe(response => {
      this.classInfo = response.Data.classResponse[0];
      this.loading = false;
    }, error => {
      this.loading = false;
      this.classInfo = null;
    }
    )
  }

  addClass = () => {
    this.loading = true;
    this.classInfo.ScheduleDate = this.classInfo.ScheduleDate ==null ? null : moment(this.classInfo.ScheduleDate).format('yyyy/MM/DD');
    this.classInfo.ClassHeaderId = Number(this.classInfo.ClassHeaderId)
    this.classService.createUpdateClass(this.classInfo).subscribe(response => {
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      this.loading = false;

      this.getAllClasses().then(res => {
        if (response.NewId != null && response.NewId > 0) {
          if (this.classInfo.ClassId > 0) {
            this.highlight(response.NewId, this.selectedRowIndex);
          }
          else {
            this.highlight(response.NewId, 0);
          }

        }
      });

    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;

    })
  }

  resetForm() {
    this.classInfo.ClassHeaderId = null;
    this.classInfo.Name = null;
    this.classInfo.ClassNumber = null;
    this.classInfo.AgeGroup = null;
    this.classInfo.ClassId = 0;
    this.classInfo.ScheduleDate = null;
    this.classInfo.getClassSplit = null;
    this.classInfo.SplitNumber = 0;
    this.classInfo.IsNSBAMember=false


    this.classEntries = null;
    this.resultResponse = null;
    this.exhibitorsResponse = null;
    this.exhibitorsHorsesResponse = null;
    this.classInfoForm.resetForm();
    this.backNumbersResponse = null;
    this.entriesForm.resetForm({ exhibitorId: null, horseId: null })
    this.resultForm.resetForm({ backNumber: null });
    this.resetExhibitorInfo()
   // this.initialPostion = 1;
    this.resultPosition = null;
    this.selectedRowIndex = null
    this.cancelEdit()

    this.exhibitorsResponsefilteredOptions = null;
    this.seletedclassexhibitorname = "";
    this.backNumbersFilteredOptions = null;
    this.seletedbacknumbername = "";
    this.classInfo.ChampionShipIndicator= false;
    this.classInfo.IsNSBAMember=false;
  }

  getClassEntries(id: number) {
    this.loading = true;
    this.classRequest.ClassId = id;
    this.classRequest.AllRecords = true
    this.classRequest.OrderBy = 'ExhibitorClassId'
    this.classService.getClassEnteries(this.classRequest).subscribe(response => {
      this.classEntries = response.Data.getClassEntries;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.classEntries = null
    })
  }

  getClassExhibitors(id: number) {
    this.loading = true;
    this.classService.getClassExhibitors(id).subscribe(response => {
      this.exhibitorsResponse = response.Data.getClassExhibitors;
      this.exhibitorsResponsefilteredOptions = response.Data.getClassExhibitors;
      this.loading = false;
    }, error => {
      this.exhibitorsResponse = null;
      this.exhibitorsResponsefilteredOptions = null;
      this.loading = false;
    })
  }

  getExhibitorHorses(id) {
    this.loading = true;
    this.classService.getExhibitorHorses(id).subscribe(response => {
      this.exhibitorsHorsesResponse = response.Data.getExhibitorHorses;
      this.exhibitorId = id
      this.loading = false;
    }, error => {
      this.exhibitorsHorsesResponse = null;
      this.loading = false;
    })

  }

  selectHorse(id: number) {
    this.horseId = id
  }

  addExhibitorToClass() {
    if (this.exhibitorId == null || this.exhibitorId == undefined) {
      return;
    }

    if (this.classInfo.ClassId == null) {
      this.snackBar.openSnackBar("Please select a class to add exhibitor", 'Close', 'red-snackbar');

    }
    this.loading = true;
    var addClassExhibitor = {
      ExhibitorId: Number(this.exhibitorId),
      ClassId: this.classInfo.ClassId,
      HorseId: Number(this.horseId),
    }
    this.classService.addExhibitorToClass(addClassExhibitor).subscribe(response => {
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      this.loading = false;
      this.exhibitorId == null;
      this.getClassEntries(this.classInfo.ClassId);
      this.getClassExhibitors(this.classInfo.ClassId);
      this.getAllBackNumbers(this.classInfo.ClassId);
      this.entriesForm.resetForm({ exhibitorId: null, horseId: null });
    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;
      this.exhibitorId == null;

    })
  }
  deleteExhibitor(id: number, index) {
    this.loading = true;
    this.classService.deleteClassExhibitor(id).subscribe(response => {
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      this.loading = false;
      this.getClassEntries(this.classInfo.ClassId);
      this.getClassExhibitors(this.classInfo.ClassId);
      this.getAllBackNumbers(this.classInfo.ClassId);
    }, error => {
      this.snackBar.openSnackBar("Error", 'Close', 'red-snackbar');
      this.loading = false;

    })
  }
  deleteClass(id, index) {
    this.loading = true;
    this.classService.deleteClass(id).subscribe(response => {
      this.loading = false;
      this.getAllClasses();
      this.resetForm();
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
    }, error => {
      this.snackBar.openSnackBar("Error", 'Close', 'red-snackbar');
      this.loading = false;

    })
  }
  deleteClassResult(id, index) {
    this.loading = true;
    this.classService.deleteClassResult(id).subscribe(response => {
      this.loading = false;
      this.getClassResult(this.classInfo.ClassId);
      this.getAllBackNumbers(this.classInfo.ClassId);
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
    }, error => {
      this.snackBar.openSnackBar("Error", 'Close', 'red-snackbar');
      this.loading = false;

    })
  }
  getNext(event) {
    this.resetForm();
    this.baseRequest.Page = (event.pageIndex) + 1;
    this.getAllClasses()
  }
  getClassResult(id: number) {
    this.loading = true;
    this.classRequest.ClassId = id
    this.classRequest.AllRecords = true
    this.classRequest.OrderBy = 'Place'
    this.classRequest.OrderByDescending = false
    this.classService.getClassResult(this.classRequest).subscribe(response => {
      this.resultResponse = response.Data.getResultOfClass;
      //this.initialPostion = (Number(response.Data.TotalRecords) + 1)
      this.loading = false;
    }, error => {
      this.loading = false;
      this.resultResponse = null
    })
  }
  handleScheduleDateSelection() {
    this.classInfo.ScheduleDate = moment(this.classInfo.ScheduleDate).format('MM-dd-yyyy');
  }
  getAllBackNumbers(id: number) {
    this.loading = true;
    this.classService.getAllBackNumbers(id).subscribe(response => {
      debugger
      if (response.Data.getBackNumbers != null && response.Data.getBackNumbers != undefined && response.Data.getBackNumbers.length > 0) {
        this.backNumbersResponse = response.Data.getBackNumbers.filter(x => x.BackNumber != null);
        this.backNumbersFilteredOptions = response.Data.getBackNumbers.filter(x => x.BackNumber != null);
      }

      this.loading = false;
    }, error => {
      this.loading = false;
      this.backNumbersResponse = null;
      this.backNumbersFilteredOptions = null;
    })
  }
  getExhibitorDetail(id) {
    var exhibitordetailRequest = {
      ClassId: this.classInfo.ClassId,
      BackNumber: Number(id)
    }
    this.loading = true;
    this.classService.getExhibitorDetails(exhibitordetailRequest).subscribe(response => {
      this.exhibitorInfo = response.Data;
      this.showPosition = true;
      this.loading = false;
    }, error => {
      this.exhibitorInfo = null;
      this.loading = false;
    })
  }

  getEditExhibitorDetail(id) {
    var exhibitordetailRequest = {
      ClassId: this.classInfo.ClassId,
      BackNumber: Number(id)
    }
    this.loading = true;
    this.classService.getExhibitorDetails(exhibitordetailRequest).subscribe(response => {
      this.editExhibitorInfo = response.Data;
      
      this.resultExhibitorId = this.editExhibitorInfo.ExhibitorId;
      this.resultHorseId = this.editExhibitorInfo.HorseId;
      this.showEditInfo = true;
      this.loading = false;
    }, error => {
      this.editExhibitorInfo = null;
      this.showEditInfo = false;
      this.loading = false;

    })
  }
  addResult() {
    if (this.backNumber == null || this.backNumber == undefined) {
      return;
    }
    if (this.resultPosition == null || this.resultPosition == undefined || this.resultPosition<=0) {
      this.resultPosition == null;
      return;
    }
    this.loading = true;
    var addClassResult = {
      ClassId: this.classInfo.ClassId,
      ExhibitorId: this.exhibitorInfo.ExhibitorId,
      HorseId: this.exhibitorInfo.HorseId,
      Place: Number(this.resultPosition),
     // Place: this.initialPostion,
    }
    this.classService.addResult(addClassResult).subscribe(response => {
      this.loading = false;
      this.getClassResult(this.classInfo.ClassId);
      this.resultForm.resetForm({ backNumber: null });
      this.getAllBackNumbers(this.classInfo.ClassId)
      this.resetExhibitorInfo();
     // this.initialPostion = 1;
      this.resultPosition = null;
      this.showPosition = false
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');

    }, error => {
      this.snackBar.openSnackBar("Error", 'Close', 'red-snackbar');
      this.loading = false;

    })
  }

  updateResult(resultId) {
    debugger
    this.loading = true;
    var addClassResult = {
      ClassId: this.classInfo.ClassId,
      ExhibitorId: this.resultExhibitorId,
      HorseId:this.resultHorseId,
      Place: this.place,
      ResultId: resultId
    }
    this.classService.updateResult(addClassResult).subscribe(response => {
      this.loading = false;
      this.getClassResult(this.classInfo.ClassId);
      this.resultForm.resetForm({ backNumber: null });
      this.resetExhibitorInfo();
    //  this.initialPostion = 1;
      this.showPosition = false
      this.updatemode = false;
      this.showEditInfo = false;
      this.place = null;
      this.editBackNumber = null
      this.updateRowIndex = -1;

      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      this.getAllBackNumbers(this.classInfo.ClassId);

    }, error => {
      this.snackBar.openSnackBar("Error", 'Close', 'red-snackbar');
      this.loading = false;

    })
  }
  resetExhibitorInfo() {
    this.exhibitorInfo.ExhibitorId = null,
      this.exhibitorInfo.ExhibitorName = null,
      this.exhibitorInfo.BirthYear = null,
      this.exhibitorInfo.HorseName = null,
      this.exhibitorInfo.HorseId = null,
      this.exhibitorInfo.Address = null,
      this.exhibitorInfo.AmountPaid = null,
      this.exhibitorInfo.AmountDue = null,
      this.exhibitorInfo.Place = null
  }
  getClassheaders() {
    this.loading = true;
    this.classService.getClassHeaders().subscribe(response => {
      this.classHeaders = response.Data.globalCodeResponse;
      this.loading = false;
    }, error => {
      this.loading = false;

    }
    )
  }
  ordinal_suffix_of(i) {
    var j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return "st";
    }
    if (j == 2 && k != 12) {
      return "nd";
    }
    if (j == 3 && k != 13) {
      return "rd";
    }
    return "th";
  }
  setClassHeader(value) {
    this.classInfo.ClassHeaderId = Number(value)
  }

  sortEntriesData(column) {
    this.entriesReverseSort = (this.entriesSortColumn === column) ? !this.entriesReverseSort : false
    this.entriesSortColumn = column
  }

  getEntriesSort(column) {
    if (this.entriesSortColumn === column) {
      return this.entriesReverseSort ? 'arrow-down'
        : 'arrow-up';
    }
  }

  savePDF(): void {
    let content = this.content.nativeElement;
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(10);
    doc.text('Class Name :', 10, 10);
    doc.text(this.classInfo.Name, 35, 10);

    doc.text('Class Number :', 10, 15);
    doc.text(this.classInfo.ClassNumber, 35, 15)

    doc.text('Age Group :', 10, 20);
    doc.text(this.classInfo.AgeGroup, 35, 20);


    doc.autoTable({
      body: this.resultResponse,
      columns:
        [
          { header: 'Result', dataKey: 'Place' },
          { header: 'Back No', dataKey: 'BackNumber' },
          { header: 'Exhibitor Name', dataKey: 'ExhibitorName' },
          { header: 'Birth Year', dataKey: 'BirthYear' },
          { header: 'Horse Name', dataKey: 'HorseName' },
          { header: 'City, St. Zip', dataKey: 'Address' },
          { header: 'Amount paid', dataKey: 'AmountPaid' },
          { header: 'Amount Due', dataKey: 'AmountDue' }

        ],
      margin: { vertical: 35, horizontal: 10 }
    })
    doc.save('ClassResult.pdf');
  }

  confirmDownload(): void {
    const message = `Are you sure you want to remove the class?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ExportConfirmationModalComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      debugger;
      const result: any = dialogResult;
      if (result.data.format != null) {
        result.data.format == "pdf" ? this.savePDF() : this.downloadExcel()
      }
    });

  }

  print() {
    let printContents, popupWin, gridTableDesc, printbutton, hideRow;
    hideRow = document.getElementById('classEntries').hidden = true;
    gridTableDesc = document.getElementById('gridTableDescPrint').style.display = "block";
    printbutton = document.getElementById('inputprintbutton').style.display = "none";
    printContents = document.getElementById('print-entries').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
    <html>
      <head>
    
        <title>Print tab</title>
        <style media="print">
  
        * {
          -webkit-print-color-adjust: exact; /*Chrome, Safari */
          color-adjust: exact;  /*Firefox*/
          box-sizing: border-box;
          font-family: Roboto, "Helvetica Neue", sans-serif;
          height:auto !important;  
          }
          table {
            border-collapse: collapse;
            border-spacing: 2px;
            margin:0 !important; 
            padding-bottom:0 !important; 
            width:100% ;
            
        }
          table thead tr th {
            background-color: #a0b8f9;
            font-family: "Roboto-Medium" ,sans-serif;
            font-size: 13px;
            text-transform: uppercase;
            border: 1px solid #a0b8f9;
            text-align: center;
            padding: 6px;
            vertical-align: middle;
            line-height: 16px;
            cursor: pointer;
            letter-spacing: 1px;
        }
        .mat-tab-group {
          font-family: "Roboto-Regular", sans-serif;
      }
        table tbody tr td {
          border: 1px solid #a0b8f9;
          text-align: center;
          color: #000;
          font-weight: 500;
          font-size: 13px;
          line-height: 24px;
          vertical-align: middle;
          padding: 6px 10px;
          font-family: "Roboto-Medium" ,sans-serif;
      }
      .dynDataSeclect {
        width: 100%;
        padding: 2px 15px 2px 5px;
        border: 1px solid #ccc;
        border-radius: 3px;
        min-height: 30px;
    }
    select {
      -webkit-appearance: none;
      background-image: url(select-arrow.png);
      background-repeat: no-repeat;
      background-position: center right;
      margin: 0;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
  }
  select {
    -webkit-writing-mode: horizontal-tb !important;
    text-rendering: auto;
    color: -internal-light-dark(black, white);
    letter-spacing: normal;
    word-spacing: normal;
    text-transform: none;
    text-indent: 0px;
    text-shadow: none;
    display: inline-block;
    text-align: start;
    appearance: menulist;
    box-sizing: border-box;
    align-items: center;
    white-space: pre;
    -webkit-rtl-ordering: logical;
    background-color: -internal-light-dark(rgb(255, 255, 255), rgb(59, 59, 59));
    cursor: default;
    margin: 0em;
    font: 400 13.3333px Arial;
    border-radius: 0px;
    border-width: 1px;
    border-style: solid;
    border-color: -internal-light-dark(rgb(118, 118, 118), rgb(195, 195, 195));
    border-image: initial;
}
.table-responsive {
  display: block;
  width: 100%;
}

table.pdfTable{
  margin-bottom: 20px !important;
  display:table;
}

table.pdfTable,table.pdfTable tbody,table.pdfTable tr {
  width:100%;
  display:table;
  border:none;
}
table.pdfTable tbody tr td{
    margin: 0;
    padding: 5px 0px !important;
    position: relative; 
    border:none;
    text-align:left;
    display:block;
    
}
.pdfdataTable {
  position: absolute;
  top: 120px;
  width: 100%;
  left:0;
}
.table.pdfTable {
  margin-left: -5px !important;
}

.print-element { display: block !important;}
.non-print-element {display: none !important;}
 
        </style>
      </head>
  <body onload="window.print();window.close()">${printContents}</body>
    </html>`
    );
    gridTableDesc = document.getElementById('gridTableDescPrint').style.display = "none";
    printbutton = document.getElementById('inputprintbutton').style.display = "inline-block";
    hideRow = document.getElementById('classEntries').hidden = false;
    popupWin.document.close();
  }
  printResult() {
    let printContents, popupWin, gridTableSection, printbutton, hideRow;
    hideRow = document.getElementById('addResultRow').hidden = true;
    gridTableSection = document.getElementById('gridTableSectionPrint').style.display = "block";
    printbutton = document.getElementById('inputprintbutton2').style.display = "none";
    printContents = document.getElementById('print-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
    <html>
      <head>
    
        <title>Print tab</title>
        <style media="print">
  
        * {
          -webkit-print-color-adjust: exact; /*Chrome, Safari */
          color-adjust: exact;  /*Firefox*/
          box-sizing: border-box;
          font-family: Roboto, "Helvetica Neue", sans-serif;
          height:auto !important;
          }
          table {
            border-collapse: collapse;
            border-spacing: 2px;
            margin:0 !important; 
            padding-bottom:0 !important;  
            width:100%  ;
            
        }
      
          table thead tr th {
            background-color: #a0b8f9;
            font-family: "Roboto-Medium" ,sans-serif;
            font-size: 13px;
            text-transform: uppercase;
            border: 1px solid #a0b8f9;
            text-align: center;
            padding: 6px;
            vertical-align: middle;
            line-height: 16px;
            cursor: pointer;
            letter-spacing: 1px;
        }
        .mat-tab-group {
          font-family: "Roboto-Regular", sans-serif;
      }
        table tbody tr td {
          border: 1px solid #a0b8f9;
          text-align: center;
          color: #000;
          font-weight: 500;
          font-size: 13px;
          line-height: 24px;
          vertical-align: middle;
          padding: 6px 10px;
          font-family: "Roboto-Medium" ,sans-serif;
      }
      .dynDataSeclect {
        width: 100%;
        padding: 2px 15px 2px 5px;
        border: 1px solid #ccc;
        border-radius: 3px;
        min-height: 30px;
    }
    select {
      -webkit-appearance: none;
      background-image: url(select-arrow.png);
      background-repeat: no-repeat;
      background-position: center right;
      margin: 0;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
  }
  select {
    -webkit-writing-mode: horizontal-tb !important;
    text-rendering: auto;
    color: -internal-light-dark(black, white);
    letter-spacing: normal;
    word-spacing: normal;
    text-transform: none;
    text-indent: 0px;
    text-shadow: none;
    display: inline-block;
    text-align: start;
    appearance: menulist;
    box-sizing: border-box;
    align-items: center;
    white-space: pre;
    -webkit-rtl-ordering: logical;
    background-color: -internal-light-dark(rgb(255, 255, 255), rgb(59, 59, 59));
    cursor: default;
    margin: 0em;
    font: 400 13.3333px Arial;
    border-radius: 0px;
    border-width: 1px;
    border-style: solid;
    border-color: -internal-light-dark(rgb(118, 118, 118), rgb(195, 195, 195));
    border-image: initial;
}
.table-responsive {
  display: block;
  width: 100%;
}
.fa {
  display: inline-block;
  font: normal normal normal 14px/1 FontAwesome;
  font-size: inherit;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
table.pdfTable{
  margin-bottom: 20px !important;
  display:table;
}
table.pdfTable,table.pdfTable tbody,table.pdfTable tr {
  width:100%;
  display:table;
  border:none;
}
table.pdfTable tbody tr td{
    margin: 0;
    padding: 5px 0px !important;
    position: relative; 
    border:none;
    text-align:left;
    display:block;
    
}
.non-print-element {display: none !important;}

/*.pdfdataTable {
  position: absolute;
  top: 120px;
  width: 100%;
  left:0;
}
.table.pdfTable {
  margin-left: -5px !important;
}*/


 
        </style>
      </head>
  <body onload="window.print();window.close()">${printContents}</body>
    </html>`
    );
    gridTableSection = document.getElementById('gridTableSectionPrint').style.display = "none";
    printbutton = document.getElementById('inputprintbutton2').style.display = "inline-block";
    hideRow = document.getElementById('addResultRow').hidden = false;

    popupWin.document.close();
  }

  setPlace(data) {
    this.place = Number(data);
  }

  editResult(index, data) {
    this.updatemode = true;
    this.updateRowIndex = index;
    this.place = data.Place;
    this.editBackNumber =null;
    this.resultExhibitorId = data.ExhibitorId;
  }

  cancelEdit() {
    this.updatemode = false;
    this.updateRowIndex = -1;
    this.showEditInfo = false;
    this.place = null;
    this.editBackNumber = null;
    this.resultExhibitorId = null
    this.resultHorseId = null
  }

  downloadExcel() {
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Class Result');
    let ClassName = worksheet.getCell('A1');
    ClassName.value = 'Class Name'
    ClassName.font = {
      name: 'Arial',
      size: 10,
      bold: true,
    }
    ClassName.alignment = { vertical: 'middle', horizontal: 'center' }


    let ClassNameValue = worksheet.getCell('B1');
    ClassNameValue.value = this.classInfo.Name
    ClassNameValue.font = {
      name: 'Arial',
      size: 10,
      bold: false,
    }
    ClassNameValue.alignment = { vertical: 'middle', horizontal: 'center' }


    let ClassNumber = worksheet.getCell('A2');
    ClassNumber.value = 'Class Number'
    ClassNumber.font = {
      name: 'Arial',
      size: 10,
      bold: true,
    }
    ClassNumber.alignment = { vertical: 'middle', horizontal: 'center' }


    let ClassNumberValue = worksheet.getCell('B2');
    ClassNumberValue.value = this.classInfo.ClassNumber
    ClassNumberValue.font = {
      name: 'Arial',
      size: 10,
      bold: false,
    }
    ClassNumberValue.alignment = { vertical: 'middle', horizontal: 'center' }


    let AgeGroup = worksheet.getCell('A3');
    AgeGroup.value = 'Age Group'
    AgeGroup.font = {
      name: 'Arial',
      size: 10,
      bold: true,
    }
    AgeGroup.alignment = { vertical: 'middle', horizontal: 'center' }


    let AgeGroupValue = worksheet.getCell('B3');
    AgeGroupValue.value = this.classInfo.AgeGroup
    AgeGroupValue.font = {
      name: 'Arial',
      size: 10,
      bold: false,
    }
    AgeGroupValue.alignment = { vertical: 'middle', horizontal: 'center' }

    worksheet.addRow([]);
    let headers = ['Result', 'Back Number', 'Name', 'Birth Year', 'Horse Name', 'City,State,Zip', 'Amount Paid', 'Amount Due'];

    let headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '#eeeeee' },
        bgColor: { argb: '#eeeeee' }
      }
      cell.font = {
        bold: true,
        size: 12
      }
    })


    this.resultResponse.forEach((row: any) => {
      let rowArr = [row.Place, row.BackNumber, row.ExhibitorName, row.BirthYear, row.HorseName, row.Address, row.AmountPaid, row.AmountDue]
      worksheet.addRow(rowArr)
    });

    //Generate & Save Excel File
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'Class Result' + '.xlsx');
    })
  }

  filterclassexhibitor(val: any, makeexhibitornull: boolean) {
    if (makeexhibitornull == true) {
      this.exhibitorId = null;
    }
    if (this.exhibitorsResponse != null && this.exhibitorsResponse != undefined && this.exhibitorsResponse.length > 0) {
      this.exhibitorsResponsefilteredOptions = this.exhibitorsResponse.filter(option =>
        option.Exhibitor.toLowerCase().includes(val.toLowerCase()));
    }
  }

  setFilteredclassexhibitor(id, event: any) {
    if (event.isUserInput) {
      this.loading = true;
      this.exhibitorId = id;
      this.horseId = null;
      this.classService.getExhibitorHorses(id).subscribe(response => {
        this.exhibitorsHorsesResponse = response.Data.getExhibitorHorses;

        this.loading = false;
      }, error => {
        this.exhibitorsHorsesResponse = null;
        this.loading = false;
      })

    }
  }

  filterbacknumber(val: any, makebacknumbernull: boolean) {
    debugger
    if (makebacknumbernull == true) {
      this.backNumber = null;
    }
    if (this.backNumbersResponse != null && this.backNumbersResponse != undefined && this.backNumbersResponse.length > 0)
     {  
     this.backNumbersFilteredOptions = this.backNumbersResponse.filter(option =>
        (option.ExhibitorHorseBackNumber.toLowerCase().toString()).includes(val.toLowerCase()));
    }
  }


  setFilteredbacknumber(id, event: any) {
    debugger
    if (event.isUserInput) {
      var exhibitordetailRequest = {
        ClassId: this.classInfo.ClassId,
        BackNumber: Number(id)
      }
      this.backNumber = Number(id);
      this.loading = true;
      this.classService.getExhibitorDetails(exhibitordetailRequest).subscribe(response => {
        this.exhibitorInfo = response.Data;
        this.showPosition = true;
        this.loading = false;
      }, error => {
        this.exhibitorInfo = null;
        this.loading = false;
      })

    }
  }

  getProgramSheet() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.reportService.getProgramSheet(this.classInfo.ClassId).subscribe(response => {
        this.programReport = response.Data;
        this.downloadProgramSheet();
      }, error => {
        this.loading = false;

      }
      )
      resolve();
    });
  }

  downloadProgramSheet(): void {
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(10);
    var text = "<b>Class</b> " + this.programReport.ClassNumber;
    var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.fromHTML(text,textOffset, 10);

    text = this.programReport.ClassName + " <b>Age</b> " + this.programReport.Age;
    textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.fromHTML(text,textOffset, 15);

    doc.text("Sponsored By",90, 33);


    doc.line(0, 35, 300,35);
    doc.setLineWidth(5.0);

    //check if there are sponsors for the class
    let yaxis = 40;
    if (this.programReport.sponsorInfo != null && this.programReport.sponsorInfo.length > 0) {
      if (this.programReport.sponsorInfo.length >= 1) {
        doc.text(this.programReport.sponsorInfo[0].SponsorName, 10, 40);
        doc.text(this.programReport.sponsorInfo[0].City + ' ' + this.programReport.sponsorInfo[0].StateZipcode, 10, 45);
        yaxis = 45;
      }

      if (this.programReport.sponsorInfo.length >= 2) {
        doc.text(this.programReport.sponsorInfo[1].SponsorName, 130, 40);
        doc.text(this.programReport.sponsorInfo[1].City + ' ' + this.programReport.sponsorInfo[1].StateZipcode, 130, 45);
        yaxis = 45;
      }

      if (this.programReport.sponsorInfo.length >= 3) {
        doc.text(this.programReport.sponsorInfo[2].SponsorName, 10, 55);
        doc.text(this.programReport.sponsorInfo[2].City + ' ' + this.programReport.sponsorInfo[2].StateZipcode, 10, 60);
        yaxis = 60;
      }

      if (this.programReport.sponsorInfo.length >= 4) {
        doc.text(this.programReport.sponsorInfo[3].SponsorName, 130, 55);
        doc.text(this.programReport.sponsorInfo[3].City + ' ' + this.programReport.sponsorInfo[3].StateZipcode, 130, 60);
        yaxis = 60;
      }

    }
    doc.autoTable({
      body: this.programReport.classInfo,
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

  getPaddockSheet() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.reportService.getPaddockSheet(this.classInfo.ClassId).subscribe(response => {
        this.paddockReport = response.Data;
        this.downloadPaddockSheet();
      }, error => {
        this.loading = false;

      }
      )
      resolve();
    });
  }

  downloadPaddockSheet() {
    var number : number=0;
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    doc.setFontSize(10);

    var text = "<b>Class</b> " + this.paddockReport.ClassNumber;
    var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.fromHTML(text,textOffset, 10);


    text = this.paddockReport.ClassName + " <b>Age</b> " + this.paddockReport.Age;
    textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.fromHTML(text,textOffset, 15);

    doc.line(0, 30, 300,30);
    doc.setLineWidth(5.0); 

    this.paddockReport.classDetails.forEach(ele => {
      number=number + 1
      ele.serialNumber=number
    });

    doc.autoTable({
      body: this.paddockReport.classDetails,
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
      startY: 40
    })


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


  setreportType(type: string,name:string) {

    if (this.classInfo.ClassId == null || this.classInfo.ClassId == undefined || Number(this.classInfo.ClassId) <= 0) {
      this.snackBar.openSnackBar("Please select class!", 'Close', 'red-snackbar');
      return;
    }
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

  getReportData(name: string){
    if (name == "Program") {
      this.getProgramSheet();
    }
    if (name == "Paddock") {
      this.getPaddockSheet();
    }
  }



}