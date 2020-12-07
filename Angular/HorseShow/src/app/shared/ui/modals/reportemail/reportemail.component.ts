import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackbarComponent } from '../../../../shared/ui/mat-snackbar/mat-snackbar.component';

@Component({
  selector: 'app-reportemail',
  templateUrl: './reportemail.component.html',
  styleUrls: ['./reportemail.component.scss']
})
export class ReportemailComponent implements OnInit {

  reportsemailid=null;



  constructor(private snackBar: MatSnackbarComponent,
    public dialogRef: MatDialogRef<ReportemailComponent>,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.reportsemailid = null;
  }




  onDismiss(): void {
    this.dialogRef.close({
      submitted: false,
      data: ""
    });
  }


  submit() {
    if(this.reportsemailid==null || this.reportsemailid==undefined || this.reportsemailid=="")
    {
      this.snackBar.openSnackBar("Please enter email id", 'Close', 'red-snackbar');
      return;
    }
    this.dialogRef.close({
      submitted: true,
      data: String(this.reportsemailid)
    });
  }

  setreportemail(val: string) {
    this.reportsemailid =String(val);
  }


}
