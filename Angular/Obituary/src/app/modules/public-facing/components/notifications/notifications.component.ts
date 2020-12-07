import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { PublicFacingService } from 'src/app/core/services/public-facing.service';
import { AdminService } from 'src/app/core/services/admin.service';
import * as moment from 'moment';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  @ViewChild('notificationForm') notificationForm: NgForm;

  //for loading screen
  loading: boolean;
  errorIndex: boolean = false;
  statesResponse: any;
  citiesResponse: any;
  deathCitiesResponse: any;

  minDate = moment(new Date()).format('YYYY-MM-DD');
  notificationDate = moment(new Date()).add('30', 'days').format('YYYY-MM-DD')

  //request model for notifications page
  notificationFormData: any = {
    deceasedName: null,
    FromDeathDate: null,
    ToDeathDate: null,
    postingDate: null,
    notificationStartDate: new Date(),
    notificationEndDate: this.notificationDate,
    deathState: null,
    deathCity: null,
    name: null,
    email: null,
    armedForces: false,
  }

  constructor(
    private publicFacingService: PublicFacingService,
    private snackBar: MatSnackbarComponent,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.getAllStates();
  }
  //functions for binding state and cities dropdowns
  getAllStates() {
    this.loading = true;
    this.adminService.getAllStates().subscribe(response => {
      this.statesResponse = response.Data.State;
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  getLocationCities(id: number) {
    let getCitiesRequest = {
      StateId: Number(id)
    }
    this.adminService.getAllCities(Number(id)).subscribe(response => {
      this.citiesResponse = response.Data.City;
    }, error => {

    })
  }
  getDeathCities(id: number) {
    let getCitiesRequest = {
      StateId: Number(id)
    }
    this.adminService.getAllCities(Number(id)).subscribe(response => {
      this.deathCitiesResponse = response.Data.City;
    }, error => {

    })
  }
  //function for subscribing the user
  subscribe(form: NgForm) {
    
    if (this.notificationFormData.deceasedName == null && this.notificationFormData.FromDeathDate == null && this.notificationFormData.ToDeathDate == null && this.notificationFormData.postingDate == null && this.notificationFormData.birthCity == null && this.notificationFormData.birthState == null && this.notificationFormData.deathCity == null && this.notificationFormData.deathState == null) {
      this.snackBar.openSnackBar("Enter at least one value from Notification Information", 'Close', 'red-snackbar');
      return false;
    }
    if (form.valid) {
      this.loading = true;
      this.notificationFormData.deathCity = this.notificationFormData.deathCity == null ? null : Number(this.notificationFormData.deathCity);
      this.notificationFormData.deathState = this.notificationFormData.deathState == null ? null : Number(this.notificationFormData.deathState);
      this.publicFacingService.subscribe(this.notificationFormData).subscribe(response => {
        this.loading = false;
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.notificationForm.resetForm({ notificationStartDate: new Date(), notificationEndDate: this.notificationDate });
        this.resetForm();

      }, error => {
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
        this.loading = false;
      })
    }
    else {
      return;
    }
  }

  //function for resetting the form once submitted
  resetForm() {
    this.notificationFormData.name = null,
      this.notificationFormData.email = null,
      this.notificationFormData.armedForces = false

  }
  //for making error prompts for date fields
  checkEndDate() {
    if (this.notificationFormData.ToDeathDate < this.notificationFormData.FromDeathDate) {
      this.errorIndex = true;
    } else {
      this.errorIndex = false;
    }
  }
  //for validating the dates entered
  handleDateValidations() {

  }

}