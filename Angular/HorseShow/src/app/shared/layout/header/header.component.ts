import { Component, OnInit, Input } from '@angular/core';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { GlobalService } from '../../../core/services/global.service'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() title: string;
  firstName: string;
  lastName: string;
  userDetails: any;
  searchText: string = "";

  constructor(private localStorageService: LocalStorageService, private globalService: GlobalService) { }

  ngOnInit(): void {
    this.userDetails = this.localStorageService.getUserCredentials();
    this.firstName = this.userDetails.FirstName;
    this.lastName = this.userDetails.LastName;
  }

  logoutSession() {
    this.localStorageService.logout();
  }

  onInput(event: any) {
    this.globalService.searchTerm.next(event.target.value)
  }

  clearInput() {
    this.searchText = null;
  }

}
