import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-footer-popup',
  templateUrl: './footer-popup.component.html',
  styleUrls: ['./footer-popup.component.scss']
})
export class FooterPopupComponent implements OnInit {
  @Output() handleClose: EventEmitter<any> = new EventEmitter<any>();
  @Input('terms') terms: number;
  @Input('cookies') cookies: number;

  constructor() { }

  ngOnInit(): void {
  }
  closeModal() {
    this.handleClose.emit();
  }

}
