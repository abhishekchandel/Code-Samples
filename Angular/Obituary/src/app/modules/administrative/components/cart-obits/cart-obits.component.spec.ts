import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CartObitsComponent } from './cart-obits.component';

describe('CartObitsComponent', () => {
  let component: CartObitsComponent;
  let fixture: ComponentFixture<CartObitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartObitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartObitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
