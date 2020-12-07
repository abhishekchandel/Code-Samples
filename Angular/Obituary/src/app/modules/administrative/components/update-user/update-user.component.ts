import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { AdminService } from 'src/app/core/services/admin.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.scss']
})
export class UpdateUserComponent implements OnInit {
  @Input('accountId') accountId: number;
  headingsClass: string[] = ['Login Name', 'Person Name', 'Email', 'Phone', 'Password', 'Actions'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('editModal') modal: ElementRef;

  loading: boolean = false;
  totalItems: any;
  tableData: any;
  popUpData: any;
  updateUserdata: any;
  dataSource = new MatTableDataSource();

  constructor(private adminService: AdminService,
    private localStorageService: LocalStorageService,
    private modalService: BsModalService,
    private snackBar: MatSnackbarComponent
  ) { }

  modalRef: BsModalRef;
  styling = {
    ignoreBackdropClick: true
  };

  allUsersRequest = {
    accountId: 0,
    Page: 1,
    Limit: 10,
    OrderBy: "UserProfileId",
    OrderByDescending: true,
    AllRecords: false
  }
  ngOnInit(): void {
    this.allUsersRequest.accountId = this.accountId
    this.getAllUsers();
  }
  initialiseTab() {
    this.allUsersRequest = {
      accountId: 0,
      Page: 1,
      Limit: 10,
      OrderBy: "UserProfileId",
      OrderByDescending: true,
      AllRecords: false
    }
  }
  getAllUsers() {
    this.loading = true;
    this.adminService.getUserByAccount(this.allUsersRequest).subscribe(response => {
      this.updateUserdata = response.Data.UsersResponse;
      this.dataSource.data = this.updateUserdata;
      this.totalItems = response.Data.TotalRecords;
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  deleteUser(index) {
    this.loading = true;
    let userProfileId = this.updateUserdata[index].UserProfileId
    let request = {
      userProfileId: userProfileId,
      deletedBy: this.localStorageService.getUserCredentials().LoginName
    }
    let confirmation = confirm('Do you want to delete this record?');
    if (confirmation) {
      this.adminService.deleteUser(request).subscribe(response => {
        this.loading = false;
        this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
        this.getAllUsers();
      }, error => {
        this.loading = false;
        this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
      })
    }
    else {
      this.loading = false;
    }
  }
  editUser(index) {
    this.popUpData = this.updateUserdata[index]
    this.openModal();
  }
  openModal() {
    if (this.modalRef)
      this.closeModal();

    this.modalRef = this.modalService.show(this.modal,
      Object.assign({}, { class: 'summaryPopUp gray modal-lg' }, this.styling)
    );
  }
  closeModal() {
    this.modalRef.hide();
  }
  getNext(event) {
    this.allUsersRequest.Page = (event.pageIndex) + 1;
    this.getAllUsers()
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }


}
