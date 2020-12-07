import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountCommentsComponent } from './account-comments.component';

describe('AccountCommentsComponent', () => {
  let component: AccountCommentsComponent;
  let fixture: ComponentFixture<AccountCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
