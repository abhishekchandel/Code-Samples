import { Component, OnInit, Inject } from '@angular/core';
import { StallService } from '../../../../core/services/stall.service';
import { MatDialogRef, MatDialogConfig, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackbarComponent } from '../../../../shared/ui/mat-snackbar/mat-snackbar.component';
import { GroupService } from 'src/app/core/services/group.service';

@Component({
  selector: 'app-stall-assignment',
  templateUrl: './stall-assignment.component.html',
  styleUrls: ['./stall-assignment.component.scss']
})
export class StallAssignmentComponent implements OnInit {
  loading = false;
  stallResponse: any
  allAssignedStalls: any = [];
  StallTypes: any = [];
  hoverStallId:any;
  hoverStallName:any;
  hoverBookedByType:any;
  hoverStallType:any;

  constructor(private groupService: GroupService,
     private stallService: StallService,
    private snackBar: MatSnackbarComponent,
   ) { }

  ngOnInit(): void {
    this.getAllStallTypes();
    this.getAllAssignedStalls();
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

  getAllAssignedStalls() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.allAssignedStalls = [];
      this.stallService.getAllAssignedStalls().subscribe(response => {
        if (response.Data != null && response.Data.TotalRecords > 0) {
          this.allAssignedStalls = response.Data.stallResponses;
        }
        if (this.allAssignedStalls != null && this.allAssignedStalls.length > 0) {
          this.allAssignedStalls.forEach(data => {
            var s_id = String('stall_' + data.StallId);
            var element = document.getElementById(s_id);
            if (element != null && element != undefined) {
                element.classList.add("bookedstall");
                element.addEventListener('mouseover', () => this.ShowStallDetail(data.StallId))
            }
          });
        }
        this.loading = false;
      }, error => {
        this.loading = false;
      })
      resolve();
    });
  }

  assignStall(stallId) {

  }
  
  changeTab() {
    if (this.allAssignedStalls != null && this.allAssignedStalls != undefined && this.allAssignedStalls.length > 0) {
      this.allAssignedStalls.forEach(data => {
        var s_id = String('stall_' + data.StallId);
        var element = document.getElementById(s_id);

        if (element != null && element != undefined) {
          element.classList.add("bookedstall");
          element.classList.remove("bookedgroupstall");
          element.classList.remove("clstackstall");
          element.classList.remove("unassignedgroupstall");
          element.addEventListener('mouseover', () => this.ShowStallDetail(data.StallId));
        }
      });
    }
  }

  ShowStallDetail(val) {
    debugger
    var checkInAllassigned = this.allAssignedStalls.filter((x) => { return x.StallId == val });
    
    if (checkInAllassigned != null && checkInAllassigned != undefined && checkInAllassigned.length > 0)
    {
      document.getElementById("hoverbox").style.display = "block";
      this.hoverStallId=checkInAllassigned[0].StallId;
      this.hoverStallName=checkInAllassigned[0].BookedByName;
      this.hoverBookedByType=checkInAllassigned[0].BookedByType;
      var type=this.StallTypes.filter((x) => { return x.GlobalCodeId == checkInAllassigned[0].StallAssignmentTypeId });
      this.hoverStallType=type[0].CodeName;

    }
    return false;
  }

  closehoverbox(){
    document.getElementById("hoverbox").style.display = "none";
  }

}
