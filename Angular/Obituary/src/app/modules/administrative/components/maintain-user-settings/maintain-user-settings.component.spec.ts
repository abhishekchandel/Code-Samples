import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintainUserSettingsComponent } from './maintain-user-settings.component';

describe('MaintainUserSettingsComponent', () => {
  let component: MaintainUserSettingsComponent;
  let fixture: ComponentFixture<MaintainUserSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MaintainUserSettingsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintainUserSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
