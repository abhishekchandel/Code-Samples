import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { RegisterComponent } from './components/register/register.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { LayoutComponent } from './components/layout/layout.component';
import { ErrorComponent } from './components/error/error.component';


@NgModule({
  declarations: [LoginComponent, ForgotPasswordComponent, ResetPasswordComponent, RegisterComponent, LayoutComponent, ErrorComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule
  ]
})
export class AuthModule { }
