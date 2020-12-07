import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintainBillingInfoComponent } from './maintain-billing-info.component';

describe('MaintainBillingInfoComponent', () => {
  let component: MaintainBillingInfoComponent;
  let fixture: ComponentFixture<MaintainBillingInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintainBillingInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintainBillingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
