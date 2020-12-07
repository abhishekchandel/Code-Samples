import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialogConfig, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackbarComponent } from '../../../../shared/ui/mat-snackbar/mat-snackbar.component';

@Component({
  selector: 'app-assign-stall-modal',
  templateUrl: './assign-stall-modal.component.html',
  styleUrls: ['./assign-stall-modal.component.scss']
})
export class AssignStallModalComponent implements OnInit {
  showAssign: boolean;
  showMove: boolean = false;
  assignmentType: ""
  dataToReturn: any;
  stallTypes: any;
  StallAssignmentTypeId: number;
  StallAssignmentDate: Date = new Date();
  StallMovedTo: number = null;
  StallNumber: number;
  AssignedToName: string;
  DisableHorseType: boolean = false;
  buttontype: string;



  constructor(
    private snackBar: MatSnackbarComponent,
    public dialogRef: MatDialogRef<AssignStallModalComponent>,
    public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.StallNumber = this.data.modalData.SelectedStallId;
    this.AssignedToName = this.data.modalData.BookedByName;
    this.showAssign = this.data.modalData.Assigned;
   
    if (this.data.modalData.StallAssignmentDate != null && this.data.modalData.StallAssignmentDate != undefined) {
      this.StallAssignmentDate = this.data.modalData.StallAssignmentDate;
    }

    this.stallTypes = this.data.StallTypes;
    this.buttontype = this.data.buttontype;
    if (this.StallNumber == 2051 || this.StallNumber == 2045 || this.StallNumber == 2132 || this.StallNumber == 2138) {
      var tackstalltype = this.stallTypes.filter(x => x.CodeName == "TackStall");
      this.setStallType(tackstalltype[0].GlobalCodeId);
      this.DisableHorseType = true;
    }
    else {
      this.DisableHorseType = false;
      if (this.data.modalData.StallAssignmentTypeId > 0) {
        this.setStallType(this.data.modalData.StallAssignmentTypeId);
      }
      else {
        debugger
        if (this.buttontype == 'horse') {
          var horsestalltype = this.stallTypes.filter(x => x.CodeName == "HorseStall");
          this.setStallType(horsestalltype[0].GlobalCodeId);
        } else {
          var tackstalltype = this.stallTypes.filter(x => x.CodeName == "TackStall");
          this.setStallType(tackstalltype[0].GlobalCodeId);
        }
      }
    }


  }

  assignStall() {

    this.dataToReturn = {
      SelectedStallId: this.data.modalData.SelectedStallId,
      Status: "Assign",
      StallAssignmentId: this.data.modalData.StallAssignmentId,
      StallAssignmentTypeId: this.StallAssignmentTypeId,
      StallAssignmentDate: this.StallAssignmentDate,
      StallMovedTo: 0,
    }
    this.dialogRef.close({
      submitted: true,
      data: this.dataToReturn
    });
  }


  unAssignStall() {

    this.dataToReturn = {
      SelectedStallId: this.data.modalData.SelectedStallId,
      Status: "Unassign",
      StallAssignmentId: this.data.modalData.StallAssignmentId,
      StallAssignmentTypeId: this.StallAssignmentTypeId,
      StallAssignmentDate: this.StallAssignmentDate,
      StallMovedTo: 0,
    }
    this.dialogRef.close({
      submitted: true,
      data: this.dataToReturn
    });
  }


  moveStall() {
    if (this.StallMovedTo == null || this.StallMovedTo == undefined) {
      var error = "Stall number is required field";
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      return
    }
    if (this.StallMovedTo <= 0 || (this.StallMovedTo > 1001 && this.StallMovedTo < 2027) || this.StallMovedTo > 2195) {
      var error = "Invalid Stall number";
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      return
    }

    else {
      var horsestalltype = this.stallTypes.filter(x => x.CodeName == "HorseStall");

      if ((this.StallMovedTo == 2051 || this.StallMovedTo == 2045 ||
        this.StallMovedTo == 2132 || this.StallMovedTo == 2138)
        && (horsestalltype[0].GlobalCodeId == this.StallAssignmentTypeId)) {

        var tackstalltype = this.stallTypes.filter(x => x.CodeName == "TackStall");
        this.StallAssignmentTypeId = Number(tackstalltype[0].GlobalCodeId);

      }


      this.dataToReturn = {
        SelectedStallId: this.data.modalData.SelectedStallId,
        Status: "Move",
        StallAssignmentId: this.data.modalData.StallAssignmentId,
        StallAssignmentTypeId: this.StallAssignmentTypeId,
        StallAssignmentDate: this.StallAssignmentDate,
        StallMovedTo: this.StallMovedTo,
      }
      this.dialogRef.close({
        submitted: true,
        data: this.dataToReturn
      });
    }
  }


  toggleMove(check: boolean) {
    this.showMove = check;
  }

  onDismiss(): void {
    this.dialogRef.close({
      submitted: false,
      data: null
    });
  }

  setStallType(id) {

    var horsestalltype = this.stallTypes.filter(x => x.CodeName == "HorseStall");

    if ((this.StallNumber == 2051 || this.StallNumber == 2045 ||
      this.StallNumber == 2132 || this.StallNumber == 2138) && (horsestalltype[0].GlobalCodeId == Number(id)) && this.showMove == false) {
      var tackstalltype = this.stallTypes.filter(x => x.CodeName == "TackStall");

      this.StallAssignmentTypeId = Number(tackstalltype[0].GlobalCodeId);


      var error = "This stall cannot be assigned as horse stall";
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
    }
    else {
      this.StallAssignmentTypeId = Number(id);
    }
  }

  setMoveToStall(id) {

    this.StallMovedTo = Number(id);
  }

  setStallDate(date: Date) {

    this.StallAssignmentDate = date;
  }
}
