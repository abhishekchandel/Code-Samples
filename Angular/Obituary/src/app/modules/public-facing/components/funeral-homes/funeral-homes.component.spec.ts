import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FuneralHomesComponent } from './funeral-homes.component';

describe('FuneralHomesComponent', () => {
  let component: FuneralHomesComponent;
  let fixture: ComponentFixture<FuneralHomesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FuneralHomesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuneralHomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
