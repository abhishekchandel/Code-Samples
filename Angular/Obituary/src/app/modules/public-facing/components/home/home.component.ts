import { Component, OnInit } from '@angular/core';
import { PublicFacingService } from 'src/app/core/services/public-facing.service';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private publicFacingService: PublicFacingService,
    private router: Router,
  ) { }

  //for loading screen
  loading: boolean = false;

  //request model for searching
  searchRequest = {
    firstName: null,
    lastName: null,
    armedForces: false,
    city: null,
    state: null,
    zip: null,
    type: "Home",
    postedDate: new Date(),
    searchTerm: null,
    page: 0,
    limit: 0,
    orderBy: "CreationDate",
    orderByDescending: true,
    allRecords: true
  }

  ngOnInit(): void {
  }

  //for searching by first and last name
  searchByName() {
    if (this.searchRequest.firstName == null && this.searchRequest.lastName == null) {
      this.router.navigate(["/browse-obituaries"])
    }
    else {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          "firstName": this.searchRequest.firstName,
          "lastName": this.searchRequest.lastName,
          "nameSearch": true
        }
      };
      this.router.navigate(["/browse-obituaries"], navigationExtras)
    }
  }
  //for combined search with armed forces
  searchArmedForces() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "firstName": this.searchRequest.firstName,
        "lastName": this.searchRequest.lastName,
        "nameSearch": false
      }
    };
    this.router.navigate(["/browse-obituaries"], navigationExtras)
  }
}
