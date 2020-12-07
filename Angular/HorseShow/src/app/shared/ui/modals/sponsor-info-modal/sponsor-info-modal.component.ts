import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackbarComponent } from '../../mat-snackbar/mat-snackbar.component'

@Component({
  selector: 'app-sponsor-info-modal',
  templateUrl: './sponsor-info-modal.component.html',
  styleUrls: ['./sponsor-info-modal.component.scss']
})
export class SponsorInfoModalComponent implements OnInit {
sponsorDetails:{
  sponsorName:null;
  contactName:null;
  phone:null;
  email:null;
  address:null;
  amount:null;
  state:null;
  city:null;
  zipcode:null;
  sponsorId:null;
  amountReceived:null;
  balance:null;
}
  constructor(public dialogRef: MatDialogRef<SponsorInfoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackbarComponent) { }

  ngOnInit(): void {
    this.sponsorDetails=this.data;
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

}
