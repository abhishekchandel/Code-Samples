import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app.routing.module';
import { CoreModule } from './core/core.module';
import { BnNgIdleService } from 'bn-ng-idle';
import {DatePipe} from '@angular/common';


import { HttpClientModule } from '@angular/common/http';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    HttpClientModule,
    CoreModule,
    NgxMatSelectSearchModule
  ],
  providers: [BnNgIdleService,DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
