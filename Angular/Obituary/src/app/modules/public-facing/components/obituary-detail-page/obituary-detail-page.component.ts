import { Component, OnInit, Input } from '@angular/core';
import { BaseUrl } from 'src/app/config/url-config';
import { ActivatedRoute } from '@angular/router';
import { PublicFacingService } from 'src/app/core/services/public-facing.service';
import { ShareService } from 'src/app/core/services/share.service';

@Component({
  selector: 'app-obituary-detail-page',
  templateUrl: './obituary-detail-page.component.html',
  styleUrls: ['./obituary-detail-page.component.scss']
})
export class ObituaryDetailPageComponent implements OnInit {

  //for binding images with server url
  assetsUrl = BaseUrl.assetsUrl;
  // logoUrl = BaseUrl.filesUrl;

  loading: boolean = false;
  detailedResponse: any = [];

  filteredFlowerSiteUrl: any;
  affiliateId: any;
  logoUrl: any;

  //for handling api call
  requestModel = {
    obituaryId: 0
  }

  constructor(private route: ActivatedRoute,
    private publicFacingService: PublicFacingService,
    private shareService: ShareService) {
  }

  ngOnInit(): void {
    //for getting details based on obit id
    this.route.queryParams.subscribe(params => {
      this.requestModel.obituaryId = params["obitId"];
    })
    this.requestModel.obituaryId = Number(this.requestModel.obituaryId);
    this.getObitDetails();
    this.getMasterSubaffiliateId();
    this.getDashboardUrl();
  }
  //api for getting the account sub aff id
  getMasterSubaffiliateId() {
    this.publicFacingService.getMasterSubaffiliateId().subscribe(response => {
      this.affiliateId = response.Data.AffiliateId;
    }, error => {

    })
  }
  //api for getting dashboard url used for logos of accounts
  getDashboardUrl() {
    this.publicFacingService.getServerUrl().subscribe(response => {
      this.logoUrl = response.Data.EveryobitDashboardUrl;
    }, error => {

    })
  }
  //for api call for detail of obituary
  getObitDetails() {
    this.loading = true
    this.publicFacingService.getObituaryById(this.requestModel).subscribe(response => {
      this.detailedResponse = response.Data;
      var { AccountName, AccountAddress, AccountCity, AccountState, AccountZip, AccountPhone, AccountEmail, AffiliateId } = this.detailedResponse;
      this.loading = false;
      if (AffiliateId == null) {
        AffiliateId = this.affiliateId;
      }
      if (this.affiliateId == '' || this.affiliateId == null) {
        AffiliateId = 2020058329
      }
      const flowerSiteUrl = 'https://www.floristone.com/fhda.cfm';
      const completeFlowerSiteUrl = `${flowerSiteUrl}?code=C15-4790&source_id=aff&AffiliateID=${AffiliateId}&name=${AccountName}&addr1=${AccountAddress}&city=${AccountCity}&state=${AccountState}&zip=${AccountZip}&phone=${AccountPhone}`;
      this.filteredFlowerSiteUrl = completeFlowerSiteUrl.replace(/\s+/g, '-').toLowerCase();
    }, error => {
      this.loading = false;
    })

  }
  //for handling the social share 
  openReferralFacebook() {
    let url = window.location.href;
    this.shareService.openFacebookShareDialog(url);
  }

  openLinkedIn() {
    let url = window.location.href;  //for getting the current page url
    this.shareService.shareOnLinkedIn(url);
  }
  //for handling the sending flowers functionality
  sendFlowers() {
    window.open(this.filteredFlowerSiteUrl, '_blank');
  }

}
