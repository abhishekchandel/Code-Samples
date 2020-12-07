import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
  selector: 'public-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class PublicHeaderComponent implements OnInit {
  public shouldShow = false;
  userId: any;
  loggedIn: boolean = false;
  constructor(private localStorageService: LocalStorageService,
  ) { }
  ngOnInit(): void {
    this.userId = this.localStorageService.getUserCredentials().UserProfileId;
    if (this.userId > 0) {
      this.loggedIn = true;
    }
    else {
      this.loggedIn = false;

    }
  }
  logoutSession() {
    this.localStorageService.logout();
  }
}
