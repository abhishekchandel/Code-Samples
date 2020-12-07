import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mat-snackbar',
  templateUrl: './mat-snackbar.component.html',
  styleUrls: ['./mat-snackbar.component.scss']
})
export class MatSnackbarComponent {

  constructor(public snackBar: MatSnackBar) { }

  // this function will open up snackbar on top right position with custom background color (defined in css)
  openSnackBar(message: string, action: string, className: string) {

    this.snackBar.open(message, action, {
      duration: 2500,
      verticalPosition: 'bottom',
      horizontalPosition: 'end',
      panelClass: [className],
    });
  }
}
