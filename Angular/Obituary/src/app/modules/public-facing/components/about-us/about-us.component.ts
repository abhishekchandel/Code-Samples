import { Component, OnInit } from '@angular/core';
import { PublicFacingService } from 'src/app/core/services/public-facing.service';
import { BaseUrl } from 'src/app/config/url-config';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

  constructor(private publicFacingService: PublicFacingService) { }

  loading: boolean = false;
  aboutUsData: any;

  assetsUrl = BaseUrl.assetsUrl;

  ngOnInit(): void {
    this.getPageContent();
  }
  //dynamic data on page load
  getPageContent() {
    this.loading = true;
    let data = '"aboutus"';
    this.publicFacingService.getDynamicContent(data).subscribe(response => {
      this.aboutUsData = response.Data.PageContentResponse;
      this.loading = false;

    }, error => {
      this.loading = false;
    })
  }
}
