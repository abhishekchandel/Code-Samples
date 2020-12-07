import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SponsorComponent } from './components/sponsor/sponsor.component';
import { HorseComponent } from './components/horse/horse.component';
import { ExhibitorComponent } from './components/exhibitor/exhibitor.component';
import { ClassComponent } from './components/class/class.component';
import { GroupComponent } from './components/group/group.component';
import { LayoutComponent } from './components/layout/layout.component';


const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "sponsor",
        component: SponsorComponent,
        data: {
          title: "Sponsors"
        }
      },
      {
        path: "horse",
        component: HorseComponent,
        data: {
          title: "Horses"
        }
      },
      {
        path: "exhibitor",
        component: ExhibitorComponent,
        data: {
          title: "Exhibitors"
        }
      },
      {
        path: "class",
        component: ClassComponent,
        data: {
          title: "Classes"
        }
      },
      {
        path: "group",
        component: GroupComponent,
        data: {
          title: "Groups"
        }
      },
    ],
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PerspectiveRoutingModule { }
