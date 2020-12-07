import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackbarComponent } from '../../../../shared/ui/mat-snackbar/mat-snackbar.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(private authService: AuthService,
    private router: Router,private snackBar: MatSnackbarComponent) { }
  register :any={
    firstName:null,
      lastname:null,
      email:null,
      password:null,
      userName:null
  }
  disable: boolean;

  ngOnInit(): void {
  }
  submit(form: NgForm){
      if (form.valid) {
        this.disable = true;
        this.authService.register(this.register).subscribe(response => {
          this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
          this.router.navigateByUrl("/login");
          this.disable = false;
        }, error => {
          debugger;
          this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
          this.disable = false;
        })
      }
      
    
  }
}
