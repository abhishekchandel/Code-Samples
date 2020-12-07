import { Component, OnInit, ViewChild } from '@angular/core';

import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FinancialTransactionsComponent } from '../../../../shared/ui/modals/financial-transactions/financial-transactions.component'
import { ExhibitorService } from '../../../../core/services/exhibitor.service';
import { BaseRecordFilterRequest } from '../../../../core/models/base-record-filter-request-model'
import { ConfirmDialogComponent, ConfirmDialogModel } from '../../../../shared/ui/modals/confirmation-modal/confirm-dialog.component';
import { MatSnackbarComponent } from '../../../../shared/ui/mat-snackbar/mat-snackbar.component'
import { ExhibitorInfoModel } from '../../../../core/models/exhibitor-model'
import { MatTabGroup } from '@angular/material/tabs'
import { GlobalService } from '../../../../core/services/global.service'
import { SponsorInfoModalComponent } from '../../../../shared/ui/modals/sponsor-info-modal/sponsor-info-modal.component'
import { NgForm } from '@angular/forms';
import { TypesList } from '../../../../core/models/sponsor-model';
import { SponsorService } from '../../../../core/services/sponsor.service';
import { BaseUrl } from 'src/app/config/url-config';
import { FilteredFinancialTransactionsComponent } from 'src/app/shared/ui/modals/filtered-financial-transactions/filtered-financial-transactions.component';
import * as moment from 'moment';
import { EmailModalComponent } from 'src/app/shared/ui/modals/email-modal/email-modal.component';
import { ReportemailComponent } from 'src/app/shared/ui/modals/reportemail/reportemail.component';
import { HttpEventType } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ExhibitorStallComponent } from '../stall/exhibitorstall.component';
import { environment } from 'src/environments/environment';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReportService } from 'src/app/core/services/report.service';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
import * as jsPDF from 'jspdf';
import { DatePipe } from '@angular/common';

interface jsPDFWithPlugin extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}


@Component({
  selector: 'app-exhibitor',
  templateUrl: './exhibitor.component.html',
  styleUrls: ['./exhibitor.component.scss']
})
export class ExhibitorComponent implements OnInit {

  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  @ViewChild('exhibitorInfoForm') exhibitorInfoForm: NgForm;
  @ViewChild('horsesForm') horsesForm: NgForm;
  @ViewChild('classesForm') classesForm: NgForm;
  @ViewChild('sponsorsForm') sponsorsForm: NgForm;
  @ViewChild('scanForm') scanForm: NgForm;
  @ViewChild('paginator') paginator: MatPaginator;

  searchTerm: string;
  maxyear: any;
  minyear: any;
  result: string = '';
  loading = false;
  exhibitorsList: any;
  totalItems: number = 0;
  selectedRowIndex: any;
  sortColumn: string = "";
  reverseSort: boolean = false;
  citiesResponse: any;
  statesResponse: any;
  statesResponseAutocomplete: any;
  zipCodesResponse: any;
  groups: any;
  years = []
  exhibitorHorses: any;
  horses: any;
  linkedHorseId: number = null;
  horseType: string = null;
  backNumberLinked: any;
  isFirstBackNumber: boolean = false;
  exhibitorClasses: any;
  classes: any;
  linkedClassId: number = null;
  exhibitorSponsors: any;
  showScratch: boolean = false;
  sponsors: any;
  linkedSponsorId: number = null;
  addHorseId: number = null;
  addnumber: number = null;
  addType: string = null;
  sponsorTypes: any
  sponsortypeId = null;
  sponsorAmount: number = null;
  showClasses = false;
  typeList: any = [];
  typeId: number = null;
  showAds = false;
  sponsorClassesList: any
  UnassignedSponsorClasses: any
  adTypeId: number = null;
  billedSummary: any;
  receievedSummary: any;
  outstanding: any;
  overPayment: any;
  refunds: any;
  AdTypes: any;
  myFiles: File;
  documentTypeId: any;
  pdf: any;
  feeBilledTotal: any;
  moneyReceivedTotal: any
  documentTypes: any;
  documentId: number = null;
  scannedDocuments: any;
  horseDate: Date;
  classDate: any;
  exhibitorTransactions: any;
  feeDetails: any
  isRefund: boolean = false;


  StallAssignmentRequestsData: any = [];
  exhibitorStallAssignmentResponses: any = [];
  StallTypes: any = [];
  horsestalllength: number = 0;
  tackstalllength: number = 0;
  UnassignedStallNumbers: any = [];



  ExhibitorRegistrationReportResponse: any;
  ExhibitorSponsorConfirmationReportResponse: any;
  ExhibitorSponsorRefundReportResponse: any;
  YearShowSummary: any;

  selectedExhibitorId: null;
  selectedHorseId: null;

  reportType: string = "download";
  sponsorRefunds: any;

  minDate = moment(new Date()).format('MM-DD-yyyy');
  //for binding images with server url
  filesUrl = environment.filesUrl;
  baseRequest: BaseRecordFilterRequest = {
    Page: 1,
    Limit: 5,
    OrderBy: 'ExhibitorId',
    OrderByDescending: true,
    AllRecords: false,
    SearchTerm: null
  };

  exhibitorInfo: ExhibitorInfoModel = {
    ExhibitorId: null,
    BackNumber: null,
    FirstName: null,
    LastName: null,
    Address: null,
    StateId: null,
    City: null,
    ZipCode: null,
    QTYProgram: 0,
    BirthYear: null,
    Phone: null,
    PrimaryEmail: null,
    SecondaryEmail: null,
    IsNSBAMember: false,
    IsDoctorNote: false,
    GroupId: null,
    GroupName: null,
    exhibitorStallAssignmentRequests: null
  };
  classDetails: any = {
    Entries: null,
    IsScratch: null
  };
  sponsorDetails: any = {
    Email: null,
    Amount: null,
    SponsorId: null,
    SponsorName: null,
    ContactName: null,
    Phone: null,
    Address: null,
    City: null,
    State: null,
    Balance:null,
    Zipcode:null
  };

  selectedStateCode: string = "";
  seletedStateName: string = "";
  seletedCityName: string = "";
  seletedhorseName: string = "";
  seletedsponsorName: string = "";
  seletedclassName: string = "";
  statefilteredOptions: Observable<string[]>;
  cityfilteredOptions: Observable<string[]>;
  filteredHorsesOption: Observable<string[]>;
  filteredSponsorHorsesOption: Observable<string[]>;
  filteredSponsorOption: Observable<string[]>;
  filteredClassesOption: Observable<string[]>;

  seletedsponsorhorseName: string = "";
  linkedSponsorHorseId: number = null;

  reportemailid: string = "";

  constructor(
    public dialog: MatDialog,
    private exhibitorService: ExhibitorService,
    private snackBar: MatSnackbarComponent,
    private data: GlobalService,
    private sponsorService: SponsorService,
    private reportService: ReportService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.data.searchTerm.subscribe((searchTerm: string) => {
      this.baseRequest.SearchTerm = searchTerm;
      this.baseRequest.Page = 1;
      this.getAllExhibitors();
      this.getAllStallTypes();
    });
    this.getAllStates();
    this.getAllGroups();
    this.setYears();
    //this.getAllAdTypes();
    this.getDocumentTypes();
    this.getAllSponsorAdTypes();

  }



  showFinancialTransaction() {
    var data = {
      ExhibitorId: this.exhibitorInfo.ExhibitorId,
      ExhibitorName: this.exhibitorInfo.FirstName + ' ' + this.exhibitorInfo.LastName,
      feeDetails: this.feeDetails,
      exhibitorTransactions: this.exhibitorTransactions,
      isRefund: this.isRefund

    }
    const dialogRef = this.dialog.open(FinancialTransactionsComponent, {
      maxWidth: "500px",
      data
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
      }
    });
  }

  getAllExhibitors() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.exhibitorService.getAllExhibitors(this.baseRequest).subscribe(response => {
        this.exhibitorsList = response.Data.exhibitorResponses;
        this.totalItems = response.Data.TotalRecords
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

  getAllStallTypes() {

    this.StallTypes = [];
    this.exhibitorService.getGlobalCodes('StallType').subscribe(response => {
      if (response.Data != null && response.Data.totalRecords > 0) {
        this.StallTypes = response.Data.globalCodeResponse;
      }
    }, error => {

    })
  }


  highlight(id, i) {
    this.resetForm()
    this.selectedRowIndex = i;
    this.getbilledFeesSummary(id);
    this.getExhibitorTransactions(id);
    this.getExhibitorDetails(id);
    this.getExhibitorHorses(id);
    this.getAllHorses(id);
    this.getExhibitorClasses(id);
    this.getAllClasses(id);
    this.getExhibitorSponsors(id);
    this.getAllSponsors(id);
    this.getAllSponsorTypes();
    this.getScannedDocuments(id);
    this.getFees();
    this.selectedExhibitorId = id;
    this.ExhibitorRegistrationReportResponse = null;
    this.ExhibitorSponsorConfirmationReportResponse = null;

    this.getSponsorRefunds(id)
  }

  resetForm() {

    // info section
    this.exhibitorInfo.ExhibitorId = null,
      this.exhibitorInfo.BackNumber = null,
      this.exhibitorInfo.FirstName = null,
      this.exhibitorInfo.LastName = null,
      this.exhibitorInfo.Address = null,
      this.exhibitorInfo.StateId = null,
      this.exhibitorInfo.City = null,
      this.exhibitorInfo.ZipCode = null,
      this.exhibitorInfo.QTYProgram = 0,
      this.exhibitorInfo.BirthYear = null,
      this.exhibitorInfo.Phone = null,
      this.exhibitorInfo.PrimaryEmail = null,
      this.exhibitorInfo.SecondaryEmail = null,
      this.exhibitorInfo.IsNSBAMember = false,
      this.exhibitorInfo.IsDoctorNote = false,
      this.exhibitorInfo.GroupId = null,
      this.exhibitorInfo.GroupName = null
    this.exhibitorInfoForm.resetForm({ quantityPrograms: 0 });
    this.selectedRowIndex = null
    this.seletedStateName=null,
    this.statefilteredOptions=this.statesResponse,
    //horses section
    this.exhibitorHorses = null;
    this.horsesForm.resetForm();
    this.isFirstBackNumber = false;
    this.horses = null;
    this.resetLinkedhorse();
    this.horseType = null;


    //class section
    this.exhibitorClasses = null;
    this.classes = null;
    this.classDetails.Entries = null,
      this.classDetails.IsScratch = null;
    this.resetLinkClass();

    //sponsor section
    this.exhibitorSponsors = null;
    this.sponsors = null;
    this.resetLinkSponsor();
    this.sponsorDetails.Email = null,
      this.sponsorDetails.AmountReceived = null,
      this.sponsorDetails.SponsorId = null,
      this.sponsorDetails.SponsorName = null,
      this.sponsorDetails.ContactName = null,
      this.sponsorDetails.Phone = null,
      this.sponsorDetails.Address = null,
      this.sponsorDetails.City = null,
      this.sponsorDetails.State = null,
      this.sponsorTypes = null;
    this.filteredSponsorHorsesOption = null;

    //financial section
    this.billedSummary = null;
    this.receievedSummary = null;
    this.feeBilledTotal = null;
    this.moneyReceivedTotal = null;
    this.overPayment = null
    this.outstanding = null
    this.refunds = null
    this.exhibitorTransactions = null;

    //scan section
    this.documentId = null;
    this.myFiles = null;
    this.scannedDocuments = null;
    this.exhibitorStallAssignmentResponses = [];
    this.horsestalllength = 0;
    this.tackstalllength = 0;

    this.cityfilteredOptions = null;
    this.zipCodesResponse = null;
    this.filteredHorsesOption = null;

    this.filteredSponsorOption = null;
    this.filteredClassesOption = null;



    this.selectedExhibitorId = null;

    this.ExhibitorRegistrationReportResponse = null;
    this.ExhibitorSponsorConfirmationReportResponse = null;

    this.sponsorRefunds = null;

  }

  getNext(event) {
    this.resetForm()
    this.baseRequest.Page = (event.pageIndex) + 1;
    this.getAllExhibitors()
  }

  sortData(column) {
    this.reverseSort = (this.sortColumn === column) ? !this.reverseSort : false
    this.sortColumn = column
    this.baseRequest.OrderBy = column;
    this.baseRequest.OrderByDescending = this.reverseSort;
    this.resetForm();
    this.getAllExhibitors()
  }

  getSort(column) {
    if (this.sortColumn === column) {
      return this.reverseSort ? 'arrow-down'
        : 'arrow-up';
    }
  }

  confirmRemoveExhibitor(e, index, data): void {
    e.stopPropagation();
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

  deleteExhibitor(id, index) {
    this.loading = true;
    this.exhibitorService.deleteExhibitor(id).subscribe(response => {
      this.loading = false;
      this.getAllExhibitors()
      this.resetForm();
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
    }, error => {
      this.snackBar.openSnackBar(error.error.Message, 'Close', 'red-snackbar');
      this.loading = false;

    })
  }





  addUpdateExhibitor() {

    if (this.exhibitorInfo.StateId == null || this.exhibitorInfo.StateId == undefined || this.exhibitorInfo.StateId <= 0) {
      return;
    }
    if (this.exhibitorInfo.City == null || this.exhibitorInfo.City == undefined || this.exhibitorInfo.City == "") {
      return;
    }
    this.loading = true;
    this.exhibitorInfo.ExhibitorId = this.exhibitorInfo.ExhibitorId != null ? Number(this.exhibitorInfo.ExhibitorId) : 0
    this.exhibitorInfo.BackNumber = this.exhibitorInfo.BackNumber != null ? Number(this.exhibitorInfo.BackNumber) : null
    this.exhibitorInfo.GroupId = this.exhibitorInfo.GroupId != null ? Number(this.exhibitorInfo.GroupId) : 0
    this.exhibitorInfo.IsNSBAMember = this.exhibitorInfo.IsNSBAMember != null ? this.exhibitorInfo.IsNSBAMember : false
    this.exhibitorInfo.IsDoctorNote = this.exhibitorInfo.IsDoctorNote != null ? this.exhibitorInfo.IsDoctorNote : false
    this.exhibitorInfo.BirthYear = this.exhibitorInfo.BirthYear != null ? Number(this.exhibitorInfo.BirthYear) : 0
    this.exhibitorInfo.QTYProgram = this.exhibitorInfo.QTYProgram != null ? Number(this.exhibitorInfo.QTYProgram) : 0

    this.StallAssignmentRequestsData = [];
    if (this.exhibitorStallAssignmentResponses.length > 0) {
      this.exhibitorStallAssignmentResponses.forEach(resp => {
        var groupstallData = {
          SelectedStallId: resp.StallId,
          StallAssignmentId: resp.StallAssignmentId,
          StallAssignmentTypeId: resp.StallAssignmentTypeId,
          StallAssignmentDate: resp.StallAssignmentDate
        }
        this.StallAssignmentRequestsData.push(groupstallData);
      });
    }

    this.exhibitorInfo.exhibitorStallAssignmentRequests = this.StallAssignmentRequestsData;






    this.exhibitorService.createUpdateExhibitor(this.exhibitorInfo).subscribe(response => {
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      this.loading = false;

      this.getAllExhibitors().then(res => {
        if (response.NewId != null && response.NewId > 0) {
          if (this.exhibitorInfo.ExhibitorId > 0) {
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



  setBirthYear(e) {
    this.exhibitorInfo.BirthYear = Number(e.target.value)

  }

  getCityName(e) {
    this.exhibitorInfo.City = (e.target.options[e.target.selectedIndex].value)
  }

  getZipNumber(e) {
    this.exhibitorInfo.ZipCode = (e.target.options[e.target.selectedIndex].value)
  }

  getAllGroups() {
    this.loading = true;
    this.exhibitorService.getGroups().subscribe(response => {
      this.groups = response.Data.getGroups;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.groups = null;
    })
  }

  getExhibitorDetails(id: number) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.exhibitorService.getExhibitorById(id).subscribe(response => {
        if (response.Data != null) {
              this.exhibitorInfo = response.Data.exhibitorResponses[0];
              this.exhibitorInfo.BackNumber = response.Data.exhibitorResponses[0].BackNumber;
              this.exhibitorStallAssignmentResponses = response.Data.exhibitorResponses[0].exhibitorStallAssignmentResponses;

              var seletedState = this.statesResponse.filter(x => x.StateId == this.exhibitorInfo.StateId);

              if (seletedState != null && seletedState != undefined && seletedState.length > 0) {
                this.seletedStateName = seletedState[0].Name;
                this.filterStates(this.seletedStateName, false);
              }
              else {
                this.seletedStateName = "";
                this.filterStates(this.seletedStateName, true);
              }
              var horseStalltype = this.StallTypes.filter(x => x.CodeName == "HorseStall");
              var tackStalltype = this.StallTypes.filter(x => x.CodeName == "TackStall");
              if (this.exhibitorStallAssignmentResponses != null && this.exhibitorStallAssignmentResponses.length > 0) {
                this.horsestalllength = this.exhibitorStallAssignmentResponses.filter(x => x.StallAssignmentTypeId
                  == horseStalltype[0].GlobalCodeId).length;
                this.tackstalllength = this.exhibitorStallAssignmentResponses.filter(x => x.StallAssignmentTypeId
                  == tackStalltype[0].GlobalCodeId).length;
              }
              else {
                this.horsestalllength = 0;
                this.tackstalllength = 0;
              }       
          this.exhibitorInfo.GroupId = this.exhibitorInfo.GroupId > 0 ? Number(this.exhibitorInfo.GroupId) : null;
          this.exhibitorInfo.QTYProgram = this.exhibitorInfo.QTYProgram > 0 ? Number(this.exhibitorInfo.QTYProgram) : null
        }
        this.loading = false;
      }, error => {
        this.loading = false;
        this.exhibitorInfo = null;
      }
      )
      resolve();
    });
  }

  setYears() {
    this.maxyear = new Date().getFullYear();
    this.minyear = this.maxyear - 18;
    for (var i = this.minyear; i <= this.maxyear; i++) {
      this.years.push(i)
    }
  }

  getExhibitorHorses(id) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.exhibitorService.getExhibitorHorses(id).subscribe(response => {
        this.exhibitorHorses = response.Data.exhibitorHorses;
        this.filteredSponsorHorsesOption = response.Data.exhibitorHorses;
        let count = response.Data.TotalRecords;
        count > 0 ? this.isFirstBackNumber = false : this.isFirstBackNumber = true
        this.loading = false;
      }, error => {
        this.loading = false;
        this.exhibitorHorses = null;
        this.filteredSponsorHorsesOption = null;
        this.isFirstBackNumber = true
        this.horseType = null;

      }
      )
      resolve();
    })
  }

  deleteExhibitorHorse(id) {
    this.loading = true;
    this.exhibitorService.deleteExhibitorHorse(id).subscribe(response => {
      this.loading = false;
      this.horsesForm.resetForm({ horseControl: null, backNumberControl: null });
      this.horseType = null;
      this.getExhibitorHorses(this.exhibitorInfo.ExhibitorId);
      this.getAllHorses(this.exhibitorInfo.ExhibitorId);
      this.getExhibitorDetails(this.exhibitorInfo.ExhibitorId);
      this.getbilledFeesSummary(this.exhibitorInfo.ExhibitorId);
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
    }, error => {
      this.snackBar.openSnackBar(error.error.Message, 'Close', 'red-snackbar');
      this.loading = false;

    })
  }

  confirmRemoveExhibitorHorse(data): void {
    const message = `Are you sure you want to remove the horse?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteExhibitorHorse(data)
      }
    });

  }

  getAllHorses(id) {
    this.loading = true;
    this.exhibitorService.getAllHorses(id).subscribe(response => {
      this.horses = response.Data.getHorses;
      this.filteredHorsesOption = response.Data.getHorses;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.horses = null;
      this.filteredHorsesOption = null;
    })
  }

  addHorseToExhibitor() {
    if (this.linkedHorseId == null || this.linkedHorseId == undefined) {
      return;
    }
    this.loading = true;
    var addHorse = {
      exhibitorId: this.exhibitorInfo.ExhibitorId,
      horseId: Number(this.linkedHorseId),
      backNumber: this.backNumberLinked != null ? Number(this.backNumberLinked) : Number(this.exhibitorInfo.BackNumber),
      isFirstBackNumber: this.isFirstBackNumber,
      date: moment(this.horseDate).format("yyyy/MM/DD")
    }
    this.exhibitorService.addHorseToExhibitor(addHorse).subscribe(response => {
      this.loading = false;
      this.horsesForm.resetForm({ horseControl: null, backNumberControl: null });
      this.resetLinkedhorse();
      this.getExhibitorHorses(this.exhibitorInfo.ExhibitorId);
      this.getAllHorses(this.exhibitorInfo.ExhibitorId);
      this.getbilledFeesSummary(this.exhibitorInfo.ExhibitorId);
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');

    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;

    })
  }

  getHorseType(id) {
    this.loading = true;
    this.linkedHorseId = id;
    this.exhibitorService.getHorseDetail(Number(id)).subscribe(response => {
      this.horseType = response.Data.HorseType;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.horseType = null;
    }
    )
  }

  resetLinkedhorse() {
    this.backNumberLinked = null;
    this.linkedHorseId = null;
    this.horseType = null;
    this.horseDate = null;
  }


  getExhibitorClasses(id) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.exhibitorService.getExhibitorClasses(id).subscribe(response => {
        this.exhibitorClasses = response.Data.getClassesOfExhibitors;
        this.loading = false;
      }, error => {
        this.loading = false;
        this.exhibitorClasses = null;
      }
      )
      resolve();
    })
  }

  confirmScratch(isScratch, id): void {
    const message = `Are you sure you want to make the changes?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.updateScratch(id, isScratch);
      }
    });

  }

  updateScratch(id, isScratch) {
    var exhibitorScratch = {
      ExhibitorClassId: id,
      IsScratch: isScratch
    }
    this.loading = true;
    this.exhibitorService.updateScratch(exhibitorScratch).subscribe(response => {
      this.loading = false;
      this.getExhibitorClasses(this.exhibitorInfo.ExhibitorId)
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
    }, error => {
      this.snackBar.openSnackBar(error.error.Message, 'Close', 'red-snackbar');
      this.loading = false;

    })
  }

  confirmRemoveExhibitorClass(data) {

    const message = `Are you sure you want to remove the class?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteExhibitorClass(data)
      }
    });


  }

  deleteExhibitorClass(id) {
    this.loading = true;
    this.exhibitorService.deleteExhibitorClass(id).subscribe(response => {
      this.loading = false;
      this.getExhibitorClasses(this.exhibitorInfo.ExhibitorId);
      this.getAllClasses(this.exhibitorInfo.ExhibitorId);
      this.getbilledFeesSummary(this.exhibitorInfo.ExhibitorId);
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
    }, error => {
      this.snackBar.openSnackBar(error.error.Message, 'Close', 'red-snackbar');
      this.loading = false;

    })
  }

  getAllClasses(id) {
    this.loading = true;
    this.exhibitorService.getAllClasses(id).subscribe(response => {
      this.classes = response.Data.getClassesForExhibitor;
      this.filteredClassesOption = response.Data.getClassesForExhibitor;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.classes = null;
      this.filteredClassesOption = null;
    })
  }

  getClassDetails(id) {
    this.loading = true;
    this.linkedClassId = id;
    this.exhibitorService.getClassDetail(Number(id), this.exhibitorInfo.ExhibitorId).subscribe(response => {
      this.classDetails = response.Data;
      this.showScratch = true;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.classDetails = null;
    }
    )
  }

  addClassToExhibitor() {
    if (this.linkedClassId == null && this.linkedClassId == undefined) {
      return;
    }
    this.loading = true;
    var addClass = {
      exhibitorId: this.exhibitorInfo.ExhibitorId,
      classId: Number(this.linkedClassId),
      date: moment(this.classDate).format("yyyy/MM/DD"),
      horseId: this.addHorseId
    }
    this.exhibitorService.addExhibitorToClass(addClass).subscribe(response => {
      this.loading = false;
      this.resetLinkClass();
      this.classesForm.resetForm({ classControl: null });
      this.getExhibitorClasses(this.exhibitorInfo.ExhibitorId);
      this.getAllClasses(this.exhibitorInfo.ExhibitorId);
      this.getbilledFeesSummary(this.exhibitorInfo.ExhibitorId);
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');

    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;
    })
  }

  resetLinkClass() {
    this.linkedClassId = null;
    this.classDetails.Entries = null;
    this.classDetails.IsScratch = null;
    this.showScratch = false;
    this.classDate = null;
  }

  setLinkedHorse(value) {
    this.addHorseId = Number(value)
  }

  getExhibitorSponsors(id) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.exhibitorService.getExhibitorSponsors(id).subscribe(response => {
        this.exhibitorSponsors = response.Data.getSponsorsOfExhibitors;
        this.loading = false;
      }, error => {
        this.loading = false;
        this.exhibitorSponsors = null;
      }
      )
      resolve();
    })
  }

  confirmRemoveExhibitorSponsor(data) {

    const message = `Are you sure you want to remove the sponsor?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteExhibitorSponsor(data)
      }
    });


  }

  deleteExhibitorSponsor(id) {
    this.loading = true;
    this.exhibitorService.deleteExhibitorSponsor(id).subscribe(response => {
      this.loading = false;
      this.getExhibitorSponsors(this.exhibitorInfo.ExhibitorId);
      this.getAllSponsors(this.exhibitorInfo.ExhibitorId);
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
    }, error => {
      this.snackBar.openSnackBar(error.error.Message, 'Close', 'red-snackbar');
      this.loading = false;

    })
  }

  getAllSponsors(id) {
    this.loading = true;
    this.exhibitorService.getAllSponsors(id).subscribe(response => {
      this.sponsors = response.Data.getSponsorForExhibitors;
      this.filteredSponsorOption = response.Data.getSponsorForExhibitors;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.sponsors = null;
      this.filteredSponsorOption = null;
    })
  }

  addSponsorToExhibitor() {
    if (this.linkedSponsorId == null || this.linkedSponsorId == undefined) {
      return;
    }
    if (this.sponsorAmount == null || this.sponsorAmount == undefined || this.sponsorAmount <= 0) {
      this.sponsorAmount = null;
      return;
    }

    if (this.linkedSponsorHorseId == null || this.linkedSponsorHorseId == undefined) {
      return;
    }
    this.loading = true;
    var addSponsor = {
      exhibitorId: this.exhibitorInfo.ExhibitorId,
      sponsorId: Number(this.linkedSponsorId),
      sponsorTypeId: this.sponsortypeId,
      HorseId: this.linkedSponsorHorseId,
      SponsorAmount: this.sponsorAmount,
      AdTypeId: this.adTypeId != null ? this.adTypeId : 0,
      typeId: this.typeId != null ? this.typeId : ""
    }
    this.exhibitorService.addSponsorToExhibitor(addSponsor).subscribe(response => {
      this.loading = false;
      this.resetLinkSponsor();
      this.sponsorsForm.resetForm({ addNumberControl: null, typeControl: null, addTypeControl: null, });
      this.getExhibitorSponsors(this.exhibitorInfo.ExhibitorId);
      this.getAllSponsors(this.exhibitorInfo.ExhibitorId);
      this.getExhibitorTransactions(this.exhibitorInfo.ExhibitorId);
      this.getSponsorRefunds(this.exhibitorInfo.ExhibitorId)
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');

    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;
    })
  }

  resetLinkSponsor() {
    this.typeId = null;
    this.adTypeId = null;
    this.linkedSponsorId = null;
    this.sponsortypeId = null;
    this.sponsorAmount = null;
    this.sponsorDetails.Email = null,
      this.sponsorDetails.AmountReceived = null,
      this.sponsorDetails.SponsorId = null,
      this.sponsorDetails.SponsorName = null,
      this.sponsorDetails.ContactName = null,
      this.sponsorDetails.Phone = null,
      this.sponsorDetails.Address = null,
      this.sponsorDetails.City = null,
      this.sponsorDetails.State = null
  }

  getSponsorDetails(id) {
    this.loading = true;
    this.linkedSponsorId = id;
    this.exhibitorService.getSponsordetails(Number(id)).subscribe(response => {
      this.sponsorDetails = response.Data;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.sponsorDetails = null;
    }
    )
  }

  showSponsorInfo(sponsor, isNew) {
    var data;

    if (isNew) {
      data = {
        sponsorName: this.sponsorDetails.SponsorName,
        contactName: this.sponsorDetails.ContactName,
        phone: this.sponsorDetails.Phone,
        email: this.sponsorDetails.Email,
        address: this.sponsorDetails.Address,
        amount: this.sponsorDetails.Amount,
        state: this.sponsorDetails.State,
        city: this.sponsorDetails.City,
        zipcode: this.sponsorDetails.Zipcode,
        sponsorId: this.sponsorDetails.SponsorId,
        balance:this.sponsorDetails.Balance,
      }
    }
    else {
      data = {
        sponsorName: sponsor.Sponsor,
        contactName: sponsor.ContactName,
        phone: sponsor.Phone,
        email: sponsor.Email,
        address: sponsor.Address,
        amount: sponsor.Amount,
        state: sponsor.State,
        city: sponsor.City,
        zipcode: sponsor.Zipcode,
        sponsorId: sponsor.SponsorId,
        amountReceived:sponsor.SponsorAmount,
        balance:sponsor.Balance
       }
    }

    const dialogRef = this.dialog.open(SponsorInfoModalComponent, {
      maxWidth: "400px",
      data
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
    });
  }

  getAllSponsorTypes() {
    this.loading = true;
    this.sponsorTypes = null;
    this.sponsorService.getAllTypes('SponsorTypes').subscribe(response => {
      if (response.Data != null && response.Data.totalRecords > 0) {
        this.sponsorTypes = response.Data.globalCodeResponse;
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      this.sponsorTypes = null;
    })
  }

  setSponsorType(id) {
    this.sponsortypeId = Number(id);
    this.typeList = [];
    this.typeId = null;
    if (this.sponsorTypes != null && this.sponsorTypes != undefined && this.sponsortypeId != null && this.sponsortypeId > 0) {

      var sponsorTypename = this.sponsorTypes.filter((x) => { return x.GlobalCodeId == this.sponsortypeId; });

      if (sponsorTypename[0].CodeName == "Class") {
        this.showClasses = true;
        this.showAds = false;

        this.sponsorClassesList = this.exhibitorClasses


      }
      if (sponsorTypename[0].CodeName == "Ad") {
        this.showClasses = false;
        this.showAds = true;
      }
    }
  }

  setType(value) {
    this.typeId = value;
  }

  getbilledFeesSummary(id) {
    this.loading = true;
    this.exhibitorService.getbilledFeesSummary(id).subscribe(response => {
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

  
  getAllSponsorAdTypes() {
    this.loading = true;
    this.AdTypes = null;
    this.sponsorService.getAllSponsorAdTypes().subscribe(response => {
      if (response.Data != null && response.Data != undefined) {
        this.AdTypes = response.Data.sponsorAdTypes;
      }
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }



  setAdType(id) {
    this.adTypeId = Number(id);
  }

  uploadDocument() {
    if (this.exhibitorInfo.ExhibitorId == null) {
      this.snackBar.openSnackBar('Please select the exhibitor', 'Close', 'red-snackbar');
      return false;
    }
    const formData: any = new FormData();
    this.loading = true;
    formData.append('exhibitor', this.exhibitorInfo.ExhibitorId);
    formData.append('documentType', this.documentId);
    formData.append('documents', this.myFiles);

    this.exhibitorService.uploadDocument(formData).subscribe(response => {
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      this.getScannedDocuments(this.exhibitorInfo.ExhibitorId);
      this.scanForm.resetForm()
      this.documentId = null;
      this.myFiles = null
      this.loading = false;
    }
      , error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
        this.loading = false;

      });
  }

  onFileChange($event) {
    this.myFiles = ($event.target.files[0]);
    var reader = new FileReader();
    const file = $event.target.files[0];
    reader.readAsDataURL(file);
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

  setDocumentType(value) {
    this.documentId = Number(value)
  }

  getScannedDocuments(id) {
    this.loading = true;
    this.exhibitorService.getScannedDocuments(id).subscribe(response => {
      this.scannedDocuments = response.Data.getUploadedDocuments;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.scannedDocuments = null;
    })
  }

  viewDocument(path) {
    window.open(this.filesUrl + path.replace(/\s+/g, '%20'), '_blank');

  }

  openTransactionDetails(id) {
    var data = {
      feeTypeId: id,
      exhibitorId: this.exhibitorInfo.ExhibitorId,
    }

    const dialogRef = this.dialog.open(FilteredFinancialTransactionsComponent, {
      maxWidth: "400px",
      data
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
    });
  }

  handleHorseDate() {
    //  this.horseDate= moment(this.horseDate).format("yyyy-MM-DD");
  }

  handleClassDate() {
    // this.classDate = moment(this.classDate).format('MM-dd-yyyy');
  }

  confirmRemoveDocument(id, path): void {
    const message = `Are you sure you want to remove the document?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteDocument(id, path)
      }
    });
  }

  deleteDocument(id, path) {
    this.loading = true;
    var document = {
      scanId: id,
      path: path
    }

    this.exhibitorService.deleteDocument(document).subscribe(response => {
      this.loading = false;
      this.scanForm.resetForm();
      this.documentId = null;
      this.myFiles = null
      this.getScannedDocuments(this.exhibitorInfo.ExhibitorId);
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
    }, error => {
      this.snackBar.openSnackBar(error.error.Message, 'Close', 'red-snackbar');
      this.loading = false;

    })
  }

  getExhibitorTransactions(id) {
    this.loading = true;
    this.exhibitorService.getExhibitorTransactions(id).subscribe(response => {
      this.exhibitorTransactions = response.Data.getExhibitorTransactions;
      this.isRefund = response.Data.IsRefund;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.exhibitorTransactions = null;
    }
    )
  }

  getFees() {
    this.loading = true;
    this.exhibitorService.getFees().subscribe(response => {
      this.feeDetails = response.Data;
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  recalculate() {
    this.getbilledFeesSummary(this.exhibitorInfo.ExhibitorId);
    this.getExhibitorTransactions(this.exhibitorInfo.ExhibitorId);
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

  openStallDiagram(buttontype: string) {
    let config = new MatDialogConfig();
    config = {
      position: {
        top: '10px',
        right: '10px'
      },
      height: '98%',
      width: '100vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-modal',
      data: {
        exhibitorStallAssignment: this.exhibitorStallAssignmentResponses,
        StallTypes: this.StallTypes,
        unassignedStallNumbers: this.UnassignedStallNumbers,
        buttontype: buttontype
      },

    };

    const dialogRef = this.dialog.open(ExhibitorStallComponent, config,

    );
    dialogRef.afterClosed().subscribe(dialogResult => {

      const result: any = dialogResult;
      if (result && result.submitted == true) {
        this.exhibitorStallAssignmentResponses = [];
        this.exhibitorStallAssignmentResponses = result.data.exhibitorAssignedStalls;
        this.UnassignedStallNumbers = result.data.unassignedStallNumbers;

        var horseStalltype = this.StallTypes.filter(x => x.CodeName == "HorseStall");
        var tackStalltype = this.StallTypes.filter(x => x.CodeName == "TackStall");
        if (this.exhibitorStallAssignmentResponses != null && this.exhibitorStallAssignmentResponses.length > 0) {
          this.horsestalllength = this.exhibitorStallAssignmentResponses.filter(x => x.StallAssignmentTypeId
            == horseStalltype[0].GlobalCodeId).length;
          this.tackstalllength = this.exhibitorStallAssignmentResponses.filter(x => x.StallAssignmentTypeId
            == tackStalltype[0].GlobalCodeId).length;
        }
        else {
          this.horsestalllength = 0;
          this.tackstalllength = 0;
        }
      }
      else {
        this.UnassignedStallNumbers = [];
      }
    });
  }

  getAllStates() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.exhibitorService.getAllStates().subscribe(response => {
        this.statesResponse = response.Data.State;
        this.statefilteredOptions = response.Data.State;
        this.loading = false;
      }, error => {
        this.loading = false;
      })
      resolve();
    });
  }

  getCities(id: number) {

    this.cityfilteredOptions = null;
    this.seletedCityName = "";
    this.exhibitorInfo.City = null;

    this.exhibitorInfo.ZipCode = null;
    this.zipCodesResponse = null;

    this.exhibitorInfo.StateId = id;
      let state= this.statesResponse.filter(option =>
      option.StateId==id);
      if(state!=null && state !=undefined && state.length >0){
      this.selectedStateCode = state[0].Code;
      }

    return new Promise((resolve, reject) => {
      this.loading = true;
      this.citiesResponse = null;
      this.exhibitorService.getCities(Number(id)).subscribe(response => {
        this.citiesResponse = response.Data.City;
        this.cityfilteredOptions = response.Data.City;
        this.loading = false;
      }, error => {
        this.loading = false;
      })
      resolve();
    });
  }

  getFilteredCities(id: number) {
      this.exhibitorInfo.StateId = id;
  }

  getZipCodes(cityName, cityId) {

    this.exhibitorInfo.ZipCode = null;
    this.zipCodesResponse = null;
    return new Promise((resolve, reject) => {

      this.exhibitorInfo.City = cityId;
      this.loading = true;
      var ZipCodeRequest=
      {
        cityname:cityName,
        statecode:this.selectedStateCode
      }

      this.exhibitorService.getZipCodes(ZipCodeRequest).subscribe(response => {
        this.zipCodesResponse = response.Data.ZipCode;
        this.loading = false;
      }, error => {
        this.loading = false;
      })
      resolve();
    });
  }

  getFileredZipCodes(cityName, cityId, event: any) {
    if (event.isUserInput) {
      this.exhibitorInfo.ZipCode = null;
      this.zipCodesResponse = null;
      return new Promise((resolve, reject) => {

        this.exhibitorInfo.City = cityId;
        this.loading = true;
        var ZipCodeRequest=
        {
          cityname:cityName,
          statecode:this.selectedStateCode
        }
        this.exhibitorService.getZipCodes(ZipCodeRequest).subscribe(response => {
          this.zipCodesResponse = response.Data.ZipCode;
          this.loading = false;
        }, error => {
          this.loading = false;
        })
        resolve();
      });
    }
  }

  filterStates(val: string, makestatenull: boolean) {
    if (makestatenull == true) {
      this.exhibitorInfo.StateId = null;
    }
    if (this.statesResponse != null && this.statesResponse != undefined && this.statesResponse.length > 0) {
      this.statefilteredOptions = this.statesResponse.filter(option =>
        option.Name.toLowerCase().includes(val.toLowerCase()));
    }
  }

  filterCities(val: string, makecitynull: boolean) {
    if (makecitynull == true) {
      this.exhibitorInfo.City = null;
    }

    if (this.citiesResponse != null && this.citiesResponse != undefined && this.citiesResponse.length > 0) {
      this.cityfilteredOptions = this.citiesResponse.filter(option =>
        option.Name.toLowerCase().includes(val.toLowerCase()));
    }
  }

  filterhorses(val: any, makehorsenull: boolean) {

    if (makehorsenull == true) {
      this.linkedHorseId = null;
    }

    if (this.horses != null && this.horses != undefined && this.horses.length > 0) {
      this.filteredHorsesOption = this.horses.filter(option =>
        option.Name.toLowerCase().includes(val.toLowerCase())
        || (option.HorseId.toString()).includes(val.toLowerCase()));
    }
  }

  setFilteredHorse(id: number, event: any) {

    if (event.isUserInput) {
      this.loading = true;
      this.linkedHorseId = id;
      this.exhibitorService.getHorseDetail(Number(id)).subscribe(response => {
        this.horseType = response.Data.HorseType;
        this.loading = false;
      }, error => {
        this.loading = false;
        this.horseType = null;
      }
      )
    }
  }

  filtersponsor(val: any, makesponsornull: boolean) {
    if (makesponsornull == true) {
      this.linkedSponsorId = null;
    }

    if (this.sponsors != null && this.sponsors != undefined && this.sponsors.length > 0) {
      this.filteredSponsorOption = this.sponsors.filter(option =>
        option.SponsorName.toLowerCase().includes(val.toLowerCase()));
    }
  }

  setFilteredSponsor(id: number, event: any) {
    if (event.isUserInput) {
      this.loading = true;
      this.linkedSponsorId = id;
      this.exhibitorService.getSponsordetails(Number(id)).subscribe(response => {
        this.sponsorDetails = response.Data;
        this.loading = false;
      }, error => {
        this.loading = false;
        this.sponsorDetails = null;
      })
    }
  }

  setsponsorAmount(value) {
    this.sponsorAmount = Number(value)
  }

  filterclass(val: any, makeclassnull: boolean) {
    if (makeclassnull == true) {
      this.linkedClassId = null;
    }

    if (this.classes != null && this.classes != undefined && this.classes.length > 0) {
      this.filteredClassesOption = this.classes.filter(option =>
        option.Name.toLowerCase().includes(val.toLowerCase())
        || (option.ClassNumber.toString()).includes(val.toLowerCase()));
    }
  }

  setFilteredClass(id: number, event: any) {
    if (event.isUserInput) {
      this.loading = true;
      this.linkedClassId = id;
      this.exhibitorService.getClassDetail(Number(id), this.exhibitorInfo.ExhibitorId).subscribe(response => {
        this.classDetails = response.Data;
        this.showScratch = true;
        this.loading = false;
      }, error => {
        this.loading = false;
        this.classDetails = null;
      })
    }
  }

  filtersponsorhorses(val: any, makesponsorhorsenull: boolean) {
    if (makesponsorhorsenull == true) {
      this.linkedSponsorHorseId = null;
    }
    if (this.exhibitorHorses != null && this.exhibitorHorses != undefined && this.exhibitorHorses.length > 0) {
      this.filteredSponsorHorsesOption = this.exhibitorHorses.filter(option =>
        option.HorseName.toLowerCase().includes(val.toLowerCase())
        || (option.HorseId.toString()).includes(val.toLowerCase()));
    }
  }

  setFilteredSponsorHorse(id: number, event: any) {

    if (event.isUserInput) {
      this.linkedSponsorHorseId = id;

    }
  }

  getExhibitorRegistrationReport() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.ExhibitorRegistrationReportResponse = null;
      this.reportService.getExhibitorRegistrationReport(Number(this.selectedExhibitorId)).subscribe(response => {
        if (response.Data != null && response.Data != undefined) {
          this.ExhibitorRegistrationReportResponse = response.Data;
          this.saveExhibitorRegistrationReportPDF();
        }
        else {
          this.snackBar.openSnackBar("No data available", 'Close', 'red-snackbar');
          this.loading = false;
        }

      }, error => {
        this.ExhibitorRegistrationReportResponse = null;
        this.loading = false;
        this.snackBar.openSnackBar("Error!", 'Close', 'red-snackbar');
      })
      resolve();
    });

  }

  getExhibitorSponsorConfirmationReport() {

    return new Promise((resolve, reject) => {
      this.loading = true;
      this.ExhibitorSponsorConfirmationReportResponse = null;
      var data = {
        ExhibitorId: this.selectedExhibitorId,
        HorseId: this.selectedHorseId != null && this.selectedHorseId != undefined ? this.selectedHorseId : 0
      };
      this.reportService.getExhibitorSponsorConfirmationReport(data).subscribe(response => {
        if (response.Data != null && response.Data != undefined) {
          this.ExhibitorSponsorConfirmationReportResponse = response.Data;
          this.saveExhibitorSponsorConfirmationReportPDF();
        }
        else {
          this.snackBar.openSnackBar("No data available", 'Close', 'red-snackbar');
          this.loading = false;
        }

      }, error => {
        this.ExhibitorSponsorConfirmationReportResponse = null;
        this.loading = false;
        this.snackBar.openSnackBar("Error!", 'Close', 'red-snackbar');
      })
      resolve();
    });

  }

  saveExhibitorRegistrationReportPDF(): void {
    let y = 10;
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    // doc.setFontSize(13);
    // var text = "AAYHS " + (this.ExhibitorRegistrationReportResponse.getExhibitorInfo.ExhibitorName != null
    //   && this.ExhibitorRegistrationReportResponse.getExhibitorInfo.ExhibitorName != undefined
    //   ? this.ExhibitorRegistrationReportResponse.getExhibitorInfo.ExhibitorName : "");


    // var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    // var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    // doc.text(textOffset, y, text);

    // y = y + 8;

    doc.setFontSize(10);


    doc.text("AAYHS Entries and Stalls", 120, y);


    y = y + 5;



    doc.text(this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.Address != null
      && this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.Address != undefined
      ? this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.Address : "", 120, y);


    doc.text(this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.CityName != null
      && this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.CityName != undefined
      ? this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.CityName : "", 120, y + 5)


    doc.text(this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.StateZipcode != null
      && this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.StateZipcode != undefined
      ? this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.StateZipcode : "", 120, y + 10)


    doc.text(this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.Phone1 != null
      && this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.Phone1 != undefined
      ? this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.Phone1 : "", 120, y + 15);


    doc.text(this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.Email1 != null
      && this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.Email1 != undefined
      ? this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.Email1 : "", 120, y + 20);

    var showdates = this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.ShowDates != null
      && this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.ShowDates != undefined
      ? this.ExhibitorRegistrationReportResponse.getAAYHSContactInfo.ShowDates : "";


    doc.text('Show Dates: ' + showdates, 120, y + 30);

    y = y + 10;

    doc.text('Print Date :', 120, y + 30);
    var newdate = new Date()
    doc.text(String(moment(new Date()).format('MM-DD-yyyy')), 140, y + 30);

    var img = new Image()
    img.src = 'assets/images/logo.png'
    doc.addImage(img, 'png', 10, 7, 16, 20)

    doc.line(0, y + 35, 300, y + 35);
    doc.setLineWidth(5.0);

    y = y + 5;

    doc.text(this.ExhibitorRegistrationReportResponse.getExhibitorInfo.ExhibitorName != null &&
      this.ExhibitorRegistrationReportResponse.getExhibitorInfo.ExhibitorName != undefined ?
      this.ExhibitorRegistrationReportResponse.getExhibitorInfo.ExhibitorName : ""
      , 10, y + 40);


    doc.text(this.ExhibitorRegistrationReportResponse.getExhibitorInfo.Address != null &&
      this.ExhibitorRegistrationReportResponse.getExhibitorInfo.Address != undefined ?
      this.ExhibitorRegistrationReportResponse.getExhibitorInfo.Address : ""
      , 10, y + 45);

    let city = this.ExhibitorRegistrationReportResponse.getExhibitorInfo.CityName != null &&
      this.ExhibitorRegistrationReportResponse.getExhibitorInfo.CityName != undefined ?
      this.ExhibitorRegistrationReportResponse.getExhibitorInfo.CityName : "";

    let state = this.ExhibitorRegistrationReportResponse.getExhibitorInfo.StateZipcode != null &&
      this.ExhibitorRegistrationReportResponse.getExhibitorInfo.StateZipcode != undefined ?
      this.ExhibitorRegistrationReportResponse.getExhibitorInfo.StateZipcode : "";


    doc.text(city + ", " + state, 10, y + 50);



    y = y - 5;

    doc.text(this.ExhibitorRegistrationReportResponse.getExhibitorInfo.Phone != null &&
      this.ExhibitorRegistrationReportResponse.getExhibitorInfo.Phone != undefined ?
      this.ExhibitorRegistrationReportResponse.getExhibitorInfo.Phone : ""
      , 10, y + 60);



    doc.text(this.ExhibitorRegistrationReportResponse.getExhibitorInfo.Email != null &&
      this.ExhibitorRegistrationReportResponse.getExhibitorInfo.Email != undefined ?
      this.ExhibitorRegistrationReportResponse.getExhibitorInfo.Email : ""
      , 10, y + 65);

y=y+5;

    doc.text('Horse Stall Numbers:', 110, y + 40);
    doc.text('Tack Stall Numbers:', 110, y + 45);
    doc.text('Exhibitor Id:', 110, y + 50);
    doc.text('Year Of Birth:', 110, y + 55);

    if (this.ExhibitorRegistrationReportResponse.stallAndTackStallNumber.horseStalls.length > 0) {
      var horsestall = "";
      this.ExhibitorRegistrationReportResponse.stallAndTackStallNumber.horseStalls.forEach(element => {
        horsestall = horsestall + ", " + element.HorseStallNumber
      });
      horsestall = horsestall.replace(/^,|,$/g, '');
      doc.text(horsestall, 145, y + 40);
    }
    if (this.ExhibitorRegistrationReportResponse.stallAndTackStallNumber.tackStalls.length > 0) {
      var tackstall = "";
      this.ExhibitorRegistrationReportResponse.stallAndTackStallNumber.tackStalls.forEach(element => {
        tackstall = tackstall + ", " + element.TackStallNumber
      });
      tackstall = tackstall.replace(/^,|,$/g, '');
      doc.text(tackstall, 145, y + 45);
    }


    doc.text(this.ExhibitorRegistrationReportResponse.stallAndTackStallNumber.ExhibitorId != null
      && this.ExhibitorRegistrationReportResponse.stallAndTackStallNumber.ExhibitorId != undefined
      ? String(this.ExhibitorRegistrationReportResponse.stallAndTackStallNumber.ExhibitorId) : ""
      , 145, y + 50);

    doc.text(this.ExhibitorRegistrationReportResponse.stallAndTackStallNumber.ExhibitorBirthYear != null
      && this.ExhibitorRegistrationReportResponse.stallAndTackStallNumber.ExhibitorBirthYear != undefined
      ? String(this.ExhibitorRegistrationReportResponse.stallAndTackStallNumber.ExhibitorBirthYear) : ""
      , 145, y + 55);



    doc.autoTable({
      body: this.ExhibitorRegistrationReportResponse.horseClassDetails,
      columns:
        [
          { header: 'HorseName', dataKey: 'HorseName' },
          { header: 'BackNumber', dataKey: 'BackNumber' },
          { header: 'ClassNumber', dataKey: 'ClassNumber' },
          { header: 'ClassName', dataKey: 'ClassName' },


        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: y + 75
    })

    let finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.line(0, finalY, 300, finalY);

    doc.setLineWidth(5.0);
    finalY = finalY + 10;

    doc.text('Total Quantity:', 140, finalY);
    doc.text('Total Amount:', 170, finalY);
    finalY = finalY + 7;

    doc.text('Class Entries:', 80, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.ClassQty != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.ClassQty != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.ClassQty) : ""
      , 150, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.ClassAmount != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.ClassAmount != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.ClassAmount) : ""
      , 180, finalY);

      finalY = finalY + 5;

      doc.text('NSBA Class Entries:', 80, finalY);
      doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.NSBAClassQty != null &&
        this.ExhibitorRegistrationReportResponse.financialsDetail.NSBAClassQty != undefined ?
        String(this.ExhibitorRegistrationReportResponse.financialsDetail.NSBAClassQty) : ""
        , 150, finalY);
      doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.NSBAClassAmount != null &&
        this.ExhibitorRegistrationReportResponse.financialsDetail.NSBAClassAmount != undefined ?
        String(this.ExhibitorRegistrationReportResponse.financialsDetail.NSBAClassAmount) : ""
        , 180, finalY);





    finalY = finalY + 5;

    doc.text('Total Horse Stall:', 80, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.HorseStallQty != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.HorseStallQty != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.HorseStallQty) : ""
      , 150, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.HorseStallAmount != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.HorseStallAmount != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.HorseStallAmount) : ""
      , 180, finalY);

    finalY = finalY + 5;



    doc.text('Total Tack stall:', 80, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.TackStallQty != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.TackStallQty != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.TackStallQty) : ""
      , 150, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.TackStallAmount != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.TackStallAmount != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.TackStallAmount) : ""
      , 180, finalY);

    finalY = finalY + 5;


    doc.text('Administration:', 80, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.AdministrationQty != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.AdministrationQty != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.AdministrationQty) : ""
      , 150, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.AdministrationAmount != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.AdministrationAmount != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.AdministrationAmount) : ""
      , 180, finalY);

    finalY = finalY + 5;



    doc.text('Additional Programs:', 80, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.AdditionalProgramQty != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.AdditionalProgramQty != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.AdditionalProgramQty) : ""
      , 150, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.AdditionalProgramAmount != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.AdditionalProgramAmount != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.AdditionalProgramAmount) : ""
      , 180, finalY);

    finalY = finalY + 5;


    doc.text('Overpayment Refund:', 80, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.Refund != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.Refund != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.Refund) : ""
      , 180, finalY);

    finalY = finalY + 10;



    doc.text('Total Amount:', 80, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.AmountDue != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.AmountDue != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.AmountDue) : ""
      , 180, finalY);

    finalY = finalY + 5;

    doc.text('Received Amount:', 80, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.ReceivedAmount != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.ReceivedAmount != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.ReceivedAmount) : ""
      , 180, finalY);


    finalY = finalY + 10;

    doc.text('Overpayment:', 80, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.Overpayment != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.Overpayment != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.Overpayment) : ""
      , 180, finalY);

    finalY = finalY + 5;

    doc.text('Balance Due:', 80, finalY);
    doc.text(this.ExhibitorRegistrationReportResponse.financialsDetail.BalanceDue != null &&
      this.ExhibitorRegistrationReportResponse.financialsDetail.BalanceDue != undefined ?
      String(this.ExhibitorRegistrationReportResponse.financialsDetail.BalanceDue) : ""
      , 180, finalY);



    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('ExhibitorEntryandStallConfirmationPDF.pdf');
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

  saveExhibitorSponsorConfirmationReportPDF(): void {
    let y = 10;
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    this.ExhibitorSponsorConfirmationReportResponse.horseinfo.forEach(info => {
   
      var img = new Image()
      img.src = 'assets/images/logo.png'
      doc.addImage(img, 'png', 10, 5, 16, 20)


    
    doc.setFontSize(13);
    var text = "AAYHS ADS AND SPONSORS";
    doc.text(120, y, text);
    y = y + 5;

    doc.setFontSize(10);

    doc.text(this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.Address != null
      && this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.Address != undefined
      ? this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.Address : "", 120, y);

    var cityname = this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.CityName != null
      && this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.CityName != undefined
      ? this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.CityName : "";
    var statename = this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.StateZipcode != null
      && this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.StateZipcode != undefined
      ? this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.StateZipcode : "";

    doc.text(cityname + ", " + statename, 120, y + 5)


    y = y - 5;


    doc.text(this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.Phone1 != null
      && this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.Phone1 != undefined
      ? this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.Phone1 : "", 120, y + 15);


    doc.text(this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.Email1 != null
      && this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.Email1 != undefined
      ? this.ExhibitorSponsorConfirmationReportResponse.getAAYHSContactInfo.Email1 : "", 120, y + 20);


    y = y + 40;


    // this.ExhibitorSponsorConfirmationReportResponse.horseinfo.forEach(info => {

      doc.text(this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.ExhibitorName != null &&
        this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.ExhibitorName != undefined ?
        this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.ExhibitorName : ""
        , 10, y);


      doc.text(info.HorseName != null && info.HorseName != undefined ? "Horse Name :  " + info.HorseName : "Horse Name : ", 120, y);


      doc.text(this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.Address != null &&
        this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.Address != undefined ?
        this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.Address : ""
        , 10, y + 5);


      doc.text('Print Date :', 120, y + 5);
      var newdate = new Date()
      doc.text(String(moment(new Date()).format('MM-DD-yyyy')), 140, y + 5);


      let city = this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.CityName != null &&
        this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.CityName != undefined ?
        this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.CityName : "";

      let state = this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.StateZipcode != null &&
        this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.StateZipcode != undefined ?
        this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.StateZipcode : "";


      doc.text(city + ", " + state, 10, y + 10);



      doc.text(this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.Phone != null &&
        this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.Phone != undefined ?
        this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.Phone : ""
        , 10, y + 15);



      doc.text(this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.Email != null &&
        this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.Email != undefined ?
        this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.Email : ""
        , 10, y + 20);

      y = y + 7;


      var reporttext = this.ExhibitorSponsorConfirmationReportResponse.ReportText != null &&
        this.ExhibitorSponsorConfirmationReportResponse.ReportText != undefined ?
        this.ExhibitorSponsorConfirmationReportResponse.ReportText : "";

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

      doc.text(this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.ExhibitorId != null &&
        this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.ExhibitorId != undefined ? "Exhibitor Id:  " +
        String(this.ExhibitorSponsorConfirmationReportResponse.exhibitorinfo.ExhibitorId) : "Exhibitor Id:  "
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

      var lastrecord = this.ExhibitorSponsorConfirmationReportResponse.horseinfo[this.ExhibitorSponsorConfirmationReportResponse.horseinfo.length - 1];
      if (lastrecord === info) {

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

  getReportData(name: string) {
    if (name == "ExhibitorRegistrationReport") {
      this.getExhibitorRegistrationReport();
    }
    if (name == "ExhibitorSponsorConfirmationStatement") {
      this.getExhibitorSponsorConfirmationReport();
    }

    if (name == "ExhibitorSponsorRefundStatement") {
      this.getExhibitorSponsorRefundReport();
    }

    if (name == "ShowSummary") {
      this.getYearShowSummary();
    }
  }

  setreportType(type: string, name: string) {

    if (this.selectedExhibitorId == null || this.selectedExhibitorId == undefined || Number(this.selectedExhibitorId) <= 0) {
      this.snackBar.openSnackBar("Please select exhibitor!", 'Close', 'red-snackbar');
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

  getSponsorRefunds(id: number) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.exhibitorService.getSponsorRefunds(id).subscribe(response => {
        this.sponsorRefunds = response.Data.exhibitorSponsors;
        this.loading = false;
      }, error => {
        this.loading = false;
        this.sponsorRefunds = null;
        resolve();
      })
    })
  }

  getExhibitorSponsorRefundReport() {

    return new Promise((resolve, reject) => {
      this.loading = true;
      this.ExhibitorSponsorRefundReportResponse = null;

      this.reportService.getExhibitorSponsorRefundReport(this.selectedExhibitorId).subscribe(response => {
        if (response.Data != null && response.Data != undefined) {
          this.ExhibitorSponsorRefundReportResponse = response.Data;
          this.saveExhibitorSponsorRefundReportPDF();
        }
        else {
          this.snackBar.openSnackBar("No data available", 'Close', 'red-snackbar');
          this.loading = false;
        }

      }, error => {
        this.ExhibitorSponsorRefundReportResponse = null;
        this.loading = false;
        this.snackBar.openSnackBar("Error!", 'Close', 'red-snackbar');
      })
      resolve();
    });

  }

  saveExhibitorSponsorRefundReportPDF(): void {

    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;
    let y = 7;
    var img = new Image()
    img.src = 'assets/images/logo.png'
    doc.addImage(img, 'png', 10, y, 16, 20)
    
    y = 10;   
    
    doc.setFontSize(13);
    var text = "AAYHS ADS AND SPONSORS";
    doc.text(120, y, text);
    y = y + 5;
    doc.setFontSize(10);

    doc.text(this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.Address != null
      && this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.Address != undefined
      ? this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.Address : "", 120, y);

    var cityname = this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.CityName != null
      && this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.CityName != undefined
      ? this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.CityName : "";
    var statename = this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.StateZipcode != null
      && this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.StateZipcode != undefined
      ? this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.StateZipcode : "";

    doc.text(cityname + ", " + statename, 120, y + 5)


    y = y - 5;


    doc.text(this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.Phone1 != null
      && this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.Phone1 != undefined
      ? this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.Phone1 : "", 120, y + 15);


    doc.text(this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.Email1 != null
      && this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.Email1 != undefined
      ? this.ExhibitorSponsorRefundReportResponse.getAAYHSContactInfo.Email1 : "", 120, y + 20);


    y = y + 40;





    if (this.ExhibitorSponsorRefundReportResponse.horsesSponsors == null 
      || this.ExhibitorSponsorRefundReportResponse.horsesSponsors == undefined
      || this.ExhibitorSponsorRefundReportResponse.horsesSponsors.length <= 0) {
 
     doc.text(this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.ExhibitorName != null &&
      this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.ExhibitorName != undefined ?
      this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.ExhibitorName : ""
       , 10, y);

     doc.text("Horse Name : ", 120, y);

     doc.text(this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Address != null &&
       this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Address != undefined ?
       this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Address : ""
       , 10, y + 5);

     doc.text('Print Date :', 120, y + 5);
     var newdate = new Date()
     doc.text(String(moment(new Date()).format('MM-DD-yyyy')), 140, y + 5);

     let city = this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.CityName != null &&
       this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.CityName != undefined ?
       this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.CityName : "";

     let state = this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.StateZipcode != null &&
       this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.StateZipcode != undefined ?
       this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.StateZipcode : "";

     doc.text(city + ", " + state, 10, y + 10);

     doc.text(this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Phone != null &&
       this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Phone != undefined ?
       this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Phone : ""
       , 10, y + 15);

     doc.text(this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Email != null &&
       this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Email != undefined ?
       this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Email : ""
       , 10, y + 20);

     y = y + 7;

     doc.text(this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.ExhibitorId != null &&
       this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.ExhibitorId != undefined ? "Exhibitor Id:  " +
       String(this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.ExhibitorId) : "Exhibitor Id:  "
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

else{
    this.ExhibitorSponsorRefundReportResponse.horsesSponsors.forEach(info => {

      doc.text(this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.ExhibitorName != null &&
        this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.ExhibitorName != undefined ?
        this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.ExhibitorName : ""
        , 10, y);


      doc.text(info.HorseName != null && info.HorseName != undefined ? "Horse Name :  " + info.HorseName : "Horse Name : ", 120, y);


      doc.text(this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Address != null &&
        this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Address != undefined ?
        this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Address : ""
        , 10, y + 5);


      doc.text('Print Date :', 120, y + 5);
      var newdate = new Date()
      doc.text(String(moment(new Date()).format('MM-DD-yyyy')), 140, y + 5);


      let city = this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.CityName != null &&
        this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.CityName != undefined ?
        this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.CityName : "";

      let state = this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.StateZipcode != null &&
        this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.StateZipcode != undefined ?
        this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.StateZipcode : "";


      doc.text(city + ", " + state, 10, y + 10);



      doc.text(this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Phone != null &&
        this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Phone != undefined ?
        this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Phone : ""
        , 10, y + 15);



      doc.text(this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Email != null &&
        this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Email != undefined ?
        this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.Email : ""
        , 10, y + 20);

      y = y + 7;



      doc.text(this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.ExhibitorId != null &&
        this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.ExhibitorId != undefined ? "Exhibitor Id:  " +
        String(this.ExhibitorSponsorRefundReportResponse.exhibitorInfo.ExhibitorId) : "Exhibitor Id:  "
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

      var lastrecord = this.ExhibitorSponsorRefundReportResponse.horsesSponsors[this.ExhibitorSponsorRefundReportResponse.horsesSponsors.length - 1];
      if (lastrecord === info) {

      }
      else {
        doc.addPage();
        y = 20;
      }
    });
  }

    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('ExhibitorSponsorRefundReportPDF.pdf');
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
      doc.text(this.YearShowSummary.numberOfClasses.TotalPreEntries != null && this.YearShowSummary.numberOfClasses.TotalPreEntries != undefined ? '$' + String(this.YearShowSummary.numberOfClasses.TotalPreEntries) : '', 55, 48)
      doc.text(this.YearShowSummary.numberOfClasses.TotalPostEntries != null && this.YearShowSummary.numberOfClasses.TotalPostEntries != undefined ? '$' + String(this.YearShowSummary.numberOfClasses.TotalPostEntries) : '', 55, 53)
      doc.text(this.YearShowSummary.numberOfClasses.TotalEntries != null && this.YearShowSummary.numberOfClasses.TotalEntries != undefined ? '$' + String(this.YearShowSummary.numberOfClasses.TotalEntries) : '', 55, 61)
    }

    //NSBA
    doc.fromHTML('<b>Number of NSBA Classes Offered</b> :', 10, 62)
    doc.text('Total Pre Entries :', 15, 75)
    doc.text('Total Post Entries:', 15, 80)
    doc.line(15, 83, 100, 83);
    doc.text('Total Entries :', 15, 88)

    if (this.YearShowSummary.numberOfNSBAClasses != null) {
      doc.text(this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries != null && this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries != undefined ? '$' + String(this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries) : '', 55, 75)
      doc.text(this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries != null && this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries != undefined ? '$' + String(this.YearShowSummary.numberOfNSBAClasses.TotalPostEntries) : '', 55, 80)
      doc.text(this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries != null && this.YearShowSummary.numberOfNSBAClasses.TotalPreEntries != undefined ? '$' + String(this.YearShowSummary.numberOfNSBAClasses.TotalEntries) : '', 55, 88)
    }

    //General Fees
    doc.fromHTML('<b>General Fees</b>:', 10, 94)
    doc.text('Adminstration Fees :', 15, 107)
    doc.text('Box Stall Fees :', 15, 112)
    doc.text('Tack Stall Fees:', 15, 117)
    doc.text('Program Fees :', 15, 122)
    doc.line(15, 125, 100, 125);
    doc.text('Total Fees:', 15, 130)

    if (this.YearShowSummary.generalFees != null) {
      doc.text(this.YearShowSummary.generalFees.AdminstrationsFee != null && this.YearShowSummary.generalFees.AdminstrationsFee != undefined ? '$' + String(this.YearShowSummary.generalFees.AdminstrationsFee) : '', 55, 107)
      doc.text(this.YearShowSummary.generalFees.BoxStallFee != null && this.YearShowSummary.generalFees.BoxStallFee != undefined ? '$' + String(this.YearShowSummary.generalFees.BoxStallFee) : '', 55, 112)
      doc.text(this.YearShowSummary.generalFees.TackStallFee != null && this.YearShowSummary.generalFees.TackStallFee != undefined ? '$' + String(this.YearShowSummary.generalFees.TackStallFee) : '', 55, 117)
      doc.text(this.YearShowSummary.generalFees.ProgramFee != null && this.YearShowSummary.generalFees.ProgramFee != undefined ? '$' + String(this.YearShowSummary.generalFees.ProgramFee) : '', 55, 122)
      doc.text(this.YearShowSummary.generalFees.TotalFees != null && this.YearShowSummary.generalFees.TotalFees != undefined ? '$' + String(this.YearShowSummary.generalFees.TotalFees) : '', 55, 130)
    }

    //Stalls
    doc.fromHTML('<b>Number of Stalls Assigned</b>', 10, 142)
    doc.text('Total Portable Stalls:', 15, 155)
    doc.text('Total Permanent Stalls :', 15, 160)
    doc.line(15, 163, 100, 163);
    doc.text('Total Stalls:', 15, 168)

    if (this.YearShowSummary.numberOfStall != null) {
      doc.text(this.YearShowSummary.numberOfStall.TotalPortableStalls != null && this.YearShowSummary.numberOfStall.TotalPortableStalls != undefined ? '$' + String(this.YearShowSummary.numberOfStall.TotalPortableStalls) : '', 55, 155)
      doc.text(this.YearShowSummary.numberOfStall.TotalPermanentStalls != null && this.YearShowSummary.numberOfStall.TotalPermanentStalls != undefined ? '$' + String(this.YearShowSummary.numberOfStall.TotalPermanentStalls) : '', 55, 160)
      doc.text(this.YearShowSummary.numberOfStall.TotalStalls != null && this.YearShowSummary.numberOfStall.TotalStalls != undefined ? '$' + String(this.YearShowSummary.numberOfStall.TotalStalls) : '', 55, 168)
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

}

