import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarTestigoComponent } from './consultar-testigo.component';

describe('ConsultarTestigoComponent', () => {
  let component: ConsultarTestigoComponent;
  let fixture: ComponentFixture<ConsultarTestigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultarTestigoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultarTestigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
