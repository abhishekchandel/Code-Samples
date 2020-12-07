import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrativePanelComponent } from './administrative-panel.component';

describe('AdministrativePanelComponent', () => {
  let component: AdministrativePanelComponent;
  let fixture: ComponentFixture<AdministrativePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrativePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrativePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
