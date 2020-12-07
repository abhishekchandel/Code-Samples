import { Component, OnInit, Inject } from '@angular/core';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public shouldShow = false;
  userId: any;
  loggedIn: boolean = false;
  constructor(private localStorageService: LocalStorageService,
    @Inject(DOCUMENT) private document: Document) { }
  ngOnInit(): void {
    this.userId = this.localStorageService.getUserCredentials().UserProfileId;
    if (this.userId > 0) {
      this.loggedIn = true;
    }
    else {
      this.loggedIn = false;

    }
  }
  addClass(status) {
    
    if (status == true) {
      this.document.body.classList.add('show')
      if (this.document.body.classList.contains('hide')) {
        this.document.body.classList.remove('hide')
      }
    }
    else {
      this.document.body.classList.remove('show')
      this.document.body.classList.add('hide')
    }

  }
  logoutSession() {
    this.localStorageService.logout();
  }

}
