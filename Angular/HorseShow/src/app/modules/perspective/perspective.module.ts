import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PerspectiveRoutingModule } from './perspective-routing.module';
import { ClassComponent } from './components/class/class.component';
import { SharedModule } from '../../shared/shared.module';
import { LayoutComponent } from './components/layout/layout.component';
import { SponsorComponent } from './components/sponsor/sponsor.component';
import { GroupStallComponent } from './components/stall/groupstall.component';
import { ExhibitorStallComponent } from './components/stall/exhibitorstall.component';
import { ExhibitorComponent } from './components/exhibitor/exhibitor.component';
import { HorseComponent } from './components/horse/horse.component';
import { GroupComponent } from './components/group/group.component';


@NgModule({
  declarations: [ClassComponent, ExhibitorComponent, GroupComponent,LayoutComponent, HorseComponent,SponsorComponent, GroupStallComponent,ExhibitorStallComponent],
  imports: [
    CommonModule,
    PerspectiveRoutingModule,
    SharedModule,
  ]
})
export class PerspectiveModule { }
