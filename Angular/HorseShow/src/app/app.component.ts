import { Component } from '@angular/core';
import { BnNgIdleService } from 'bn-ng-idle';
import { MatSnackbarComponent } from './shared/ui/mat-snackbar/mat-snackbar.component';
import { LocalStorageService } from './core/services/local-storage.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'aayhs';

  constructor(private bnIdle: BnNgIdleService,
    private snackBar: MatSnackbarComponent,
    private localStorageService: LocalStorageService,
    public dialog: MatDialog) {
  }
  
   // initiate it in your component OnInit
   ngOnInit(): void {
    //this will end the session after 900 secs of idle system
    this.bnIdle.startWatching(1800).subscribe((isTimedOut: boolean) => {
      if (isTimedOut) {
        this.snackBar.openSnackBar("Your Session Has Expired", 'Close', 'red-snackbar');
        this.localStorageService.logout();
      }
    });
  }

}
