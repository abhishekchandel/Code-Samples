import { Component, OnInit } from '@angular/core';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { PublicFacingService } from 'src/app/core/services/public-facing.service';

@Component({
  selector: 'app-funeral-homes',
  templateUrl: './funeral-homes.component.html',
  styleUrls: ['./funeral-homes.component.scss']
})
export class FuneralHomesComponent implements OnInit {

  constructor(private snackBar: MatSnackbarComponent,
    private publicFacingService: PublicFacingService) { }

  //variables for response handing and conditions variables
  funeralHomes: any;
  totalItems: any;
  loading: boolean = false;
  isSearched: boolean = false;

  currentPage: number = 1;

  //request model for search
  searchRequest = {
    searchTerm: "",
    page: 1,
    limit: 10,
    orderBy: "CreationDate",
    orderByDescending: true,
    allRecords: false
  }

  ngOnInit(): void {
    this.getAllRecords();
  }

  //for listing of funeral homes
  getAllRecords() {
    this.loading = true
    this.publicFacingService.getAllFuneralHomes(this.searchRequest).subscribe(response => {
      this.funeralHomes = response.Data.accountResponse;
      this.totalItems = response.Data.TotalRecords;
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }
  //for search through search bar
  searchFuneralAccounts() {
    this.loading = true;
    this.isSearched = true;
    this.publicFacingService.getAllFuneralHomes(this.searchRequest).subscribe(response => {
      this.funeralHomes = response.Data.accountResponse;
      this.totalItems = response.Data.TotalRecords;
      this.loading = false;
    }, error => {
      this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      this.loading = false;
    })
  }
  //for handling page change in pagination
  getPage(page: number) {
    
    this.searchRequest.page = page;
    this.currentPage = page;
    this.getAllRecords();
  }
}
