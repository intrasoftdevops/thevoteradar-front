import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCoordinadorGerenteComponent } from './crear-coordinador-gerente.component';

describe('CrearCoordinadorGerenteComponent', () => {
  let component: CrearCoordinadorGerenteComponent;
  let fixture: ComponentFixture<CrearCoordinadorGerenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearCoordinadorGerenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearCoordinadorGerenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
