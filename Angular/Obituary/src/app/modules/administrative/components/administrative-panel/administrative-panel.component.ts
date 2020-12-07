import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
  selector: 'app-administrative-panel',
  templateUrl: './administrative-panel.component.html',
  styleUrls: ['./administrative-panel.component.scss']
})
export class AdministrativePanelComponent implements OnInit {

  constructor(private localStorageService: LocalStorageService) { }
  role: string;
  isAdmin: boolean = false;
  ngOnInit(): void {
    this.role = this.localStorageService.getUserCredentials().Role;
    if (this.role == 'Admin') {
      this.isAdmin = true;
    }

  }

}
