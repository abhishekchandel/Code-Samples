import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackbarComponent } from '../../../../shared/ui/mat-snackbar/mat-snackbar.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  constructor(private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackbarComponent) { }

    disable: boolean = false;
    forgotFormData = {
      email: null
    }
  ngOnInit(): void {
  }

  submit(form: NgForm) {
    if (form.valid) {
      this.disable = true;
      this.authService.sendResetEmail(this.forgotFormData).subscribe(response => {
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.disable = false;
        this.router.navigateByUrl("/login");
      }, error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
        this.disable = false;
      })
    }
  
  }

}
