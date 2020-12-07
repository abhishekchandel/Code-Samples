import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthService } from './core/services/auth.service';

const routes: Routes = [
    {
        path: "",
        loadChildren: () => import(`./modules/public-facing/public-facing.module`).then(m => m.PublicFacingModule),
    },
    {
        path: "auth",
        loadChildren: () => import(`./modules/auth/auth.module`).then(m => m.AuthModule),
    },
    {
        path: "admin",
        loadChildren: () => import(`./modules/administrative/administrative.module`).then(m => m.AdministrativeModule),
        canActivate: [AuthGuard]
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