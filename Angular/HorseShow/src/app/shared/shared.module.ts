import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HeaderComponent } from '../shared/layout/header/header.component';
import { SidebarComponent } from '../shared/layout/sidebar/sidebar.component';
import { FooterComponent } from '../shared/layout/footer/footer.component';
import { RouterModule } from '@angular/router';
import { ConfirmEqualValidatorDirective } from './directives/confirm-equal-validator.directive';
import {SearchPipe} from '../shared/filters/search.pipe'
import { AssignStallModalComponent } from './ui/modals/assign-stall-modal/assign-stall-modal.component';
import { FinancialTransactionsComponent } from './ui/modals/financial-transactions/financial-transactions.component';
import { OnlynumberDirective } from './directives/only-number.directive';
import { OnlyTwoDecimalsDirective } from './directives/only-two-decimals.directive';
import { NumericDecimalDirective } from './directives/only-decimals-numbers.directive';

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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackbarComponent } from './ui/mat-snackbar/mat-snackbar.component';
import { ConfirmDialogComponent } from './ui/modals/confirmation-modal/confirm-dialog.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { AddSplitClassModalComponent } from './ui/modals/add-split-class-modal/add-split-class-modal.component'
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ExportConfirmationModalComponent } from './ui/modals/export-confirmation-modal/export-confirmation-modal.component';
import { OrderModule } from 'ngx-order-pipe';
import { ExportAsModule } from 'ngx-export-as';
import {NgxPrintModule} from 'ngx-print';
import { SponsorInfoModalComponent } from './ui/modals/sponsor-info-modal/sponsor-info-modal.component';
import { FilteredFinancialTransactionsComponent } from './ui/modals/filtered-financial-transactions/filtered-financial-transactions.component';
import { EmailModalComponent } from './ui/modals/email-modal/email-modal.component';
import {AmountPipe} from '../shared/filters/amount.pipe';
import { AddSizeFeeModalComponent } from './ui/modals/add-size-fee-modal/add-size-fee-modal.component';
import { ClassCategoryModalComponent } from './ui/modals/class-category-modal/class-category-modal.component';
import { GeneralFeeModalComponent } from './ui/modals/general-fee-modal/general-fee-modal.component';
import { RefundCalculationModalComponent } from './ui/modals/refund-calculation-modal/refund-calculation-modal.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { AddRoleModalComponent } from './ui/modals/add-role-modal/add-role-modal.component';
import { SponsorIncentiveRefundCalculationComponent } from './ui/modals/sponsor-incentive-refund-calculation/sponsor-incentive-refund-calculation.component';
import { ReportemailComponent } from './ui/modals/reportemail/reportemail.component';
import { DateTimeFormatFilterPipe } from './filters/date-time-format-filter.pipe';




export var options: Partial<IConfig> | (() => Partial<IConfig>);
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [HeaderComponent, FooterComponent,SidebarComponent, MatSnackbarComponent, 
    ConfirmDialogComponent, AddSplitClassModalComponent, ExportConfirmationModalComponent,
     ConfirmEqualValidatorDirective, SearchPipe, AssignStallModalComponent, FinancialTransactionsComponent,
      OnlynumberDirective, SponsorInfoModalComponent, FilteredFinancialTransactionsComponent, 
      EmailModalComponent,AmountPipe,OnlyTwoDecimalsDirective,NumericDecimalDirective,
       AddSizeFeeModalComponent, ClassCategoryModalComponent, GeneralFeeModalComponent,
        RefundCalculationModalComponent,
          AddRoleModalComponent, ReportemailComponent,
     RefundCalculationModalComponent
     , AddRoleModalComponent, SponsorIncentiveRefundCalculationComponent, DateTimeFormatFilterPipe],
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
    MatSnackBarModule,
    MatAutocompleteModule,
    // All third party imports here //
    NgxMaskModule.forRoot(options),
    MatSelectModule,
    PerfectScrollbarModule,
    OrderModule,
    ExportAsModule,
    NgxPrintModule,
   
   
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    MatSnackbarComponent,
    RouterModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
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
    MatSnackBarModule,
    MatAutocompleteModule,
    // All third party exports here //
    NgxMaskModule,
    MatSelectModule,
    PerfectScrollbarModule,
    OrderModule,
    ExportAsModule,
    NgxPrintModule,
    ConfirmEqualValidatorDirective,
    SearchPipe,
    OnlynumberDirective,
    AmountPipe,
    OnlyTwoDecimalsDirective,
    NumericDecimalDirective,
    DateTimeFormatFilterPipe
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    MatSnackbarComponent,
      
  ]
})
export class SharedModule { }
