import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RefundCalculationModalComponent } from 'src/app/shared/ui/modals/refund-calculation-modal/refund-calculation-modal.component';
import { GeneralFeeModalComponent } from 'src/app/shared/ui/modals/general-fee-modal/general-fee-modal.component';
import { ClassCategoryModalComponent } from 'src/app/shared/ui/modals/class-category-modal/class-category-modal.component';
import { AddSizeFeeModalComponent } from 'src/app/shared/ui/modals/add-size-fee-modal/add-size-fee-modal.component';
import { ConfirmDialogComponent,ConfirmDialogModel } from 'src/app/shared/ui/modals/confirmation-modal/confirm-dialog.component';
import { BaseRecordFilterRequest } from 'src/app/core/models/base-record-filter-request-model';
import {YearlyMaintenanceService} from 'src/app/core/services/yearly-maintenance.service'
import { MatPaginator } from '@angular/material/paginator';
import { GlobalService } from 'src/app/core/services/global.service';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import * as moment from 'moment';
import { NgForm } from '@angular/forms';
import { AddRoleModalComponent } from 'src/app/shared/ui/modals/add-role-modal/add-role-modal.component';
import {YearlyMaintenanceModel, ContactInfo, Statements} from '../../../../core/models/yearly-maintenance-model'
import { ExhibitorService } from 'src/app/core/services/exhibitor.service';
import { SponsorIncentiveRefundCalculationComponent } from 'src/app/shared/ui/modals/sponsor-incentive-refund-calculation/sponsor-incentive-refund-calculation.component';

@Component({
  selector: 'app-yearly-maintenance',
  templateUrl: './yearly-maintenance.component.html',
  styleUrls: ['./yearly-maintenance.component.scss']
})
export class YearlyMaintenanceComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('addYearForm') addYearForm: NgForm;
  @ViewChild('addContactForm') addContactForm: NgForm;
  result: string = ''
  loading = false;
  totalItems: number = 0;
  yearlyMaintenanceSummaryList :any;
  registeredUsers:any;
  startDate:any;
  endDate:any;
  entryCutOffDate:any;
  sponsorDate:any;
  maxyear: any;
  minyear:any;
  years=[];
  selectedRowIndex: any;
  adFeesList:any;
  verifiedUsers:any;
  roles:any;
  classCategoryList:any;
  generalFeesList:any;
  feeDetails:any;
  statesResponse: any;
  reportsList:any;
  statementText=[];
yearlyMaintenanceSummary:YearlyMaintenanceModel={
  ShowStartDate:null,
  ShowEndDate:null,
  PreEntryCutOffDate:null,
  SponcerCutOffDate:null,
  Year:null,
  YearlyMaintenanceId:null
}

  baseRequest: BaseRecordFilterRequest = {
    Page: 1,
    Limit: 5,
    OrderBy: 'YearlyMaintenanceId',
    OrderByDescending: true,
    AllRecords: false,
    SearchTerm: null

  };
  
  contactInfo : ContactInfo ={
    Location:null,
    Email1:null,
    Email2:null,
    Phone1:null,
    Phone2:null,
    exhibitorSponsorAddress:null,
    exhibitorSponsorCity:null,
    exhibitorSponsorZip:null,
    exhibitorSponsorState:null,
    exhibitorSponsorEmail:null,
    exhibitorSponsorPhone:null,
    exhibitorRefundAddress:null,
    exhibitorRefundCity:null,
    exhibitorRefundZip:null,
    exhibitorRefundState:null,
    exhibitorRefundEmail:null,
    exhibitorRefundPhone:null,
    returnAddress:null,
    returnCity:null,
    returnZip:null,
    returnState:null,
    returnEmail:null,
    returnPhone:null,
    AAYHSContactId:null,
    yearlyMaintenanceId:null,
    Address:null,
    City:null,
    State:null,
    Zipcode:null
  }
  statement:Statements={
    YearlyMaintenanceId:null,
    YearlyStatementTextId:null,
    StatementName:null,
    StatementNumber:null,
    StatementText:null
  }
  constructor(public dialog: MatDialog,
             private yearlyService: YearlyMaintenanceService,
             private data: GlobalService,
             private exhibitorService: ExhibitorService,
             private snackBar: MatSnackbarComponent
            ) { }

  ngOnInit(): void {
    this.data.searchTerm.subscribe((searchTerm: string) => {
      this.baseRequest.SearchTerm = searchTerm;
      this.getYearlyMaintenanceSummary();
      this.baseRequest.Page = 1;
    });
    this.getNewRegisteredUsers()
    this.setYears();
    this.getVerifiedUsers();
    this.getAllRoles();
    this.getFees();
    this.getAllStates()
    this.initialiseStatementText()
  }

  highlight(id, i) {
    this.resetForm();
    this.selectedRowIndex = i;
   this.getYearlyMaintenanceByDetails(id);
   this.getContactInfo(id);
   this.getReportInfo(id);
  }

  openAddFeeModal(){
    if(this.validateyear())
    {
    var data={
      YearlyMaintainenceId:this.yearlyMaintenanceSummary.YearlyMaintenanceId
    }
    const dialogRef = this.dialog.open(AddSizeFeeModalComponent, {
      data
    });
    dialogRef.afterClosed().subscribe(dialogResult => {

      })
    }
  }

  openClassCategoryModal(){
    if(this.validateyear())
    {
    const dialogRef = this.dialog.open(ClassCategoryModalComponent, {
    });
    dialogRef.afterClosed().subscribe(dialogResult => {

      })
    }
  }

  openGeneralFeeModal(){
    if(this.validateyear())
    {
    var data={
      YearlyMaintainenceId:this.yearlyMaintenanceSummary.YearlyMaintenanceId
    }
    const dialogRef = this.dialog.open(GeneralFeeModalComponent, {
      data
    });
    dialogRef.afterClosed().subscribe(dialogResult => {

      })
    }
  }

  openScratchRefundCalculationModal(){
    if(this.validateyear())
    {
    var data={
      YearlyMaintainenceId:this.yearlyMaintenanceSummary.YearlyMaintenanceId,
    }

    const dialogRef = this.dialog.open(RefundCalculationModalComponent, {
      data
    });
    dialogRef.afterClosed().subscribe(dialogResult => {

      })
    }
  }

  openSponsorIncentiveRefundModal(){
    if(this.validateyear())
    {
    var data={
      YearlyMaintainenceId:this.yearlyMaintenanceSummary.YearlyMaintenanceId,
      StatesResponse:this.statesResponse
    }
    const dialogRef = this.dialog.open(SponsorIncentiveRefundCalculationComponent, {
      data
    });
    dialogRef.afterClosed().subscribe(dialogResult => {

      })
    }
  }

  confirmVerifyUnverify(id): void {
    var  data={
    UserId:id,
    Roles:this.roles
    }
    const dialogRef = this.dialog.open(AddRoleModalComponent, {
      maxWidth: "400px",
      data
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.getNewRegisteredUsers()
        this.getVerifiedUsers()

      }
    });
  }

  confirmRemoveUser(id): void {
    const message = `Are you sure you want to remove the user?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteUser(id)
      }
    });

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
        this.yearlyMaintenanceSummaryList = null
      }
      )
      resolve();
    });
  }

  getNext(event) {
    this.baseRequest.Page = (event.pageIndex) + 1;
    this.getYearlyMaintenanceSummary()
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

  getNewRegisteredUsers(){
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.yearlyService.getNewRegisteredUsers().subscribe(response => {
        this.registeredUsers = response.Data.getUsers;
        this.loading = false;
      }, error => {
        this.loading = false;
        this.registeredUsers =null
      }
      )
      resolve();
    });
  }

  verifyUser(id,verify){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var verifyRequest={
        userId:id,
        isApproved:verify
      }
      this.yearlyService.verifyUser(verifyRequest).subscribe(response => {
        this.getNewRegisteredUsers();
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

  deleteUser(id){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      this.yearlyService.deleteUser(id).subscribe(response => {
        this.getNewRegisteredUsers();
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.loading = false;
      }, error => {
        this.snackBar.openSnackBar(error.error.Message, 'Close', 'red-snackbar');
      this.loading = false;
      }
      )
      resolve();
    });
  }

  handleShowStartDate(){
    this.yearlyMaintenanceSummary.ShowStartDate = moment(this.yearlyMaintenanceSummary.ShowStartDate).format('MM-dd-yyyy');
  }


  handleShowEndDate(){
    this.yearlyMaintenanceSummary.ShowEndDate = moment(this.yearlyMaintenanceSummary.ShowEndDate).format('MM-dd-yyyy');

  }

  handlePreEntryCutOffDate(){
    this.yearlyMaintenanceSummary.PreEntryCutOffDate = moment(this.yearlyMaintenanceSummary.PreEntryCutOffDate).format('MM-dd-yyyy');
  }

  handleSponsorCutOffDate(){
    this.yearlyMaintenanceSummary.SponcerCutOffDate = moment(this.yearlyMaintenanceSummary.SponcerCutOffDate).format('MM-dd-yyyy');
  }

  addUpdateYear(){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var yearlyRequest={
        showStartDate:moment(this.yearlyMaintenanceSummary.ShowStartDate).format("yyyy/MM/DD"),
        showEndDate:moment(this.yearlyMaintenanceSummary.ShowEndDate).format("yyyy/MM/DD"),
        preCutOffDate:moment(this.yearlyMaintenanceSummary.PreEntryCutOffDate).format("yyyy/MM/DD"),
        sponcerCutOffDate:moment(this.yearlyMaintenanceSummary.SponcerCutOffDate).format("yyyy/MM/DD"),
        year:this.yearlyMaintenanceSummary.Year,
        yearlyMaintainenceId : this.yearlyMaintenanceSummary.YearlyMaintenanceId ==null ? 0 : this.yearlyMaintenanceSummary.YearlyMaintenanceId      }
        this.yearlyService.addYear(yearlyRequest).subscribe(response => {
        // this.reserYearForm();
        // this.getYearlyMaintenanceSummary();
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.loading = false;

        this.getYearlyMaintenanceSummary().then(res =>{ 
          if(response.NewId !=null && response.NewId>0)
          {
            if(this.yearlyMaintenanceSummary.YearlyMaintenanceId>0)
            {
              this.highlight(response.NewId,this.selectedRowIndex);
            }
            else{
              this.highlight(response.NewId,0);
            }
          
          }
        });


      }, error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;
      }
      )
      resolve();
    });
  }

  reserYearForm(){
    this.addYearForm.resetForm({ startDate: null, endDate: null, preEntryCutOffDate: null, sponsorCutOffDate: null })
  }

  setYear(e){
    this.yearlyMaintenanceSummary.Year =Number(e.target.value)

  }

 
setYears(){
   this.maxyear = new Date().getFullYear() + 1;
    this.minyear = new Date().getFullYear();
  for (var i = this.minyear; i<=this.maxyear; i++){
   this.years.push(i)
}
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
      this.snackBar.openSnackBar(error.error.Message, 'Close', 'red-snackbar');
    this.loading = false;
    }
    )
    resolve();
  });
}


getYearlyMaintenanceByDetails(id){
  return new Promise((resolve, reject) => {
    this.loading = true;
    this.yearlyService.getYearlyMaintenanceById(id).subscribe(response => {
      this.yearlyMaintenanceSummary = response.Data;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.yearlyMaintenanceSummary =null
    }
    )
    resolve();
  });
}


getAdFees(id){
  return new Promise((resolve, reject) => {
    this.loading = true;
    this.yearlyService.getAdFees(id).subscribe(response => {
      this.adFeesList = response.Data.getAdFees;
      this.loading = false;
    }, error => {
      this.loading = false;

    }
    )
    resolve();
  });
}

getVerifiedUsers(){
  return new Promise((resolve, reject) => {
    this.loading = true;
    this.yearlyService.getApprovedUser().subscribe(response => {
      this.verifiedUsers = response.Data.getUsers;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.verifiedUsers=null
    }
    )
    resolve();
  });
}

confirmRemoveApprovedUser(id){
  const message = `Are you sure you want to remove the user?`;
  const dialogData = new ConfirmDialogModel("Confirm Action", message);
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    maxWidth: "400px",
    data: dialogData
  });
  dialogRef.afterClosed().subscribe(dialogResult => {
    this.result = dialogResult;
    if (this.result) {
      this.deleteApprovedUser(id);
    }
  });
}

deleteApprovedUser(id){
  return new Promise((resolve, reject) => {   
    this.loading = true;
    this.yearlyService.deleteApprovedUser(id).subscribe(response => {
      this.getVerifiedUsers();
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      this.loading = false;
    }, error => {
      this.snackBar.openSnackBar(error.error.Message, 'Close', 'red-snackbar');
    this.loading = false;
    }
    )
    resolve();
  });
}

getAllRoles(){
  return new Promise((resolve, reject) => {
    this.loading = true;
    this.yearlyService.getRoles().subscribe(response => {
      this.roles = response.Data.getRoles;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.roles=null
    }
    )
    resolve();
  });
}

getClassCategory(){
  return new Promise((resolve, reject) => {
    this.loading = true;
    this.yearlyService.getClassCategory().subscribe(response => {
      this.classCategoryList = response.Data.getClassCategories;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.classCategoryList =null
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
      this.generalFeesList =null
    }
    )
    resolve();
  });
}


getContactInfo(id){
  return new Promise((resolve, reject) => {
    this.loading = true;
    this.yearlyService.getContactInfo(id).subscribe(response => {

      this.contactInfo.Location=response.Data.contactInfo.Location,
      this.contactInfo.Email1=response.Data.contactInfo.Email1,
      this.contactInfo.Email2=response.Data.contactInfo.Email2,
      this.contactInfo.Phone1=response.Data.contactInfo.Phone1,
      this.contactInfo.Phone2=response.Data.contactInfo.Phone2,
      this.contactInfo.Address=response.Data.contactInfo.Address,
      this.contactInfo.State=response.Data.contactInfo.State,
      this.contactInfo.City=response.Data.contactInfo.City,
      this.contactInfo.Zipcode=response.Data.contactInfo.Zipcode,

      this.contactInfo.exhibitorSponsorAddress=response.Data.exhibitorSponsorConfirmationResponse.Address,
      this.contactInfo.exhibitorSponsorCity=response.Data.exhibitorSponsorConfirmationResponse.City,
      this.contactInfo.exhibitorSponsorZip=response.Data.exhibitorSponsorConfirmationResponse.ZipCode,
      this.contactInfo.exhibitorSponsorState=response.Data.exhibitorSponsorConfirmationResponse.StateId,
      this.contactInfo.exhibitorSponsorEmail=response.Data.exhibitorSponsorConfirmationResponse.Email,
      this.contactInfo.exhibitorSponsorPhone=response.Data.exhibitorSponsorConfirmationResponse.Phone,


      this.contactInfo.exhibitorRefundAddress=response.Data.exhibitorSponsorRefundStatementResponse.Address,
      this.contactInfo.exhibitorRefundCity=response.Data.exhibitorSponsorRefundStatementResponse.City,
      this.contactInfo.exhibitorRefundZip=response.Data.exhibitorSponsorRefundStatementResponse.ZipCode,
      this.contactInfo.exhibitorRefundState=response.Data.exhibitorSponsorRefundStatementResponse.StateId,
      this.contactInfo.exhibitorRefundEmail=response.Data.exhibitorSponsorRefundStatementResponse.Email,
      this.contactInfo.exhibitorRefundPhone=response.Data.exhibitorSponsorRefundStatementResponse.Phone,

      this.contactInfo.returnAddress=response.Data.exhibitorConfirmationEntriesResponse.Address,
      this.contactInfo.returnCity=response.Data.exhibitorConfirmationEntriesResponse.City,
      this.contactInfo.returnZip=response.Data.exhibitorConfirmationEntriesResponse.ZipCode,
      this.contactInfo.returnState=response.Data.exhibitorConfirmationEntriesResponse.StateId
      this.contactInfo.returnEmail=response.Data.exhibitorConfirmationEntriesResponse.Email
      this.contactInfo.returnPhone=response.Data.exhibitorConfirmationEntriesResponse.Phone

      this.contactInfo.AAYHSContactId=response.Data.contactInfo.AAYHSContactId
    
      this.loading = false;
    }, error => {
      this.loading = false;

    }
    )
    resolve();
  });
}

resetForm(){

  this.contactInfo.Location=null,
  this.contactInfo.Email1=null,
  this.contactInfo.Email2=null,
  this.contactInfo.Phone1=null,
  this.contactInfo.Phone2=null,
  this.contactInfo.exhibitorSponsorAddress=null,
  this.contactInfo.exhibitorSponsorCity=null,
  this.contactInfo.exhibitorSponsorZip=null,
  this.contactInfo.exhibitorSponsorState=null,
  this.contactInfo.exhibitorRefundAddress=null,
  this.contactInfo.exhibitorRefundCity=null,
  this.contactInfo.exhibitorRefundZip=null,
  this.contactInfo.exhibitorRefundState=null,
  this.contactInfo.returnAddress=null,
  this.contactInfo.returnCity=null,
  this.contactInfo.returnZip=null,
  this.contactInfo.returnState=null,
  this.contactInfo.AAYHSContactId=null,
  this.contactInfo.yearlyMaintenanceId=null
  this.contactInfo.Address=null
  this.contactInfo.City=null
  this.contactInfo.State=null
  this.contactInfo.Zipcode=null

  this.adFeesList=null,
  this.classCategoryList=null,
  this.generalFeesList=null,

 this.yearlyMaintenanceSummary.ShowStartDate=null
 this.yearlyMaintenanceSummary.ShowEndDate=null
 this.yearlyMaintenanceSummary.PreEntryCutOffDate=null
 this.yearlyMaintenanceSummary.SponcerCutOffDate=null
 this.yearlyMaintenanceSummary.YearlyMaintenanceId=null
 this.yearlyMaintenanceSummary.Year=null
 this.selectedRowIndex = null;
  
 this.initialiseStatementText()
 this.reportsList=null;
}


getFees(){
  this.loading = true;
  this.yearlyService.getFees().subscribe(response => {    
   this.feeDetails = response.Data.getFees;
    this.loading = false;
  }, error => {
    this.loading = false;
  })
}


addUpdateContactInfo(){
  if(this.yearlyMaintenanceSummary.YearlyMaintenanceId ==null)
  {
    this.snackBar.openSnackBar("Please select a year", 'Close', 'red-snackbar');
    return false;
  }
  return new Promise((resolve, reject) => {   
    this.loading = true;
    this.contactInfo.AAYHSContactId=this.contactInfo.AAYHSContactId==null ? 0 :this.contactInfo.AAYHSContactId,
    this.contactInfo.exhibitorSponsorState=Number(this.contactInfo.exhibitorSponsorState)
    this.contactInfo.exhibitorRefundState=Number(this.contactInfo.exhibitorRefundState),
    this.contactInfo.returnState=Number(this.contactInfo.returnState)
    this.contactInfo.yearlyMaintenanceId=this.yearlyMaintenanceSummary.YearlyMaintenanceId
    this.yearlyService.addUpdateContact(this.contactInfo).subscribe(response => {
      this.getContactInfo(this.yearlyMaintenanceSummary.YearlyMaintenanceId);
      this.addContactForm.resetForm();
      this.getYearlyMaintenanceByDetails(this.yearlyMaintenanceSummary.YearlyMaintenanceId)
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

getAllStates() {
    
  this.loading = true;
  this.exhibitorService.getAllStates().subscribe(response => {
      this.statesResponse = response.Data.State;
      this.loading = false;
  }, error => {
    this.loading = false;
  })
 
}

validateyear(){
  if(this.yearlyMaintenanceSummary.YearlyMaintenanceId ==null)
  {
    this.snackBar.openSnackBar("Please select a year", 'Close', 'red-snackbar');
    return false;
  }
  return true;
}

getReportInfo(id){
  return new Promise((resolve, reject) => {
    this.loading = true;
    this.yearlyService.getReportsInfo(id).subscribe(response => {
      this.reportsList = response.Data.getStatementTexts;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.reportsList=null;
    }
    )
    resolve();
  });
}



updateReportInfo(data,index){
  if(this.yearlyMaintenanceSummary.YearlyMaintenanceId ==null)
  {
    this.snackBar.openSnackBar("Please select a year", 'Close', 'red-snackbar');
    return false;
  }
  return new Promise((resolve, reject) => {   
    this.loading = true; 
    this.statement.YearlyMaintenanceId=this.yearlyMaintenanceSummary.YearlyMaintenanceId

    var statementTextRequest={
      StatementName:data.StatementName,
      StatementNumber:data.StatementNumber,
      StatementText:this.statementText[index].statementText,
      Incentive:data.Incentive,
      YearlyStatementTextId:data.YearlyStatementTextId
    }

    this.yearlyService.addUpdateReportsInfo(statementTextRequest).subscribe(response => {
      this.getReportInfo(this.yearlyMaintenanceSummary.YearlyMaintenanceId);
      this.getYearlyMaintenanceByDetails(this.yearlyMaintenanceSummary.YearlyMaintenanceId)
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

initialiseStatementText(){
  this.statementText=[];
  for (let i = 0; i < 4; i++) {
    this.statementText.push({
      statementText: null,
    })
  }
}

setText(value,index){
this.statementText[index].statementText=value
}

confirmUserActiveInactive(id,e){
  e.preventDefault()
  const message = e.target.checked ? `Are you sure you want to active the user?` : `Are you sure you want to inactive the user?`;
  const dialogData = new ConfirmDialogModel("Confirm Action", message);
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    maxWidth: "400px",
    data: dialogData
  });
  dialogRef.afterClosed().subscribe(dialogResult => {
    this.result = dialogResult;
    if (this.result) {
      this.activeInactiveUser(id,e);
    }   
  });
}

activeInactiveUser(id,e){
  return new Promise((resolve, reject) => {   
    this.loading = true;
    var userRequest={
      UserId:id,
      IsActive:!e.target.checked
    }
    this.yearlyService.activeInactiveUser(userRequest).subscribe(response => {
      this.getVerifiedUsers()
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

copyData(){
  if(this.validateyear())
  {
  return new Promise((resolve, reject) => {   
    this.loading = true;
      this.yearlyService.copyData(Number(this.yearlyMaintenanceSummary.YearlyMaintenanceId)).subscribe(response => {  
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
}
