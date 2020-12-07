import { Component, OnInit } from '@angular/core';
import { PublicFacingService } from 'src/app/core/services/public-facing.service';
import { BaseUrl } from 'src/app/config/url-config';

@Component({
  selector: 'app-support-and-advice',
  templateUrl: './support-and-advice.component.html',
  styleUrls: ['./support-and-advice.component.scss']
})
export class SupportAndAdviceComponent implements OnInit {

  constructor(private publicFacingService: PublicFacingService) { }

  //for response variables and pagination 
  totalItems: number = 0;
  currentPage: number = 1;
  response: any;

   //for binding images with server url
  //  filesUrl = BaseUrl.filesUrl;
  filesUrl :any;

  loading: boolean = false;

  
  //request model for handling api calls
  request = {
    page: 1,
    limit: 10,
    orderBy: "CreationDate",
    orderByDescending: true,
    allRecords: false
  }

  ngOnInit(): void {
    this.getAllRecords();
    this.getDashboardUrl();
  }

  //get resource list based on page number
  getAllRecords() {
    this.loading = true;
    this.publicFacingService.getAllResources(this.request).subscribe(response => {
      this.response = response.Data.ResourceResponse;
      this.totalItems = response.Data.TotalRecords;
      this.loading = false;

    }, error => {
      this.loading = false;

    })
  }
  //handles page change in pagination
  getPage(page: number) {
    
    this.request.page = page;
    this.currentPage = page;
    this.getAllRecords();
  }

  getDashboardUrl(){
    this.publicFacingService.getDashboardUrl().subscribe(response => {
    this.filesUrl = response.Data.EveryobitDashboardUrl;
  }, error => {
  })

}
}
