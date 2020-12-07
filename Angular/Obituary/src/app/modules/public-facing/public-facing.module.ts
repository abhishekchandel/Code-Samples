import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';


import { PublicFacingRoutingModule } from './public-facing-routing.module';
import { HomeComponent } from './components/home/home.component';
import { AdvanceSearchComponent } from './components/advance-search/advance-search.component';
import { BrowseObituariesComponent } from './components/browse-obituaries/browse-obituaries.component';
import { SendFlowersComponent } from './components/send-flowers/send-flowers.component';
import { SupportAndAdviceComponent } from './components/support-and-advice/support-and-advice.component';
import { FuneralHomesComponent } from './components/funeral-homes/funeral-homes.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { AdvertiseComponent } from './components/advertise/advertise.component';
import { CareersComponent } from './components/careers/careers.component';
import { ObituaryDetailPageComponent } from './components/obituary-detail-page/obituary-detail-page.component';
import { ComingSoonTemplateComponent } from './components/coming-soon-template/coming-soon-template.component';


@NgModule({
  declarations: [HomeComponent, AdvanceSearchComponent, BrowseObituariesComponent, SendFlowersComponent, SupportAndAdviceComponent, FuneralHomesComponent, NotificationsComponent, LayoutComponent, AboutUsComponent, ContactUsComponent, AdvertiseComponent, CareersComponent, ObituaryDetailPageComponent, ComingSoonTemplateComponent],
  imports: [
    CommonModule,
    PublicFacingRoutingModule,
    SharedModule
  ]
})
export class PublicFacingModule { }
