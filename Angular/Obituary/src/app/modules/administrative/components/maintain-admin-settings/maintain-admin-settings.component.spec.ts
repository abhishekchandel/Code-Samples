import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintainAdminSettingsComponent } from './maintain-admin-settings.component';

describe('MaintainAdminSettingsComponent', () => {
  let component: MaintainAdminSettingsComponent;
  let fixture: ComponentFixture<MaintainAdminSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintainAdminSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintainAdminSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
