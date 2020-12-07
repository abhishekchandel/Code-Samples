import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportAndAdviceComponent } from './support-and-advice.component';

describe('SupportAndAdviceComponent', () => {
  let component: SupportAndAdviceComponent;
  let fixture: ComponentFixture<SupportAndAdviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupportAndAdviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportAndAdviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
