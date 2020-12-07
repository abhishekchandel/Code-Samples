import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { BrowseObituariesComponent } from './components/browse-obituaries/browse-obituaries.component';
import { SendFlowersComponent } from './components/send-flowers/send-flowers.component';
import { SupportAndAdviceComponent } from './components/support-and-advice/support-and-advice.component';
import { FuneralHomesComponent } from './components/funeral-homes/funeral-homes.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AdvanceSearchComponent } from './components/advance-search/advance-search.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { CareersComponent } from './components/careers/careers.component';
import { AdvertiseComponent } from './components/advertise/advertise.component';
import { ObituaryDetailPageComponent } from './components/obituary-detail-page/obituary-detail-page.component';
import { ComingSoonTemplateComponent } from './components/coming-soon-template/coming-soon-template.component';


const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "",
        redirectTo: "home",
        pathMatch: "full"
      },
      {
        path: "home",
        component: HomeComponent,
      },
      {
        path: "browse-obituaries",
        component: BrowseObituariesComponent,
      },
      {
        path: "send-flowers",
        component: SendFlowersComponent,
      },
      {
        path: "support-and-advice",
        component: SupportAndAdviceComponent,
      },
      {
        path: "funeral-homes",
        component: FuneralHomesComponent,
      },
      {
        path: "notifications",
        component: NotificationsComponent,
      },
      {
        path: "advance-search",
        component: AdvanceSearchComponent
      },
      {
        path: "obituary-detail-page",
        component: ObituaryDetailPageComponent,
      },
      {
        path: "about-us",
        component: AboutUsComponent,
      },
      {
        path: "careers",
        component: CareersComponent,
      },
      {
        path: "advertise",
        component: AdvertiseComponent,
      },
      {
        path: "contact-us",
        component: ContactUsComponent,
      },
      {
        path: "coming-soon",
        component: ComingSoonTemplateComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicFacingRoutingModule { }
