import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseRecordFilterRequest } from 'src/app/core/models/base-record-filter-request-model';
import { MatSnackbarComponent } from '../../../../shared/ui/mat-snackbar/mat-snackbar.component'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { GroupService } from 'src/app/core/services/group.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../../../../shared/ui/modals/confirmation-modal/confirm-dialog.component';
import { Observable } from "rxjs";
import { ReportemailComponent } from 'src/app/shared/ui/modals/reportemail/reportemail.component';
import { ReportService } from 'src/app/core/services/report.service';
import { MatPaginator } from '@angular/material/paginator';
import { NgForm } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs'
import { MatTable } from '@angular/material/table'
import { MatTableDataSource } from '@angular/material/table/table-data-source';
import { GroupInformationViewModel } from 'src/app/core/models/group-model';
import * as moment from 'moment';
import PerfectScrollbar from 'perfect-scrollbar';
import { GroupStallComponent } from '../stall/groupstall.component';
import { GlobalService } from 'src/app/core/services/global.service';
import 'jspdf-autotable';
import * as jsPDF from 'jspdf';
import { UserOptions } from 'jspdf-autotable';
interface jsPDFWithPlugin extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('groupInfoForm') groupInfoForm: NgForm;
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  @ViewChild('perfect-scrollbar ') perfectScrollbar: PerfectScrollbar
  @ViewChild('groupFinancialForm') groupFinancialForm: NgForm;

  baseRequest: BaseRecordFilterRequest = {
    Page: 1,
    Limit: 5,
    OrderBy: 'GroupId',
    OrderByDescending: true,
    AllRecords: false,
    SearchTerm: null

  }
  currentDate = new Date();
  cutOffDate = new Date();
  groupsList: any;
  groupExhibitorsList: any;
  groupFinancialsList: any;
  groupFinancialsTotals: any;

  PreTotal: number = 0;
  PostTotal: number = 0;
  PrePostTotal: number = 0;

  FeeTypes: any;
  FeeTypesfiltered: any;
  TimeFrameTypes: any;
  groupFinancialsRequest: any = {
    GroupFinancialId: 0,
    GroupId: 0,
    FeeTypeId: 0,
    TimeFrameId: 0,
    Amount: 0,
  }

  updateGroupFinancialsRequest: any = {
    GroupFinancialId: 0,
    Amount: 0,
  }

  FinancialsFeeTypeId: number = null;
  FinancialsTimeFrameTypeId: number = null;
  FinancialsAmount: number = null;
  UpdatedFinancialAmount: number = null;

  enablePagination: boolean = true;
  sortColumn: string = "";
  reverseSort: boolean = false;
  loading = true;

  selectedRowIndex: any;
  selectedGroupId = 0;
  citiesResponse: any;
  statesResponse: any;
  zipCodesResponse: any;
  result: string = '';
  totalItems: number = 0;
  updatemode = false;
  updateRowIndex = -1;
  groupInfo: GroupInformationViewModel = {
    GroupName: null,
    ContactName: null,
    Phone: null,
    Email: null,
    Address: null,
    City: null,
    StateId: null,
    ZipCode: null,
    AmountReceived: 0.00,
    GroupId: null,
    groupStallAssignmentRequests: null

  }

  StallAssignmentRequestsData: any = [];
  groupStallAssignmentResponses: any = [];
  StallTypes: any = [];
  horsestalllength: number = 0;
  tackstalllength: number = 0;
  UnassignedStallNumbers: any = [];
  selectedStateCode: string = "";

  seletedStateName: string = "";
  seletedCityName: string = "";
  statefilteredOptions: Observable<string[]>;
  cityfilteredOptions: Observable<string[]>;
  ExhibitorGroupInformationReportResponse: any;

  reportType: string = "download";
  reportemailid: string = "";

  constructor(private groupService: GroupService,
    private dialog: MatDialog,
    private snackBar: MatSnackbarComponent,
    private data: GlobalService,
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    this.data.searchTerm.subscribe((searchTerm: string) => {
      this.baseRequest.SearchTerm = searchTerm;
      this.baseRequest.Page = 1;
      this.getAllGroups();
    });
    this.getAllStates();
    this.getAllTimeFrameTypes();
    this.getAllStallTypes();
  }

  getAllGroups() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.groupsList = null;
      this.groupService.getAllGroups(this.baseRequest).subscribe(response => {
        if (response.Data != null && response.Data.TotalRecords > 0) {
          this.groupsList = response.Data.groupResponses;
          this.totalItems = response.Data.TotalRecords;
          if (this.baseRequest.Page === 1) {
            this.paginator.pageIndex = 0;
          }
          //this.resetForm();
        }
        this.loading = false;
      }, error => {

        this.loading = false;
      })
      resolve();
    });
  }



  getGroupDetails = (id: number, selectedRowIndex) => {
    this.loading = true;
    this.UnassignedStallNumbers = [];
    this.groupService.getGroup(id).subscribe(response => {
      if (response.Data != null) {
        this.getCities(response.Data.StateId).then(res => {
          this.getZipCodes(response.Data.CityName, true).then(res => {
            this.groupInfo = response.Data;

            
            var seletedState = this.statesResponse.filter(x => x.StateId == this.groupInfo.StateId);

            if (seletedState != null && seletedState != undefined && seletedState.length > 0) {
              this.seletedStateName = seletedState[0].Name;
              this.filterStates(this.seletedStateName, false);
            }
            else {
              this.seletedStateName = "";
              this.filterStates(this.seletedStateName, true);
            }
            
            this.groupStallAssignmentResponses = response.Data.groupStallAssignmentResponses;

            var horseStalltype = this.StallTypes.filter(x => x.CodeName == "HorseStall");
            var tackStalltype = this.StallTypes.filter(x => x.CodeName == "TackStall");
            if (this.groupStallAssignmentResponses != null && this.groupStallAssignmentResponses.length > 0) {
              this.horsestalllength = this.groupStallAssignmentResponses.filter(x => x.StallAssignmentTypeId
                == horseStalltype[0].GlobalCodeId).length;
              this.tackstalllength = this.groupStallAssignmentResponses.filter(x => x.StallAssignmentTypeId
                == tackStalltype[0].GlobalCodeId).length;
            }
            else {
              this.horsestalllength = 0;
              this.tackstalllength = 0;
            }

            this.selectedRowIndex = selectedRowIndex;
            this.groupInfo.AmountReceived = Number(this.groupInfo.AmountReceived.toFixed(2));
          });
        });

      }
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  GetGroupExhibitors(GroupId: number) {
    this.loading = true;
    this.groupExhibitorsList = null;
    this.groupService.getGroupExhibitors(GroupId).subscribe(response => {
      if (response.Data != null && response.Data.TotalRecords > 0) {
        this.groupExhibitorsList = response.Data.getGroupExhibitors;
      }
      this.loading = false;
    }, error => {

      this.loading = false;
    })
  }

  GetGroupFinancials(GroupId: number) {
    this.loading = true;
    this.groupFinancialsList = null;
    this.groupFinancialsTotals = null;
    this.groupService.getAllGroupFinancial(GroupId).subscribe(response => {
      if (response.Data != null && response.Data.TotalRecords > 0) {
        this.groupFinancialsList = response.Data.getGroupFinacials;
        this.groupFinancialsTotals = response.Data.getGroupFinacialsTotals;
        this.PreTotal = Number(this.groupFinancialsTotals.PreTotal.toFixed(2));
        this.PostTotal = Number(this.groupFinancialsTotals.PostTotal.toFixed(2));
        this.PrePostTotal = Number(this.groupFinancialsTotals.PrePostTotal.toFixed(2));
      }
      this.loading = false;
    }, error => {

      this.loading = false;
    })
  }

  AddUpdateGroup = (group) => {

    if (this.groupInfo.StateId == null || this.groupInfo.StateId == undefined || this.groupInfo.StateId <= 0) {
      return;
    }
    if (this.groupInfo.City == null || this.groupInfo.City == undefined ) {
      return;
    }
    this.loading = true;
    this.groupInfo.AmountReceived = Number(this.groupInfo.AmountReceived == null
      || this.groupInfo.AmountReceived == undefined
      || this.groupInfo.AmountReceived == NaN ? 0 :
      this.groupInfo.AmountReceived);


    this.StallAssignmentRequestsData = [];
    if (this.groupStallAssignmentResponses.length > 0) {
      this.groupStallAssignmentResponses.forEach(resp => {
        var groupstallData = {
          SelectedStallId: resp.StallId,
          StallAssignmentId: resp.StallAssignmentId,
          StallAssignmentTypeId: resp.StallAssignmentTypeId,
          StallAssignmentDate: resp.StallAssignmentDate
        }
        this.StallAssignmentRequestsData.push(groupstallData);
      });
    }

    this.groupInfo.groupStallAssignmentRequests = this.StallAssignmentRequestsData;


    this.groupService.addUpdateGroup(this.groupInfo).subscribe(response => {
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');

      this.getAllGroups().then(res => {
        if (response.Data.NewId != null && response.Data.NewId > 0) {
          if (this.groupInfo.GroupId > 0) {
            this.highlight(response.Data.NewId, this.selectedRowIndex);
          }
          else {
            this.highlight(response.Data.NewId, 0);
          }
        }
      });

    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;
    })

  }

  AddUpdateGroupFinancials() {

    this.loading = true;
    this.groupFinancialsRequest.GroupFinancialId = 0;
    this.groupFinancialsRequest.GroupId = this.selectedGroupId;
    this.groupFinancialsRequest.FeeTypeId = this.FinancialsFeeTypeId;
    this.groupFinancialsRequest.TimeFrameId = this.FinancialsTimeFrameTypeId;
    this.groupFinancialsRequest.Amount = this.FinancialsAmount;

    this.groupService.addUpdateGroupFinancials(this.groupFinancialsRequest).subscribe(response => {
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      this.GetGroupFinancials(this.selectedGroupId);
      this.FinancialsAmount = null;
      this.FinancialsFeeTypeId = null;
      this.groupFinancialForm.resetForm({ FinancialsAmount: null, FinancialsFeeTypeId: null });

    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;
    })

  }


  getAllFeeTypes() {
    this.loading = true;
    this.FeeTypes = null;
    this.groupService.getFees().subscribe(response => {
      
      if (response.Data.getFees != null && response.Data.getFees != undefined && response.Data.getFees.length > 0) {
        this.FeeTypes = response.Data.getFees.filter(x => x.FeeName == "Stall" || x.FeeName == "Tack");
      }
      else {
        this.FeeTypes = response.Data.getFees;
      }

      this.FeeTypesfiltered = this.FeeTypes.filter(x => x.TimeFrameType == 'Pre');
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  getAllStallTypes() {

    this.StallTypes = [];
    this.groupService.getGlobalCodes('StallType').subscribe(response => {
      if (response.Data != null && response.Data.totalRecords > 0) {
        this.StallTypes = response.Data.globalCodeResponse;
      }
    }, error => {

    })
  }


  getAllTimeFrameTypes() {
    this.loading = true;
    this.TimeFrameTypes = null;
    this.groupService.getGlobalCodes('TimeFrameType').subscribe(response => {
      if (response.Data != null && response.Data.totalRecords > 0) {
        this.TimeFrameTypes = response.Data.globalCodeResponse;
        if (this.TimeFrameTypes != null && this.TimeFrameTypes != undefined && this.TimeFrameTypes.length > 0) {
          var pretimeframe = this.TimeFrameTypes.filter(x => x.CodeName == "Pre");
          if (pretimeframe != null && pretimeframe != undefined && pretimeframe.length>0) {
            this.setFinancialsTimeFrameType(pretimeframe[0].GlobalCodeId, pretimeframe[0].CodeName);
          }
        }
      }
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  editFinancialsAmount(e, index, GroupFinancialId, Amount) {

    this.updatemode = true;
    this.updateRowIndex = index;
    this.UpdatedFinancialAmount = Number(Amount);
  }

  setUpdatedFinancialAmount(data) {
    this.UpdatedFinancialAmount = Number(data);
    if (this.UpdatedFinancialAmount <= 0) {
      this.UpdatedFinancialAmount = 0;
    }
  }

  cancelUpdateFinancialsAmount(e, index, GroupFinancialId) {
    this.updatemode = false;
    this.updateRowIndex = index;
  }

  updateGroupFinancialsAmount(e, index, GroupFinancialId, timeframename) {

    this.loading = true;
    this.updateRowIndex = index;
    this.updateGroupFinancialsRequest.GroupFinancialId = GroupFinancialId;
    this.updateGroupFinancialsRequest.Amount = this.UpdatedFinancialAmount;


    this.groupService.UpdateGroupFinancialsAmount(this.updateGroupFinancialsRequest).subscribe(response => {
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      this.loading = false;
      this.updatemode = false;
      this.GetGroupFinancials(this.selectedGroupId);
    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;
      this.updatemode = false;
    })
  }

  setFinancialsFeeType(id) {
    this.FinancialsFeeTypeId = Number(id);
  }

  setFinancialsTimeFrameType(id, timeframetype: string) {
    
    this.FinancialsTimeFrameTypeId = Number(id);
    this.FinancialsFeeTypeId = null;
    if (this.FeeTypes != null && this.FeeTypes != undefined && this.FeeTypes.length > 0) {
      this.FeeTypesfiltered = this.FeeTypes.filter(x => x.TimeFrameType == timeframetype)
    }
    else {
      this.FeeTypesfiltered = [];
    }
  }

  setFinancialsAmount(data) {
    this.FinancialsAmount = Number(data);
    if (this.FinancialsAmount <= 0) {
      this.FinancialsAmount = 0;
    }
  }



  //confirm delete 
  confirmRemoveGroup(e, index, Groupid): void {
    e.stopPropagation();
    const message = `Are you sure you want to remove the group?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) { this.deleteGroup(Groupid, index) }
    });
  }

  confirmRemoveGroupExhibitor(e, index, GroupExhibitorid): void {
    e.stopPropagation();
    const message = `Are you sure you want to remove the group Exhibitor?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) { this.deleteGroupExhibitor(GroupExhibitorid, index) }
    });
  }

  confirmRemoveGroupFinancials(e, index, GroupFinancialId): void {
    e.stopPropagation();
    const message = `Are you sure you want to remove the group Financials?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) { this.deleteGroupFinancials(GroupFinancialId, index) }
    });
  }




  //delete record
  deleteGroup(Groupid, index) {
    this.loading = true;
    this.groupService.deleteGroup(Groupid).subscribe(response => {

      if (response.Success == true) {
        this.loading = false;
        this.getAllGroups();
        this.resetForm();
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      }
      else {
        this.loading = false;
        this.snackBar.openSnackBar(response.Message, 'Close', 'red-snackbar');
      }
    }, error => {
      this.loading = false;
    })

  }

  deleteGroupExhibitor(GroupExhibitorid, index) {

    this.loading = true;
    this.groupService.deleteGroupExhibitors(GroupExhibitorid).subscribe(response => {

      if (response.Success == true) {
        this.GetGroupExhibitors(this.selectedGroupId)
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      }
      else {
        this.loading = false;
        this.snackBar.openSnackBar(response.Message, 'Close', 'red-snackbar');

      }
    }, error => {
      this.loading = false;
    })

  }

  deleteGroupFinancials(GroupFinancialId, index) {

    this.loading = true;
    this.groupService.deleteGroupFinancials(GroupFinancialId).subscribe(response => {

      if (response.Success == true) {
        this.GetGroupFinancials(this.selectedGroupId)
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      }
      else {
        this.loading = false;
        this.snackBar.openSnackBar(response.Message, 'Close', 'red-snackbar');

      }
    }, error => {
      this.loading = false;
    })

  }

  resetForm() {
    
    this.groupInfo.GroupName = null;
    this.groupInfo.ContactName = null;
    this.groupInfo.Phone = null;
    this.groupInfo.Email = null;
    this.groupInfo.Address = null;
    this.groupInfo.City = null;
    this.groupInfo.StateId = null;
    this.groupInfo.ZipCode = null;
    this.groupInfo.AmountReceived = 0.00;
    this.groupInfo.GroupId = 0;
    this.tabGroup.selectedIndex = 0
    this.groupInfoForm.resetForm();
    this.selectedGroupId = 0;
    this.selectedRowIndex = -1;
    this.FeeTypes = null;
    this.groupStallAssignmentResponses = [];
    this.horsestalllength = 0;
    this.tackstalllength = 0;
    this.groupFinancialsList = null;
    this.groupExhibitorsList = null;
    this.cityfilteredOptions = null;
    this.zipCodesResponse = null;

    this.seletedStateName=null,
    this.statefilteredOptions=this.statesResponse
    this.ExhibitorGroupInformationReportResponse = null;
    this.selectedGroupId = null;

  }

  getNext(event) {
    this.baseRequest.Page = (event.pageIndex) + 1;
    this.getAllGroupsForPagination()
  }

  getAllGroupsForPagination() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.groupsList = null;
      this.groupService.getAllGroups(this.baseRequest).subscribe(response => {
        if (response.Data != null && response.Data.TotalRecords > 0) {
          this.groupsList = response.Data.groupResponses;
          this.totalItems = response.Data.TotalRecords;
          this.resetForm();
        }
        this.loading = false;
      }, error => {

        this.loading = false;
      })
      resolve();
    });
  }


  highlight(selectedGroupId, i) {
    
    this.selectedRowIndex = i;
    this.selectedGroupId = selectedGroupId;
    this.getGroupDetails(selectedGroupId, i);
    this.GetGroupExhibitors(selectedGroupId);
    this.GetGroupFinancials(selectedGroupId);
    this.getAllFeeTypes();
    this.groupFinancialForm.resetForm({ FinancialsAmount: null, FinancialsFeeTypeId: null });

    this.ExhibitorGroupInformationReportResponse = null;
  }


  sortData(column) {
    this.reverseSort = (this.sortColumn === column) ? !this.reverseSort : false
    this.sortColumn = column
    this.baseRequest.OrderBy = column;
    this.baseRequest.OrderByDescending = this.reverseSort;
    this.getAllGroupsForPagination()
  }

  getSort(column) {

    if (this.sortColumn === column) {
      return this.reverseSort ? 'arrow-down'
        : 'arrow-up';
    }
  }

  getStateName(e) {
    this.groupInfo.StateId = Number(e.target.options[e.target.selectedIndex].value)
  }

  getCityName(e) {
    this.groupInfo.City = (e.target.options[e.target.selectedIndex].value)
  }

  getZipNumber(e) {
    this.groupInfo.ZipCode = e.target.options[e.target.selectedIndex].value
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
        groupStallAssignment: this.groupStallAssignmentResponses,
        StallTypes: this.StallTypes,
        unassignedStallNumbers: this.UnassignedStallNumbers,
        buttontype: buttontype
      },

    };

    const dialogRef = this.dialog.open(GroupStallComponent, config,

    );
    dialogRef.afterClosed().subscribe(dialogResult => {

      const result: any = dialogResult;
      if (result && result.submitted == true) {
        this.groupStallAssignmentResponses = [];
        this.groupStallAssignmentResponses = result.data.groupAssignedStalls;
        this.UnassignedStallNumbers = result.data.unassignedStallNumbers;

        var horseStalltype = this.StallTypes.filter(x => x.CodeName == "HorseStall");
        var tackStalltype = this.StallTypes.filter(x => x.CodeName == "TackStall");
        if (this.groupStallAssignmentResponses != null && this.groupStallAssignmentResponses.length > 0) {
          this.horsestalllength = this.groupStallAssignmentResponses.filter(x => x.StallAssignmentTypeId
            == horseStalltype[0].GlobalCodeId).length;
          this.tackstalllength = this.groupStallAssignmentResponses.filter(x => x.StallAssignmentTypeId
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

  setAmount(val) {


    if (val <= 0) {
      this.groupInfo.AmountReceived = Number(0);
    }
    else if (val > 9999.99) {
      this.groupInfo.AmountReceived = Number(9999.99);
      this.snackBar.openSnackBar("Amount cannot be greater then 9999.99", 'Close', 'red-snackbar');
    }
    else {
      this.groupInfo.AmountReceived = Number(val);
    }

  }


  printGroupFinancials() {
    let printContents, popupWin, printbutton, hideRow, gridTableDesc;
    hideRow = document.getElementById('groupFinancialsentry').hidden = true;
    printbutton = document.getElementById('inputprintbutton').style.display = "none";
    gridTableDesc = document.getElementById('gridTableDescPrint').style.display = "block";

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
              margin-bottom:0 !important; 
              padding-bottom:0 !important; 
              width:100%;   
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
  .table.table-bordered.tableBodyScroll.removeSpaceTop {
    margin-bottom: 10px !important;
}
  table.pdfTable{
    margin-bottom: 20px !important;
    display:table;
    
  }
  .wideSpace td{
    border:none;
    width:33.33%;
    text-align:left;
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
  

  .print-element { display: block !important;}
  .non-print-element {display: none !important;}
   
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );

    hideRow = document.getElementById('groupFinancialsentry').hidden = false;
    printbutton = document.getElementById('inputprintbutton').style.display = "inline-block";
    gridTableDesc = document.getElementById('gridTableDescPrint').style.display = "none";
    popupWin.document.close();
  }



  printGroupExhibitor() {
    let printContents, popupWin, printbutton, hideRow, gridTableDesc;

    printbutton = document.getElementById('inputprintbutton').style.display = "none";
    gridTableDesc = document.getElementById('gridTableDescPrint').style.display = "block";
    printContents = document.getElementById('contentscroll2').innerHTML;
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
              margin-bottom:0 !important; 
              padding-bottom:0 !important; 
              width:100%;  
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
  table.table.table-bordered.tableBodyScroll.removeSpaceTop {
    margin-bottom: 10px !important;
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

 /* .pdfdataTable {
    position: absolute;
    top: 120px;
    width: 100%;
    left:0;
  }*/


  .print-element { display: block !important;}
  .non-print-element {display: none !important;}
   
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    printbutton = document.getElementById('inputprintbutton').style.display = "inline-block";
    gridTableDesc = document.getElementById('gridTableDescPrint').style.display = "none";
    popupWin.document.close();
  }





  getAllStates() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.groupService.getAllStates().subscribe(response => {
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
    this.groupInfo.City = null;

    this.groupInfo.ZipCode = null;
    this.zipCodesResponse = null;

    this.groupInfo.StateId = id;
    
    let state = this.statesResponse.filter(option =>
      option.StateId == id);
    if (state != null && state != undefined && state.length > 0) {
      this.selectedStateCode = state[0].Code;
    }


    return new Promise((resolve, reject) => {
      this.loading = true;
      this.citiesResponse = null;
      this.groupService.getCities(Number(id)).subscribe(response => {
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
    
    this.groupInfo.StateId = id;

  }



  getZipCodes(cityName, cityId) {

    this.groupInfo.ZipCode = null;
    this.zipCodesResponse = null;
    return new Promise((resolve, reject) => {

      this.groupInfo.City = cityId;
      this.loading = true;
      var ZipCodeRequest =
      {
        cityname: cityName,
        statecode: this.selectedStateCode
      }
      this.groupService.getZipCodes(ZipCodeRequest).subscribe(response => {
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
      this.groupInfo.ZipCode = null;
      this.zipCodesResponse = null;
      return new Promise((resolve, reject) => {

        this.groupInfo.City = cityId;
        this.loading = true;
        var ZipCodeRequest =
        {
          cityname: cityName,
          statecode: this.selectedStateCode
        }
        this.groupService.getZipCodes(ZipCodeRequest).subscribe(response => {
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
      this.groupInfo.StateId = null;
    }
    if (this.statesResponse != null && this.statesResponse != undefined && this.statesResponse.length > 0) {
      this.statefilteredOptions = this.statesResponse.filter(option =>
        option.Name.toLowerCase().includes(val.toLowerCase()));
    }
  }

  filterCities(val: string, makecitynull: boolean) {
    if (makecitynull == true) {
      this.groupInfo.City= null;
    }

    if (this.citiesResponse != null && this.citiesResponse != undefined && this.citiesResponse.length > 0) {
      this.cityfilteredOptions = this.citiesResponse.filter(option =>
        option.Name.toLowerCase().includes(val.toLowerCase()));
    }
  }



  getExhibitorGroupInformationReport() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.ExhibitorGroupInformationReportResponse = null;
      this.reportService.getExhibitorGroupInformationReport(Number(this.selectedGroupId)).subscribe(response => {
        if (response.Data != null && response.Data != undefined) {
          this.ExhibitorGroupInformationReportResponse = response.Data;
          this.saveExhibitorGroupInformationReportPDF();
        }
        else {
          this.snackBar.openSnackBar("No data available", 'Close', 'red-snackbar');
          this.loading = false;
        }
      }, error => {
        this.ExhibitorGroupInformationReportResponse = null;
        this.loading = false;
        this.snackBar.openSnackBar("Error!", 'Close', 'red-snackbar');
      })
      resolve();
    });
  }





  saveExhibitorGroupInformationReportPDF(): void {
    let y = 7;
    let doc = new jsPDF("p", "mm", "a4") as jsPDFWithPlugin;

    var img = new Image()
    img.src = 'assets/images/logo.png'
    doc.addImage(img, 'png', 10, y, 16, 20)

    doc.setFontSize(10);
    y = 10;


    doc.text(this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.Address != null
      && this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.Address != undefined
      ? this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.Address : "", 140, y);


    doc.text(this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.CityName != null
      && this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.CityName != undefined
      ? this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.CityName : "", 140, y + 5)


    doc.text(this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.StateZipcode != null
      && this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.StateZipcode != undefined
      ? this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.StateZipcode : "", 140, y + 10)


    doc.text(this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.Phone1 != null
      && this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.Phone1 != undefined
      ? this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.Phone1 : "", 140, y + 15);


    doc.text(this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.Email1 != null
      && this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.Email1 != undefined
      ? this.ExhibitorGroupInformationReportResponse.getAAYHSContactInfo.Email1 : "", 140, y + 20);


    doc.text('Print Date :', 140, y + 30);
    var newdate = new Date()
    doc.text(String(moment(new Date()).format('MM-DD-yyyy')), 160, y + 30);

    y = y + 5;

    doc.line(0, y + 30, 300, y + 30);

    doc.setLineWidth(5.0);


    doc.text(this.ExhibitorGroupInformationReportResponse.getGroupInfo.GroupName != null &&
      this.ExhibitorGroupInformationReportResponse.getGroupInfo.GroupName != undefined ?
      this.ExhibitorGroupInformationReportResponse.getGroupInfo.GroupName : ""
      , 10, y + 40);


    doc.text(this.ExhibitorGroupInformationReportResponse.getGroupInfo.Address != null &&
      this.ExhibitorGroupInformationReportResponse.getGroupInfo.Address != undefined ?
      this.ExhibitorGroupInformationReportResponse.getGroupInfo.Address : ""
      , 10, y + 45);

    let city = this.ExhibitorGroupInformationReportResponse.getGroupInfo.CityName != null &&
      this.ExhibitorGroupInformationReportResponse.getGroupInfo.CityName != undefined ?
      this.ExhibitorGroupInformationReportResponse.getGroupInfo.CityName : "";

    let state = this.ExhibitorGroupInformationReportResponse.getGroupInfo.StateZipcode != null &&
      this.ExhibitorGroupInformationReportResponse.getGroupInfo.StateZipcode != undefined ?
      this.ExhibitorGroupInformationReportResponse.getGroupInfo.StateZipcode : ""

    doc.text(city + ", " + state, 10, y + 50);

    doc.text(this.ExhibitorGroupInformationReportResponse.getGroupInfo.Phone != null &&
      this.ExhibitorGroupInformationReportResponse.getGroupInfo.Phone != undefined ?
      this.ExhibitorGroupInformationReportResponse.getGroupInfo.Phone : ""
      , 10, y + 55);

    doc.text(this.ExhibitorGroupInformationReportResponse.getGroupInfo.Email != null &&
      this.ExhibitorGroupInformationReportResponse.getGroupInfo.Email != undefined ?
      this.ExhibitorGroupInformationReportResponse.getGroupInfo.Email : ""
      , 10, y + 60);



    y = y + 6;


    doc.text('Stall Assignments', 10, y + 65);

    if (this.ExhibitorGroupInformationReportResponse.stallAndTackStallNumber.horseStalls.length > 0) {
      var horsestall = "";
      this.ExhibitorGroupInformationReportResponse.stallAndTackStallNumber.horseStalls.forEach(element => {
        horsestall = horsestall + ", " + element.HorseStallNumber
      });
      horsestall = horsestall.replace(/^,|,$/g, '');
      doc.text(horsestall, 50, y + 65);
    }

    doc.text('Tack Stall Assignments', 10, y + 70);
    if (this.ExhibitorGroupInformationReportResponse.stallAndTackStallNumber.tackStalls.length > 0) {
      var tackstall = "";
      this.ExhibitorGroupInformationReportResponse.stallAndTackStallNumber.tackStalls.forEach(element => {
        tackstall = tackstall + ", " + element.TackStallNumber
      });
      tackstall = tackstall.replace(/^,|,$/g, '');
      doc.text(tackstall, 50, y + 70);
    }




    let finalY = y + 80;

    doc.text('Fees:', 90, finalY);
    doc.text('Total Quantity:', 140, finalY);
    doc.text('Total Amount:', 170, finalY);

    finalY = finalY + 10;

    doc.text('Total Horse Stall:', 90, finalY);

    doc.text(this.ExhibitorGroupInformationReportResponse.financialsDetail.HorseStallQty != null &&
      this.ExhibitorGroupInformationReportResponse.financialsDetail.HorseStallQty != undefined ?
      String(this.ExhibitorGroupInformationReportResponse.financialsDetail.HorseStallQty) : ""
      , 150, finalY);


    doc.text(this.ExhibitorGroupInformationReportResponse.financialsDetail.HorseStallAmount != null &&
      this.ExhibitorGroupInformationReportResponse.financialsDetail.HorseStallAmount != undefined ?
      String(this.ExhibitorGroupInformationReportResponse.financialsDetail.HorseStallAmount) : ""
      , 180, finalY);

    finalY = finalY + 5;



    doc.text('Total Tack stall:', 90, finalY);
    doc.text(this.ExhibitorGroupInformationReportResponse.financialsDetail.TackStallQty != null &&
      this.ExhibitorGroupInformationReportResponse.financialsDetail.TackStallQty != undefined ?
      String(this.ExhibitorGroupInformationReportResponse.financialsDetail.TackStallQty) : ""
      , 150, finalY);
    doc.text(this.ExhibitorGroupInformationReportResponse.financialsDetail.TackStallAmount != null &&
      this.ExhibitorGroupInformationReportResponse.financialsDetail.TackStallAmount != undefined ?
      String(this.ExhibitorGroupInformationReportResponse.financialsDetail.TackStallAmount) : ""
      , 180, finalY);

    finalY = finalY + 5;

    doc.text('Overpayment Refund:', 90, finalY);
    doc.text(this.ExhibitorGroupInformationReportResponse.financialsDetail.Refund != null &&
      this.ExhibitorGroupInformationReportResponse.financialsDetail.Refund != undefined ?
      String(this.ExhibitorGroupInformationReportResponse.financialsDetail.Refund) : ""
      , 180, finalY);

    finalY = finalY + 10;



    doc.text('Total Amount:', 90, finalY);
    doc.text(this.ExhibitorGroupInformationReportResponse.financialsDetail.AmountDue != null &&
      this.ExhibitorGroupInformationReportResponse.financialsDetail.AmountDue != undefined ?
      String(this.ExhibitorGroupInformationReportResponse.financialsDetail.AmountDue) : ""
      , 180, finalY);

    finalY = finalY + 5;

    doc.text('Received Amount:', 90, finalY);
    doc.text(this.ExhibitorGroupInformationReportResponse.financialsDetail.ReceivedAmount != null &&
      this.ExhibitorGroupInformationReportResponse.financialsDetail.ReceivedAmount != undefined ?
      String(this.ExhibitorGroupInformationReportResponse.financialsDetail.ReceivedAmount) : ""
      , 180, finalY);


    finalY = finalY + 10;

    doc.text('Overpayment:', 90, finalY);
    doc.text(this.ExhibitorGroupInformationReportResponse.financialsDetail.Overpayment != null &&
      this.ExhibitorGroupInformationReportResponse.financialsDetail.Overpayment != undefined ?
      String(this.ExhibitorGroupInformationReportResponse.financialsDetail.Overpayment) : ""
      , 180, finalY);

    finalY = finalY + 5;

    doc.text('Balance Due:', 90, finalY);
    doc.text(this.ExhibitorGroupInformationReportResponse.financialsDetail.BalanceDue != null &&
      this.ExhibitorGroupInformationReportResponse.financialsDetail.BalanceDue != undefined ?
      String(this.ExhibitorGroupInformationReportResponse.financialsDetail.BalanceDue) : ""
      , 180, finalY);

    finalY = finalY + 10;


    doc.autoTable({
      body: this.ExhibitorGroupInformationReportResponse.exhibitorDetails,
      columns:
        [
          { header: 'Exhibitor Name', dataKey: 'ExhibitorName' }
        ],
      margin: { vertical: 35, horizontal: 10 },
      startY: finalY
    })

    if (this.reportType == "display") {
      window.open(doc.output('bloburl'), '_blank');
      this.loading = false;
    }

    if (this.reportType == "download") {
      doc.save('ExhibitorGroupInformationReportPDF.pdf');
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
    if (name == "GroupStatementReport") {
      this.getExhibitorGroupInformationReport();
    }

  }


  setreportType(type: string, name: string) {

    if (this.selectedGroupId == null || this.selectedGroupId == undefined || Number(this.selectedGroupId) <= 0) {
      this.snackBar.openSnackBar("Please select group!", 'Close', 'red-snackbar');
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



}


