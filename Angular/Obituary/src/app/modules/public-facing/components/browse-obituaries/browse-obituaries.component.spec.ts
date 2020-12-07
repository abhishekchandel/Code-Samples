import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseObituariesComponent } from './browse-obituaries.component';

describe('BrowseObituariesComponent', () => {
  let component: BrowseObituariesComponent;
  let fixture: ComponentFixture<BrowseObituariesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseObituariesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseObituariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
