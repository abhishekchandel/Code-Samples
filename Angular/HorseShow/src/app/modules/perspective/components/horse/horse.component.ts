import { Component, OnInit,ViewChild } from '@angular/core';
import { MatSnackbarComponent } from '../../../../shared/ui/mat-snackbar/mat-snackbar.component'
import {HorseService } from '../../../../core/services/horse.service';
import { BaseRecordFilterRequest } from '../../../../core/models/base-record-filter-request-model'
import {  HorseInfoModel } from '../../../../core/models/horse-model'
import { MatTabGroup } from '@angular/material/tabs'
import { NgForm } from '@angular/forms';
import { ConfirmDialogComponent, ConfirmDialogModel } from'../../../../shared/ui/modals/confirmation-modal/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {GlobalService} from '../../../../core/services/global.service'
import { MatPaginator } from '@angular/material/paginator';


@Component({
  selector: 'app-horse',
  templateUrl: './horse.component.html',
  styleUrls: ['./horse.component.scss']
})
export class HorseComponent implements OnInit {
  
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  @ViewChild('horseInfoForm') horseInfoForm: NgForm;
  @ViewChild('paginator') paginator: MatPaginator;

  sortColumn:string="";
  reverseSort : boolean = false;
  loading = false;
  totalItems: number = 0;
  horsesList: any;
  linkedExhibitors: any;
  selectedRowIndex: any;
  result: string = '';
  groups:any;
  horseType:any;
  jumpHeight:any;
  searchTerm:any;

  horseInfo:HorseInfoModel={
    Name:null,
    HorseTypeId:null,
    HorseId:null,
    NSBAIndicator:false,
    GroupId:null,
    JumpHeightId:null
  }
  exhibitorRequest = {
    HorseId: 0,
    Page: 1,
    Limit: 5,
    OrderBy: 'ExhibitorId',
    OrderByDescending: true,
    AllRecords: true
  }
  baseRequest: BaseRecordFilterRequest = {
    Page: 1,
    Limit: 5,
    OrderBy: 'HorseId',
    OrderByDescending: true,
    AllRecords: false,
    SearchTerm:null

  };


  constructor(private snackBar: MatSnackbarComponent,
              private horseService: HorseService,
              public dialog: MatDialog,
              private data: GlobalService) { }

  ngOnInit(): void {
    this.data.searchTerm.subscribe((searchTerm: string) => {
      this.baseRequest.SearchTerm = searchTerm;
      this.baseRequest.Page = 1;
      this.getAllHorses();
    });
    this.getAllGroups();
    this.getHorseType();
    this.getJumpHeight();
  }

  sortData(column){
    this.reverseSort=(this.sortColumn===column)?!this.reverseSort:false
    this.sortColumn=column
    this.baseRequest.OrderBy = column;
    this.baseRequest.OrderByDescending = this.reverseSort;
    this.resetForm();
    this.getAllHorses()
  }
  
  getSort(column){
    if(this.sortColumn===column)
    {
    return this.reverseSort ? 'arrow-down'
    : 'arrow-up';
    }
  }

  addHorse= () => {
    this.loading = true;
    this.horseInfo.HorseId=this.horseInfo.HorseId !=null ? Number(this.horseInfo.HorseId) :0
    this.horseInfo.HorseTypeId=this.horseInfo.HorseTypeId !=null ? Number(this.horseInfo.HorseTypeId) :0
    this.horseInfo.GroupId=this.horseInfo.GroupId !=null ? Number(this.horseInfo.GroupId) :0
    this.horseInfo.JumpHeightId=this.horseInfo.JumpHeightId !=null ? Number(this.horseInfo.JumpHeightId) :0
    this.horseInfo.NSBAIndicator=this.horseInfo.NSBAIndicator !=null ? this.horseInfo.NSBAIndicator :false

    this.horseService.createUpdateHorse(this.horseInfo).subscribe(response => {
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
      this.loading = false;

      this.getAllHorses().then(res =>{ 
        if(response.NewId !=null && response.NewId>0)
        {
          if(this.horseInfo.HorseId>0)
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

    })
  }

  getAllHorses() {
    return new Promise((resolve, reject) => {
    this.loading = true;
    this.horseService.getAllHorses(this.baseRequest).subscribe(response => {
      this.horsesList = response.Data.horsesResponse;
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

  getNext(event) {
    this.resetForm()
    this.baseRequest.Page = (event.pageIndex) + 1;
    this.getAllHorses()
  }

  getLinkedExhibitors(id: number) {
    this.loading = true;
    this.exhibitorRequest.HorseId = id;
    this.horseService.getLinkedExhibitors(this.exhibitorRequest).subscribe(response => {
      this.linkedExhibitors = response.Data.getLinkedExhibitors;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.linkedExhibitors = null
    })
  }

  resetForm() {
    this.horseInfo.Name = null;
    this.horseInfo.HorseId = null;
    this.horseInfo.GroupId = null;
    this.horseInfo.JumpHeightId= null;
    this.horseInfo.NSBAIndicator=false;
    this.linkedExhibitors = null;
     this.horseInfoForm.resetForm({ horseTypeId:2002});
    // this.tabGroup.selectedIndex = 0;
    this.selectedRowIndex = null;
    this.linkedExhibitors = null;
    this.horseInfo.HorseTypeId = 2002;

  }

  highlight(id, i) {
    this.resetForm()
    this.selectedRowIndex = i;
    this.getHorseDetails(id);
    this.getLinkedExhibitors(id);  
  }

  confirmRemoveHorse(e, index, data): void {
    e.stopPropagation();
    const message = `Are you sure you want to remove the horse?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteHorse(data, index)
      }
    });

  }

  deleteHorse(id, index) {
    this.loading = true;
    this.horseService.deleteHorse(id).subscribe(response => {
      this.loading = false;
      this.getAllHorses()
      this.resetForm();
      this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
    }, error => {
      this.snackBar.openSnackBar(error.error.Message, 'Close', 'red-snackbar');
      this.loading = false;

    })
  }

  getAllGroups(){
    this.loading = true;
    this.horseService.getGroups().subscribe(response => {
      this.groups = response.Data.getGroups;
      this.loading = false;
    }, error => {
      this.loading = false;
      this.groups =null;
    })
  }

getHorseDetails(id:number){
  this.loading = true;
  this.horseService.getHorseDetails(id).subscribe(response => {
    this.horseInfo = response.Data;
    this.horseInfo.GroupId=this.horseInfo.GroupId >0 ? Number(this.horseInfo.GroupId) :null
    this.horseInfo.JumpHeightId=this.horseInfo.JumpHeightId >0 ? Number(this.horseInfo.JumpHeightId) :null
    this.loading = false;
  }, error => {
    this.loading = false;
    this.horseInfo = null;
  }
  )
}

getHorseType(){
  this.loading = true;
  this.horseService.getHorseType("HorseType").subscribe(response => {
    this.horseType = response.Data.globalCodeResponse;
    this.horseInfo.HorseTypeId=this.horseType.find(i =>i.CodeName=="Horse").GlobalCodeId;
    this.loading = false;
  }, error => {
    this.loading = false;
    this.groups =null;
  })
}

getJumpHeight(){
  this.loading = true;
  this.horseService.getJumpHeight("JumpHeightType").subscribe(response => {
    this.jumpHeight = response.Data.globalCodeResponse;
    this.loading = false;
  }, error => {
    this.loading = false;
    this.groups =null;
  })
}

print() {
  let printContents, popupWin, gridTableDesc,printbutton;
  gridTableDesc=document.getElementById('gridTableDescPrint').style.display = "block";
  printbutton = document.getElementById('inputprintbutton').style.display = "none";
  printContents = document.getElementById('print-linkedExhibitors').innerHTML;
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
        .dataDesc.gridTable {
          background-color: transparent !important;
      }
      .dataDesc.gridTable:before {
        display:none !important; 
      }
      #gridTableDescPrint tbody tr td {
        display: block !important;
        background-color: transparent !important;
        border:none;
        padding:5px 0px;  
        text-align:left;
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
/*.pdfdataTable {
  position: absolute;
  top: 90px;
  width: 100%;
  left:0;
}
.table.pdfTable {
  margin-left: -5px !important;
}*/

table.pdfTable,table.pdfTable tbody,table.pdfTable tr {
  width:100%;
  display:table;
}
table.pdfTable tbody tr td{
    background-color: #a0b8f9;
    margin: 20px 0;
    padding: 5px 0px !important;
    position: relative; 
    width:33.333%;
    display:table-cell;
    
}
.print-element { display: block !important;}
.non-print-element {display: none !important;}
 
        </style>
      </head>
  <body onload="window.print();window.close()">${printContents}</body>
    </html>`
  );
  gridTableDesc=document.getElementById('gridTableDescPrint').style.display = "none";
  printbutton = document.getElementById('inputprintbutton').style.display = "inline-block";
  popupWin.document.close();
}

}