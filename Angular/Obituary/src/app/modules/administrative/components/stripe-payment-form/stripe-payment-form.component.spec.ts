import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StripePaymentFormComponent } from './stripe-payment-form.component';

describe('StripePaymentFormComponent', () => {
  let component: StripePaymentFormComponent;
  let fixture: ComponentFixture<StripePaymentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StripePaymentFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StripePaymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
