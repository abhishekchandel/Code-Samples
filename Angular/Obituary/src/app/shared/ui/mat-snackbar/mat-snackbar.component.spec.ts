import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatSnackbarComponent } from './mat-snackbar.component';

describe('MatSnackbarComponent', () => {
  let component: MatSnackbarComponent;
  let fixture: ComponentFixture<MatSnackbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatSnackbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
