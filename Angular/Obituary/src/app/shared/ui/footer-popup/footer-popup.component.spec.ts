import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterPopupComponent } from './footer-popup.component';

describe('FooterPopupComponent', () => {
  let component: FooterPopupComponent;
  let fixture: ComponentFixture<FooterPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
