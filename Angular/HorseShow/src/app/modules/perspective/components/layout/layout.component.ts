import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from 'src/app/shared/layout/header/header.component';
import { GlobalService } from '../../../../core/services/global.service'

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  @ViewChild('appHeader') appHeader: HeaderComponent;

  title: string;
  searchText: string;
  constructor(private router: Router, private globalService: GlobalService) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.title = this.getTitle(router.routerState, router.routerState.root).join('-');
        if(this.appHeader) {
          this.globalService.searchTerm.next(null)
          this.appHeader.clearInput();
      }
    }
    });
  }

  ngOnInit() {}
  getTitle(state, parent) {
    var data = [];
    if (parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if (state && parent) {
      data.push(... this.getTitle(state, state.firstChild(parent)));
    }
    return data;
  }

}
