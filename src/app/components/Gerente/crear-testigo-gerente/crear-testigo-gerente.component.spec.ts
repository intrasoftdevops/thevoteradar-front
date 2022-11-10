import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTestigoGerenteComponent } from './crear-testigo-gerente.component';

describe('CrearTestigoGerenteComponent', () => {
  let component: CrearTestigoGerenteComponent;
  let fixture: ComponentFixture<CrearTestigoGerenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearTestigoGerenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearTestigoGerenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
