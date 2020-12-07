import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from 'src/app/core/services/admin.service';

@Component({
  selector: 'app-account-billing-history',
  templateUrl: './account-billing-history.component.html',
  styleUrls: ['./account-billing-history.component.scss']
})
export class AccountBillingHistoryComponent implements OnInit {
  @Input('accountId') accountId: number;

  headingsClass: string[] = ['Transaction (Obit/Mthly)', 'Date', 'Amount'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  accountBillinghistorydata: any;
  loading: boolean = false;
  totalItems: any;
  dataSource = new MatTableDataSource();

  accountBillingRequest = {
    accountId: 0,
    Page: 1,
    Limit: 10,
    OrderBy: "CreationDate",
    OrderByDescending: true,
    AllRecords: false
  }
  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.accountBillingRequest.accountId = this.accountId
    this.getAccountBillingHistory();
  }
  getAccountBillingHistory() {
    this.loading = true;
    this.adminService.getAccountBillingHistory(this.accountBillingRequest).subscribe(response => {
      this.accountBillinghistorydata = response.Data.accountBillingResponse;
      this.dataSource.data = this.accountBillinghistorydata;
      this.totalItems = response.Data.TotalRecords;
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }
  getNext(event) {
    this.accountBillingRequest.Page = (event.pageIndex) + 1;
    this.getAccountBillingHistory()
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

}
