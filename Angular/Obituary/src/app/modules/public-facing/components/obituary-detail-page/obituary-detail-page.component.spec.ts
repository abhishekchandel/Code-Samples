import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObituaryDetailPageComponent } from './obituary-detail-page.component';

describe('ObituaryDetailPageComponent', () => {
  let component: ObituaryDetailPageComponent;
  let fixture: ComponentFixture<ObituaryDetailPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObituaryDetailPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObituaryDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
