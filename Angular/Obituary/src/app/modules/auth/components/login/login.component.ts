import { Component, OnInit } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginFormData: any = {
    userName: null,
  }
  loading: boolean;

  constructor(private router: Router,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackbarComponent) { }

  ngOnInit(): void {
  }

  login(form: NgForm) {
    if (form.valid) {
      this.loading = true;
      this.authService.login(this.loginFormData).subscribe(response => {
        this.localStorageService.storeAuthToken(response.Data.Token);
        this.localStorageService.storeUserCredentials(response.Data);
        this.router.navigateByUrl("/admin/admin-panel");
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
  isInvalidField(form: NgForm, inputControl: NgModel): boolean {
    return (form.submitted || inputControl.touched) && inputControl.invalid;
  }

}
