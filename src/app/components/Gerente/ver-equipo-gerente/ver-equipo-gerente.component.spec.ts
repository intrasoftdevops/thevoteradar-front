import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerEquipoGerenteComponent } from './ver-equipo-gerente.component';

describe('VerEquipoGerenteComponent', () => {
  let component: VerEquipoGerenteComponent;
  let fixture: ComponentFixture<VerEquipoGerenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerEquipoGerenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerEquipoGerenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
