import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateObituaryComponent } from './create-obituary.component';

describe('CreateObituaryComponent', () => {
  let component: CreateObituaryComponent;
  let fixture: ComponentFixture<CreateObituaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateObituaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateObituaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
