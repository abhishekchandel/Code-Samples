import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateObituaryComponent } from './components/create-obituary/create-obituary.component';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { MaintainUserSettingsComponent } from './components/maintain-user-settings/maintain-user-settings.component';
import { MaintainAdminSettingsComponent } from './components/maintain-admin-settings/maintain-admin-settings.component';
import { LayoutComponent } from '../auth/components/layout/layout.component';
import { AdministrativePanelComponent } from './components/administrative-panel/administrative-panel.component';
import { StripePaymentFormComponent } from './components/stripe-payment-form/stripe-payment-form.component';
import { CartObitsComponent } from './components/cart-obits/cart-obits.component';

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "",
        redirectTo: "admin-panel",
        pathMatch: "full"
      },
      {
        path: "admin-panel",
        component: AdministrativePanelComponent,
      },
      {
        path: "create-obituary",
        component: CreateObituaryComponent,
      },
      {
        path: "create-user",
        component: CreateUserComponent,
      },
      {
        path: "maintain-user-settings",
        component: MaintainUserSettingsComponent,
      },
      {
        path: "admin-settings",
        component: MaintainAdminSettingsComponent,
      },
      {
        path: "obit-cart",
        component: CartObitsComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrativeRoutingModule { }
