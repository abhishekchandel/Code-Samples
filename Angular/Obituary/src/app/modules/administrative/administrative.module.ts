import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministrativeRoutingModule } from './administrative-routing.module';
import { CreateObituaryComponent } from './components/create-obituary/create-obituary.component';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { MaintainUserSettingsComponent } from './components/maintain-user-settings/maintain-user-settings.component';
import { MaintainAdminSettingsComponent } from './components/maintain-admin-settings/maintain-admin-settings.component';
import { AdministrativePanelComponent } from './components/administrative-panel/administrative-panel.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { StripePaymentFormComponent } from './components/stripe-payment-form/stripe-payment-form.component';
import { MaintainBillingInfoComponent } from './components/maintain-billing-info/maintain-billing-info.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { UpdateUserComponent } from './components/update-user/update-user.component';
import { UpdateUserModalComponent } from './components/update-user-modal/update-user-modal.component';
import { AccountBillingHistoryComponent } from './components/account-billing-history/account-billing-history.component';
import { AccountCommentsComponent } from './components/account-comments/account-comments.component';
import { CartObitsComponent } from './components/cart-obits/cart-obits.component';



@NgModule({
  declarations: [CreateObituaryComponent, CreateUserComponent, MaintainUserSettingsComponent, MaintainAdminSettingsComponent, AdministrativePanelComponent,StripePaymentFormComponent, MaintainBillingInfoComponent, AddUserComponent, UpdateUserComponent, UpdateUserModalComponent, AccountBillingHistoryComponent, AccountCommentsComponent, CartObitsComponent],
  imports: [
    CommonModule,
    AdministrativeRoutingModule,
    SharedModule,
     PasswordStrengthMeterModule 

  ]
})
export class AdministrativeModule { }
