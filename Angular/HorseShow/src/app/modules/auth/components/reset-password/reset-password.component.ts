import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NgForm } from '@angular/forms';
import { MatSnackbarComponent } from '../../../../shared/ui/mat-snackbar/mat-snackbar.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  email: string;
  token: string;
  disable: boolean = false;

  resetPasswordData = {
    token: null,
    email: null,
    newPassword: null,
    password: null
  }

  constructor(private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackbarComponent) { }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams.email
    this.token = this.route.snapshot.queryParams.token
    let query = {
      email: this.email,
      token: this.token
    }
    this.authService.verifyEmailToken(query).subscribe(
      response => {
      },
      error => {
        this.router.navigateByUrl("/error");
      })
  }

  submit(form: NgForm) {
    if (form.valid) {
      this.disable = true;
      this.resetPasswordData.email = this.email;
      this.resetPasswordData.token = this.token;
      this.authService.resetPassword(this.resetPasswordData).subscribe(response => {
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.disable = false;
        this.router.navigateByUrl("/login");
      }, error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
        this.disable = false;
      })
    }
    else {
      return;
    }
  }

}
