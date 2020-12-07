import { Component, OnInit, Inject } from '@angular/core';
import {YearlyMaintenanceService} from 'src/app/core/services/yearly-maintenance.service'
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-role-modal',
  templateUrl: './add-role-modal.component.html',
  styleUrls: ['./add-role-modal.component.scss']
})
export class AddRoleModalComponent implements OnInit {
userRole:number=null;
rolesResponse:any;
loading = false;
userId:number=null;

  constructor(
    public dialogRef: MatDialogRef<AddRoleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private yearlyService: YearlyMaintenanceService,
    private snackBar: MatSnackbarComponent,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.userId=this.data.UserId;
    this.rolesResponse=this.data.Roles
  }

  setRole(value){
    debugger;
  this.userRole=Number(value);
  }

  verifyUser(){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var verifyRequest={
        userId:this.userId,
        isApproved:true,
        roleId:this.userRole
      }
      this.yearlyService.verifyUser(verifyRequest).subscribe(response => {
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.loading = false;
        this.dialogRef.close(true);
      }, error => {
        this.snackBar.openSnackBar(error.error.Message, 'Close', 'red-snackbar');
      this.loading = false;
      }
      )
      resolve();
    });
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }
}
