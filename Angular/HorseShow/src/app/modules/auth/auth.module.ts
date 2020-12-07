import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';

import { AuthComponent } from './auth.component';
import { AuthRoutingModule } from './auth-routing.module';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { SharedModule } from 'src/app/shared/shared.module';
import{ResetPasswordComponent}from './components/reset-password/reset-password.component'
import{RegisterComponent}from './components/register/register.component';
import { ErrorComponent } from './components/error/error.component'


@NgModule({
  declarations: [AuthComponent, ForgotPasswordComponent,LoginComponent,ResetPasswordComponent,RegisterComponent, ErrorComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule
  ]
})
export class AuthModule { }
