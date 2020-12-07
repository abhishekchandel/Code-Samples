import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendFlowersComponent } from './send-flowers.component';

describe('SendFlowersComponent', () => {
  let component: SendFlowersComponent;
  let fixture: ComponentFixture<SendFlowersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendFlowersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendFlowersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
