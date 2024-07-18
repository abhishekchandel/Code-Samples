import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'abc-page-details',
  templateUrl: './page-details.component.html',
  styleUrls: ['./page-details.component.scss'],
})
export class DetailPageComponent {
  @Input() heading = '';
  @Input() subHeading = '';
  @Input() showBack = true;
  @Output() back = new EventEmitter<void>();

  handleBack() {
    this.back.emit();
  }
}

