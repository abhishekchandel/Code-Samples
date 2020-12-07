import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackbarComponent } from '../../mat-snackbar/mat-snackbar.component'

@Component({
  selector: 'app-add-split-class-modal',
  templateUrl: './add-split-class-modal.component.html',
  styleUrls: ['./add-split-class-modal.component.scss']
})
export class AddSplitClassModalComponent implements OnInit {

  className: string;
  classNumber:string;
  championshipIndicator:boolean=false
  splitNumber:number=2;
  entriesArray: any[] = [{
  Entries: null,
  }, {
    Entries: null,
  }];

  constructor(public dialogRef: MatDialogRef<AddSplitClassModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddSplitClassModel,
    private snackBar: MatSnackbarComponent) {
    
  }
  ngOnInit(): void {
    this.splitNumber = this.data.splitNumber > 0 ? this.data.splitNumber : 2;
    this.className=this.data.className;
    this.classNumber=this.data.classNumber;
    this.championshipIndicator=this.data.championshipIndicator
    if(this.data.entries && this.data.entries.length > 0) this.entriesArray = this.data.entries;
  }

  onSubmit(): void {
    debugger;
    const filledEntries = this.entriesArray.filter((x) => x.Entries);
    if (filledEntries.length == 0) {
      // TODO : Call SnackBar
      this.snackBar.openSnackBar('Please fill the enteries', 'Close', 'red-snackbar');
      return;
    }
debugger;
    // Close the dialog, return true
    this.dialogRef.close({
      submitted: true,
      data: {
        className: this.className,
        entries: filledEntries,
        splitNumber:this.splitNumber,
        championshipIndicator:this.championshipIndicator
      }
    });
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

  entryChanged(event, index) {
    const entryValue = event.target.value;
    this.entriesArray[index].Entries = Number(entryValue);
  }

  addEntry() {
    this.entriesArray.push({ Entries: null });
    this.splitNumber=++this.splitNumber 
  }

  removeEntry(index) {
    this.entriesArray.splice(index, 1);
    this.splitNumber=--this.splitNumber 
  }
  onCheckChange(value:boolean){
    this.championshipIndicator=value
  }

  clear(){
    this.splitNumber=0
  }
}


export interface AddSplitClassModel {
  splitNumber: number;
  entries: any[];
  className:string,
  classNumber:string,
  championshipIndicator:boolean
}