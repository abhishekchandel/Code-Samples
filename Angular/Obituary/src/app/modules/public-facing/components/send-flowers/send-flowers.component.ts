import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { PublicFacingService } from 'src/app/core/services/public-facing.service';
import { BaseUrl } from 'src/app/config/url-config';

@Component({
  selector: 'app-send-flowers',
  templateUrl: './send-flowers.component.html',
  styleUrls: ['./send-flowers.component.scss']
})
export class SendFlowersComponent implements OnInit {

  loading: boolean = false;
  flowersList: any;
  totalItems: any;
  currentPage: number = 1;

  filteredFlowerSiteUrl: any;
  detailedResponse: any;
  affiliateId: any;

  flowersRequest = {
    count: 10,
    start: 1,
    category: "fbs"
  }

  constructor(private router: Router,
    private publicFacingService: PublicFacingService) { }

  ngOnInit(): void {
    this.getAllFlowers();
    this.getMasterSubaffiliateId();
  }
  getMasterSubaffiliateId() {
    this.publicFacingService.getMasterSubaffiliateId().subscribe(response => {
      this.affiliateId = response.Data.AffiliateId;
    }, error => {
    })
  }
  //for listing of records based on request params
  getAllFlowers() {
    this.loading = true;
    this.publicFacingService.getFlowersListing(this.flowersRequest).subscribe(response => {
      this.flowersList = response.Data.Products;
      this.totalItems = response.Data.TOTAL;
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }
  //for handling page change in pagination
  getPage(page: number) {
    window.scrollTo({ top: 0, behavior: "smooth" })
    this.flowersRequest.start = (5 * (page - 1)) + 1;
    this.currentPage = page;
    this.getAllFlowers();
  }
  getFreshScore(index: number) {

    switch (index) {
      case 0: this.flowersRequest.category = "fbs"; break;
      case 1: this.flowersRequest.category = "fa"; break;
      case 2: this.flowersRequest.category = "fb"; break;
      case 3: this.flowersRequest.category = "fs"; break;
      case 4: this.flowersRequest.category = "fp"; break;
      case 5: this.flowersRequest.category = "fl"; break;
      case 6: this.flowersRequest.category = "fw"; break;
      case 7: this.flowersRequest.category = "fh"; break;
      case 8: this.flowersRequest.category = "fx"; break;
      case 9: this.flowersRequest.category = "fc"; break;
      case 10: this.flowersRequest.category = "fu"; break;
    }
    this.flowersRequest.start = 1;
    this.getAllFlowers();
  }

  buyFlowers(flowersData) {
    
    let flowersCode = flowersData.Code;
    this.loading = false;
    this.publicFacingService.getMasterAccountDetails().subscribe(response => {
      this.detailedResponse = response.Data;
      var { Name, Address, City, State, Zipcode, Phone } = this.detailedResponse;
      const flowerSiteUrl = 'https://www.floristone.com/item.cfm';
      if (this.affiliateId == null || this.affiliateId == '') {
        this.affiliateId = 2020058329;
      }
      const completeFlowerSiteUrl = `${flowerSiteUrl}?code=${flowersCode}&source_id=aff&AffiliateID=${this.affiliateId}&name=${Name}&addr1=${Address}&city=${City}&state=${State}&zip=${Zipcode}&phone=${Phone}`;
      this.filteredFlowerSiteUrl = completeFlowerSiteUrl.replace(/\s+/g, '-').toLowerCase();
      window.open(this.filteredFlowerSiteUrl, '_blank');
    }, error => {
      this.loading = false;
    })
  }
}
