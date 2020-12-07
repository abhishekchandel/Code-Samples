import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComingSoonTemplateComponent } from './coming-soon-template.component';

describe('ComingSoonTemplateComponent', () => {
  let component: ComingSoonTemplateComponent;
  let fixture: ComponentFixture<ComingSoonTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComingSoonTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComingSoonTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
