import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard'


const routes: Routes = [
  {
      path: "",
      loadChildren: () => import(`./modules/auth/auth.module`).then(m => m.AuthModule)
  },
  {
    path: "perspective",
    loadChildren: () => import(`./modules/perspective/perspective.module`).then(m => m.PerspectiveModule),
     canActivate:[AuthGuard]
},

{
  path: "module",
  loadChildren: () => import(`./modules/module/module.module`).then(m => m.ModuleModule),
   canActivate:[AuthGuard]
},

];
@NgModule({
  imports:
      [
          RouterModule.forRoot(routes)
      ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
