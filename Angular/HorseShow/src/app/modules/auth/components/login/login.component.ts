import { Component, OnInit } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { MatSnackbarComponent } from '../../../../shared/ui/mat-snackbar/mat-snackbar.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LocalStorageService } from '../../../../core/services/local-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  disable: boolean;
  loginData: any = {
    userName: null,
    password:null
  }
  constructor(private router: Router,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackbarComponent) { }

  ngOnInit(): void {
  }

  login(form: NgForm) {
    if (form.valid) {
      this.disable = true;
      this.authService.login(this.loginData).subscribe(response => {
        this.localStorageService.storeAuthToken(response.Data.Token);
        this.localStorageService.storeUserCredentials(response.Data);
        this.router.navigateByUrl("/perspective/exhibitor");
        this.disable = false;
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
