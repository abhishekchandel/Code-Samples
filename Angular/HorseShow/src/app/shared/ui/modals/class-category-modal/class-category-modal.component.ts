import { Component, OnInit,Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirmation-modal/confirm-dialog.component';
import { MatSnackbarComponent } from '../../mat-snackbar/mat-snackbar.component';
import { YearlyMaintenanceService } from 'src/app/core/services/yearly-maintenance.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-class-category-modal',
  templateUrl: './class-category-modal.component.html',
  styleUrls: ['./class-category-modal.component.scss']
})
export class ClassCategoryModalComponent implements OnInit {
  @ViewChild('addClassCategoryForm') addClassCategoryForm: NgForm;

  name:null;
  result:string;
  loading = false;
  classCategoryList:any;
  yearlyMaintainenceId:any;

  constructor(public dialogRef: MatDialogRef<ClassCategoryModalComponent>,
     @Inject(MAT_DIALOG_DATA) public data: any,
    private yearlyService: YearlyMaintenanceService,
    private snackBar: MatSnackbarComponent,
    public dialog: MatDialog
    ) {
    
  }
    
  

  ngOnInit(): void {
    this.getClassCategory();
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

  addClassCategory(){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var categoryRequest={
        categoryName:this.name,
      }
      this.yearlyService.addClassCategory(categoryRequest).subscribe(response => {
        this.getClassCategory();
        this.addClassCategoryForm.resetForm({categoryName:null});
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
  
  confirmRemoveFee(id): void {
    const message = `Are you sure you want to remove the record?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.deleteCategory(id)
      }
    });

  }
  
  deleteCategory(id){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      this.yearlyService.deleteClassCategory(id).subscribe(response => {
        this.getClassCategory();
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

  getClassCategory(){
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.yearlyService.getClassCategory().subscribe(response => {
        this.classCategoryList = response.Data.getClassCategories;
        this.loading = false;
      }, error => {
        this.loading = false;
  
      }
      )
      resolve();
    });
  }
  
  confirmActiveInactiveClassCategory(id,e){
    e.preventDefault()
    const message = e.target.checked ? `Are you sure you want to active the class category?` : `Are you sure you want to inactive the class category?`;
    const dialogData = new ConfirmDialogModel("Confirm Action", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;
      if (this.result) {
        this.activeInactiveClassCategory(id,e);
      }   
    });
  }
  
  activeInactiveClassCategory(id,e){
    return new Promise((resolve, reject) => {   
      this.loading = true;
      var feeRequest={
        GlobalCodeId:id,
        IsActive:!e.target.checked
      }
      this.yearlyService.activeInActiveClassCategory(feeRequest).subscribe(response => {
        this.getClassCategory()
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
