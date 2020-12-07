import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ErrorInterceptor } from '../core/interceptors';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { MatSnackbarComponent } from './ui/mat-snackbar/mat-snackbar.component';
import { ConfirmDialogComponent } from './ui/confirm-dialog/confirm-dialog.component';
import { ConfirmEqualValidatorDirective } from '../shared/filters/filter.directive';
import { TitleCaseDirective } from './directives/uppercase.directive';
import { LimitCharPipe } from './directives/limitChar.directive';
import { TimeFormatPipe } from './directives/timeFormat.directive';
import { YearFormatPipe } from './directives/yearFormat.directive';
import { MonthFormatPipe } from './directives/monthFormat.directive';
import { DateFormatPipe } from './directives/dateFormat.directive';
import { RouterModule } from '@angular/router';

//All material imports here//
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkTableModule } from '@angular/cdk/table';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

import { MatTabsModule } from '@angular/material/tabs';



// All third party imports here //
import { AngularEditorModule, AngularEditorConfig } from '@kolkov/angular-editor'; //angular editor
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CharDirective } from './directives/firstCaps.directive';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { PublicFooterComponent } from './layout/public-module/footer/footer.component';
import { PublicHeaderComponent } from './layout/public-module/header/header.component';
import { NgxSocialShareModule } from 'ngx-social-share';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatSelectModule } from '@angular/material/select';
import { FooterPopupComponent } from './ui/footer-popup/footer-popup.component';


export var options: Partial<IConfig> | (() => Partial<IConfig>);

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
//for text editor configuration
const editorConfig: AngularEditorConfig = {
  editable: true,
  spellcheck: true,
  height: 'auto',
  minHeight: '0',
  maxHeight: 'auto',
  width: 'auto',
  minWidth: '0',
  translate: 'yes',
  enableToolbar: true,
  showToolbar: true,
  placeholder: 'Enter text here...',
  defaultParagraphSeparator: '',
  defaultFontName: '',
  defaultFontSize: '',
  fonts: [
    { class: 'arial', name: 'Arial' },
    { class: 'times-new-roman', name: 'Times New Roman' },
    { class: 'calibri', name: 'Calibri' },
    { class: 'comic-sans-ms', name: 'Comic Sans MS' }
  ],
  customClasses: [
    {
      name: 'quote',
      class: 'quote',
    },
    {
      name: 'redText',
      class: 'redText'
    },
    {
      name: 'titleText',
      class: 'titleText',
      tag: 'h1',
    },
  ],
  uploadUrl: 'v1/image',
  uploadWithCredentials: false,
  sanitize: true,
  toolbarPosition: 'top',
  toolbarHiddenButtons: [
    ['bold', 'italic'],
    ['fontSize']
  ]
};
@NgModule({
  declarations: [HeaderComponent, FooterComponent, MatSnackbarComponent, PublicFooterComponent, PublicHeaderComponent, ConfirmDialogComponent, TitleCaseDirective, TimeFormatPipe, YearFormatPipe, MonthFormatPipe, DateFormatPipe, CharDirective, LimitCharPipe, ConfirmEqualValidatorDirective, FooterPopupComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    // All material controls imports here //
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CdkStepperModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    CdkTableModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    // All third party imports here //
    AngularEditorModule,
    PerfectScrollbarModule,
    MatSnackBarModule,
    NgxMaskModule.forRoot(options),
    NgxMaterialTimepickerModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgxSocialShareModule,
    MatSelectModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    PublicFooterComponent,
    PublicHeaderComponent,
    RouterModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    ConfirmEqualValidatorDirective,
    TitleCaseDirective,
    CharDirective,
    LimitCharPipe,
    TimeFormatPipe,
    YearFormatPipe,
    MonthFormatPipe,
    DateFormatPipe,
    //All material exports here//
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CdkStepperModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    CdkTableModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    // All third party exports here //
    AngularEditorModule,
    PerfectScrollbarModule,
    MatSnackBarModule,
    NgxMaskModule,
    NgxMaterialTimepickerModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgxSocialShareModule,
    MatSelectModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [ErrorInterceptor, MatSnackbarComponent,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class SharedModule { }
