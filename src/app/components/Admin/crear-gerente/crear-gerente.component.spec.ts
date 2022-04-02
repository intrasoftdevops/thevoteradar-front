import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearGerenteComponent } from './crear-gerente.component';

describe('CrearGerenteComponent', () => {
  let component: CrearGerenteComponent;
  let fixture: ComponentFixture<CrearGerenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearGerenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearGerenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
