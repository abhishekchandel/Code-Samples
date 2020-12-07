import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  constructor(private router: Router,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackbarComponent) { }
  loading: boolean = false;
  forgotFormData = {
    email: null
  }
  ngOnInit(): void {
  }
  submit(form: NgForm) {
    if (form.valid) {
      this.loading = true;
      this.authService.sendResetEmail(this.forgotFormData).subscribe(response => {
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.loading = false;
      }, error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
        this.loading = false;
      })
    }
    else {
      return;
    }
  }
}
