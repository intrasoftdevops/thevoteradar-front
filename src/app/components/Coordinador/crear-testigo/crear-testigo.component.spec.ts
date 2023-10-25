import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTestigoComponent } from './crear-testigo.component';

describe('CrearTestigoComponent', () => {
  let component: CrearTestigoComponent;
  let fixture: ComponentFixture<CrearTestigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearTestigoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearTestigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
