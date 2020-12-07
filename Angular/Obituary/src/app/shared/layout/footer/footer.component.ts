import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PublicFacingService } from 'src/app/core/services/public-facing.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  @ViewChild('footerModal') modal: ElementRef;

  modalRef: BsModalRef;
  styling = {
    ignoreBackdropClick: true
  };
  terms: boolean = false;
  cookies: boolean = false;
  constructor(private publicFacingService: PublicFacingService,
    private modalService: BsModalService) { }
  datasource: any;
  ngOnInit(): void {
    this.getSocialLinks();
  }

  getSocialLinks() {
    this.publicFacingService.getSocialLinks().subscribe(response => {
      this.datasource = response.Data;
    }, error => {
    })

  }
  openModal(footerText: string) {
    if (footerText == 'Terms') {
      this.terms = true;
      this.cookies = false;
    }
    if (footerText == 'Cookie') {
      this.cookies = true;
      this.terms = false;
    }
    if (this.modalRef)
      this.closeModal();

    this.modalRef = this.modalService.show(this.modal,
      Object.assign({}, { class: 'summaryPopUp gray modal-lg' }, this.styling)
    );
  }
  closeModal() {
    this.modalRef.hide();
  }

}
