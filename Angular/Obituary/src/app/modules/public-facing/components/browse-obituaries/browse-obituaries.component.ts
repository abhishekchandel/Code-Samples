import { Component, OnInit } from '@angular/core';
import { PublicFacingService } from 'src/app/core/services/public-facing.service';
import { NavigationExtras, ActivatedRoute, Router } from '@angular/router';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { BaseUrl } from 'src/app/config/url-config';

@Component({
  selector: 'app-browse-obituaries',
  templateUrl: './browse-obituaries.component.html',
  styleUrls: ['./browse-obituaries.component.scss']
})
export class BrowseObituariesComponent implements OnInit {

  //response and condition variables
  loading: boolean = false;
  detailedObit: boolean = false;
  nameSearch: any = false;
  advanceSearch: any = false;
  isBrowseObits: boolean = true;
  enablePagination: boolean = true;
  obituaryResponse: any;
  obitData: any;
  totalItems: any;

  currentPage: number = 1;


  //assets server url for binding images 
  assetsUrl = BaseUrl.assetsUrl;

  //request variables for search
  searchRequest = {
    firstName: "",
    lastName: "",
    armedForces: false,
    city: "",
    state: "",
    zip: "",
    type: "Home",
    postedDate: new Date(),
    searchTerm: "",
    page: 1,
    limit: 10,
    orderBy: "CreationDate",
    orderByDescending: true,
    allRecords: false
  }
  //request for advance search
  advanceSearchRequest = {
    firstName: null,
    lastName: null,
    armedForces: false,
    city: null,
    state: null,
    zip: "",
    type: "Advance",
    postedDate: null,
    searchTerm: "",
    page: 1,
    limit: 10,
    orderBy: "CreationDate",
    orderByDescending: true,
    allRecords: false
  }
  //request model for all records
  allRecordsRequest = {
    firstName: "",
    lastName: "",
    armedForces: false,
    city: "",
    state: "",
    zip: "",
    type: "Home",
    postedDate: new Date(),
    searchTerm: "",
    page: 1,
    limit: 10,
    orderBy: "CreationDate",
    orderByDescending: true,
    allRecords: false
  }

  constructor(private publicFacingService: PublicFacingService,
    private route: ActivatedRoute,
    private snackBar: MatSnackbarComponent,
    private router: Router) {

    //setting variables and conditions based on search type
    this.route.queryParams.subscribe(params => {
      this.nameSearch = params["nameSearch"];
      this.advanceSearch = params["advanceSearch"];
      if (this.nameSearch === "true") {
        this.searchRequest.firstName = params["firstName"];
        this.searchRequest.lastName = params["lastName"];
        this.isBrowseObits = false;
      }
      if (this.nameSearch === "false") {
        this.searchRequest.firstName = params["firstName"] == null ? "" : params["firstName"];
        this.searchRequest.lastName = params["lastName"] == null ? "" : params["lastName"];
        this.searchRequest.armedForces = true;
        this.isBrowseObits = false;
      }
      if (this.advanceSearch === "true") {
        this.advanceSearchRequest.firstName = params["firstName"] == null ? "" : params["firstName"];
        this.advanceSearchRequest.lastName = params["lastName"] == null ? "" : params["lastName"];
        this.advanceSearchRequest.state = params["state"] == null ? "" : params["state"];
        this.advanceSearchRequest.city = params["city"] == null ? "" : params["city"];
        this.advanceSearchRequest.armedForces = params["armedForces"] == "true" ? true : false;
        this.advanceSearchRequest.postedDate = params["postedDate"] == null ? null : params["postedDate"];
        this.isBrowseObits = false;
      }
    })
    //conditionally calling functions based on search type
    if (this.isBrowseObits === false && this.nameSearch === "true") {
      this.searchObits();
    }
    else if (this.isBrowseObits === false && this.nameSearch === "false") {
      this.searchObits();
    }
    else if (this.isBrowseObits === false && this.advanceSearch === "true") {
      this.advancedSearch();
    }
    else {
      return;
    }
  }

  ngOnInit(): void {
    if (this.isBrowseObits == true) {
      this.getAllObits();
    }
  }
  getAllObits() {
    this.loading = true;
    this.publicFacingService.searchObituaries(this.allRecordsRequest).subscribe(response => {
      this.obituaryResponse = response.Data.obituaryResponse;
      this.totalItems = response.Data.TotalRecords;
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }
  //for browse obits search bar
  searchBrowseObits() {
    this.loading = true;
    if (this.searchRequest.searchTerm == "") {
      this.searchRequest.type = "Home"
    }
    else {
      this.searchRequest.type = "";
    }
    this.publicFacingService.searchObituaries(this.searchRequest).subscribe(response => {
      this.obituaryResponse = response.Data.obituaryResponse;
      this.totalItems = response.Data.TotalRecords;
      this.loading = false;
    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;
    })
  }
  //for name,armed forces home page search
  searchObits() {
    this.loading = true
    this.publicFacingService.searchObituaries(this.searchRequest).subscribe(response => {
      this.obituaryResponse = response.Data.obituaryResponse;
      this.totalItems = response.Data.TotalRecords;
      this.loading = false;
    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.enablePagination = false;
      this.loading = false;

    })
  }
  //for advance page search
  advancedSearch() {
    this.loading = true
    this.publicFacingService.searchObituaries(this.advanceSearchRequest).subscribe(response => {
      this.obituaryResponse = response.Data.obituaryResponse;
      this.totalItems = response.Data.TotalRecords;
      this.loading = false;
    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.enablePagination = false;
      this.loading = false;

    })
  }

  //for browse-obit detail page
  getDetailedObit(object, index) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "obitId": object[index].ObituaryId,
      }
    };
    this.router.navigate(["/obituary-detail-page"], navigationExtras)

  }

  //page change function for pagination handle
  getPage(page: number) {
    this.allRecordsRequest.page = page;
    this.searchRequest.page = page;
    this.advanceSearchRequest.page = page;
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: "smooth" })
    if (this.isBrowseObits == true) {
      this.searchBrowseObits();
    }
    if (this.advanceSearch == "true") {
      this.advancedSearch();
    }
    if (this.nameSearch == "true") {
      this.searchObits();
    }

  }

}
