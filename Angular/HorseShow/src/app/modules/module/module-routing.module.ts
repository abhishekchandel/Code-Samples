import { NgModule } from '@angular/core';
import { LayoutComponent } from '../perspective/components/layout/layout.component';
import { Routes, RouterModule } from '@angular/router';
import { YearlyMaintenanceComponent } from './components/yearly-maintenance/yearly-maintenance.component';
import { StallAssignmentComponent } from './components/stall-assignment/stall-assignment.component';
import { ScansComponent } from './components/scans/scans.component';
import { ReportsComponent } from './components/reports/reports.component';
import { StatementsComponent } from './components/statements/statements.component';
import { FinancialsComponent } from './components/financials/financials.component';

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "yearly-maintenance",
        component: YearlyMaintenanceComponent,
        data: {
          title: "Yearly Maintenance"
        }
      },
      {
        path: "stall-assignment",
        component: StallAssignmentComponent,
        data: {
          title: "Assigned Stalls"
        }
      },
     
      {
        path: "reports",
        component: ReportsComponent,
        data: {
          title: "Reports"
        }
      },

      {
        path: "scans",
        component: ScansComponent,
        data: {
          title: "Scans"
        }
      },

      {
        path: "statements",
        component: StatementsComponent,
        data: {
          title: "Statements"
        }
      },

      {
        path: "financials",
        component: FinancialsComponent,
        data: {
          title: "financials"
        }
      },

      
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModuleRoutingModule { }
