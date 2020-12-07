import { Component, OnInit, ViewChild } from '@angular/core';
import { YearlyMaintenanceService } from 'src/app/core/services/yearly-maintenance.service';
import { BaseRecordFilterRequest } from 'src/app/core/models/base-record-filter-request-model';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalService } from 'src/app/core/services/global.service';
import { ExhibitorService } from 'src/app/core/services/exhibitor.service';
import { YearlyMaintenanceModel } from 'src/app/core/models/yearly-maintenance-model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { ConfirmDialogModel, ConfirmDialogComponent } from 'src/app/shared/ui/modals/confirmation-modal/confirm-dialog.component';
import { environment } from 'src/environments/environment';
import { EmailModalComponent } from 'src/app/shared/ui/modals/email-modal/email-modal.component';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-scans',
  templateUrl: './scans.component.html',
  styleUrls: ['./scans.component.scss']
})
export class ScansComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  loading = false;
  yearlyMaintenanceSummaryList :any;
  totalItems: number = 0;
  documentTypes: any;
  selectedRowIndex: any;
  result: string = '';
  documentId: number = null;
  documentsList:any;
  location:string=null;
  baseRequest: BaseRecordFilterRequest = {
    Page: 1,
    Limit: 5,
    OrderBy: 'YearlyMaintenanceId',
    OrderByDescending: true,
    AllRecords: false,
    SearchTerm: null

  };
  yearlyMaintenanceSummary:YearlyMaintenanceModel={
    ShowStartDate:null,
    ShowEndDate:null,
    PreEntryCutOffDate:null,
    SponcerCutOffDate:null,
    Year:null,
    YearlyMaintenanceId:null
  }
  filesUrl = environment.filesUrl;
  constructor(private yearlyService: YearlyMaintenanceService,
              private data: GlobalService,
              private exhibitorService: ExhibitorService,
              public dialog: MatDialog,
              private snackBar: MatSnackbarComponent
              ) { }

  ngOnInit(): void {
    this.data.searchTerm.subscribe((searchTerm: string) => {
      this.baseRequest.SearchTerm = searchTerm;
      this.getYearlyMaintenanceSummary();
      this.baseRequest.Page = 1;
    });
    this.getDocumentTypes();
  }

  getYearlyMaintenanceSummary() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.yearlyService.getYearlyMaintenanceSummary(this.baseRequest).subscribe(response => {
        this.yearlyMaintenanceSummaryList = response.Data.getYearlyMaintenances;
        this.totalItems = response.Data.TotalRecords;
        if(this.baseRequest.Page === 1){
          this.paginator.pageIndex =0;
        }
        this.loading = false;
      }, error => {
        this.loading = false;

      }
      )
      resolve();
    });
  }

  getDocumentTypes() {
    this.loading = true;
    this.exhibitorService.getDocumentTypes().subscribe(response => {
      this.documentTypes = response.Data.globalCodeResponse;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.documentTypes = null;
    }
    )
  }

  highlight(id, i) {
    this.resetForm();
    this.selectedRowIndex = i;
   this.getYearlyMaintenanceByDetails(id);
  }

  getYearlyMaintenanceByDetails(id){
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.yearlyService.getYearlyMaintenanceById(id).subscribe(response => {
        this.yearlyMaintenanceSummary = response.Data;
        this.location=response.Data.Location
        this.loading = false;
      }, error => {
        this.loading = false;
  
      }
      )
      resolve();
    });
  }
  resetForm(){

   this.yearlyMaintenanceSummary.ShowStartDate=null
   this.yearlyMaintenanceSummary.ShowEndDate=null
   this.yearlyMaintenanceSummary.PreEntryCutOffDate=null
   this.yearlyMaintenanceSummary.SponcerCutOffDate=null
   this.yearlyMaintenanceSummary.YearlyMaintenanceId=null
   this.yearlyMaintenanceSummary.Year=null
   this.selectedRowIndex = null;
   this.documentId=null;
   this.documentsList=null
  
  }
  confirmRemoveYear(e,id): void {
    e.stopPropagation();
    const message = `Are you sure you want to remove the record?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteYear(id)
      }
    });

  }
  deleteYear(id){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      this.yearlyService.deleteYear(id).subscribe(response => {
        this.resetForm()
        this.getYearlyMaintenanceSummary();
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

  setDocumentType(value) {
    if(this.yearlyMaintenanceSummary.Year ===null)
  {
    this.snackBar.openSnackBar("Please select a year", 'Close', 'red-snackbar');
    return false;
  }
    
    var documentRequest={
      documentTypeId : this.documentId = Number(value),
      yearlyMaintenanceId : this.yearlyMaintenanceSummary.YearlyMaintenanceId
    }
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.yearlyService.getScannedDocuments(documentRequest).subscribe(response => {
        this.documentsList = response.Data.getScans;
        this.loading = false;
      }, error => {
        this.loading = false;
        this.documentsList =null
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      }
      )
      resolve();
    });
  }

  
  viewDocument(path) {
    window.open(this.filesUrl + path.replace(/\s+/g, '%20'), '_blank');
  }

  openEmailModal(path) {
    const dialogRef = this.dialog.open(EmailModalComponent, {
      maxWidth: "400px",
      data: path
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
    });
  }

  downloadFile(path) {
    this.loading = true;
    this.exhibitorService.downloadFile(path).subscribe(
      data => {
        switch (data.type) {
          case HttpEventType.DownloadProgress:
            break;
          case HttpEventType.Response:
            const downloadedFile = new Blob([data.body], { type: data.body.type });
            const a = document.createElement('a');
            a.setAttribute('style', 'display:none;');
            document.body.appendChild(a);
            a.download = path;
            a.href = URL.createObjectURL(downloadedFile);
            a.target = '_blank';
            a.click();
            document.body.removeChild(a);
            this.loading = false;
            break;
        }
      },
      error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
        this.loading = false;
      }
    );
  }

  printDocument(url) {
    this.loading = true;

    this.exhibitorService.downloadFile(url).subscribe(
      data => {
        switch (data.type) {
          case HttpEventType.DownloadProgress:
            break;
          case HttpEventType.Response:
            var downloadedFile = new Blob([data.body], { type: data.body.type });
            var fileURL = URL.createObjectURL(downloadedFile);
            var printFile = window.open(fileURL);
            this.loading = false;

            setTimeout(function () {
              printFile.print();
            }, 2000);
            break;
        }

      },
      error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
        this.loading = false;
      }
    );

  }

  getNext(event){

  }
}
