import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin.service';
import { PublicFacingService } from 'src/app/core/services/public-facing.service';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { NavigationExtras, Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-advance-search',
  templateUrl: './advance-search.component.html',
  styleUrls: ['./advance-search.component.scss']
})
export class AdvanceSearchComponent implements OnInit {

  //variable for storing responses and handling conditions
  loading: boolean = false;
  statesResponse: any;
  citiesResponse: any;
  obituaryResponse: any;

  //request model for search
  searchRequest = {
    firstName: null,
    lastName: null,
    armedForces: false,
    city: null,
    state: null,
    zip: null,
    type: "Advance",
    postedDate: null,
    searchTerm: null,
  }
  constructor(private adminService: AdminService,
    private publicFacingService: PublicFacingService,
    private snackBar: MatSnackbarComponent,
    private router: Router) { }

  ngOnInit(): void {
    this.getAllStates();
  }
  //for binding dropdowns of states and cities global codes
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
  //for getting state and city names
  getStateName(e) {
    this.searchRequest.state = e.target.options[e.target.selectedIndex].text
    this.searchRequest.state = this.searchRequest.state.substr(0, this.searchRequest.state.indexOf('-'));
    this.searchRequest.state = this.searchRequest.state.replace(/\s/g, "");
  }
  getCityName(cityName) {
    this.searchRequest.city = cityName;
  }
  //Evaluation of posted date based on dropdown value chosen
  selectPostedDate(value) {
    this.searchRequest.postedDate = moment(new Date()).format('YYYY-MM-DD');
    switch (value) {
      case '0': this.searchRequest.postedDate = null; break;
      case '10': this.searchRequest.postedDate = moment(this.searchRequest.postedDate).subtract(10, 'days').format('YYYY-MM-DD'); break;
      case '30': this.searchRequest.postedDate = moment(this.searchRequest.postedDate).subtract(30, 'days').format('YYYY-MM-DD'); break;
      case '5': this.searchRequest.postedDate = moment(this.searchRequest.postedDate).subtract(5, 'days').format('YYYY-MM-DD'); break;
      case '1': this.searchRequest.postedDate = moment(this.searchRequest.postedDate).subtract(1, 'days').format('YYYY-MM-DD'); break;
    }

  }
  //this will bind the values chosen and send to another route
  advanceSearch() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "firstName": this.searchRequest.firstName,
        "lastName": this.searchRequest.lastName,
        "city": this.searchRequest.city,
        "state": this.searchRequest.state,
        "postedDate": this.searchRequest.postedDate == null ? this.searchRequest.postedDate = null : this.searchRequest.postedDate,
        "advanceSearch": true
      }
    };
    this.router.navigate(["/browse-obituaries"], navigationExtras)
  }
  //combined request for armed forces obit
  selectArmedForces() {
    this.searchRequest.armedForces = true;
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "firstName": this.searchRequest.firstName,
        "lastName": this.searchRequest.lastName,
        "city": this.searchRequest.city,
        "state": this.searchRequest.state,
        "postedDate": this.searchRequest.postedDate == null ? this.searchRequest.postedDate = null : this.searchRequest.postedDate,
        "armedForces": this.searchRequest.armedForces,
        "advanceSearch": true
      }
    };
    this.router.navigate(["/browse-obituaries"], navigationExtras)
  }
}
