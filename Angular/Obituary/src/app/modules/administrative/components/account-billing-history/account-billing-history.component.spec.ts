import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBillingHistoryComponent } from './account-billing-history.component';

describe('AccountBillingHistoryComponent', () => {
  let component: AccountBillingHistoryComponent;
  let fixture: ComponentFixture<AccountBillingHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountBillingHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBillingHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
