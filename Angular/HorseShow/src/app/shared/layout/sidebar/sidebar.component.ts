import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Output() route: EventEmitter<string> =   new EventEmitter();

  constructor(private localStorageService: LocalStorageService) { }
  role:string

  ngOnInit(): void {
    this.role = this.localStorageService.getUserCredentials().Role;
  }
 
}
