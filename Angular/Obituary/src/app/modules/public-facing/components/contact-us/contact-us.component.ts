import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { PublicFacingService } from 'src/app/core/services/public-facing.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {
  @ViewChild('contactUsForm') contactUsForm: NgForm;

  loading: boolean;
  //request model
  contactFormData: any = {
    name: null,
    email: null,
    message: null,
    company: null,
    phone: null
  }

  constructor(
    private publicFacingService: PublicFacingService,
    private snackBar: MatSnackbarComponent
  ) { }

  ngOnInit(): void {
  }

  //function for saving contact details
  saveContact(form: NgForm) {
    
    if (form.valid) {
      this.loading = true;
      this.publicFacingService.contactUs(this.contactFormData).subscribe(response => {
        this.loading = false;
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.resetForm();
        this.contactUsForm.resetForm();

      }, error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
        this.loading = false;
      })
    }
    else {
      return;
    }
  }

  //resets form after submission
  resetForm() {
    this.contactFormData.name = null,
      this.contactFormData.email = null,
      this.contactFormData.message = null,
      this.contactFormData.company = null,
      this.contactFormData.phone = null
  }
}