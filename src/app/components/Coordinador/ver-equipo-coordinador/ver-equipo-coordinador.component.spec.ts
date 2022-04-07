import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerEquipoCoordinadorComponent } from './ver-equipo-coordinador.component';

describe('VerEquipoCoordinadorComponent', () => {
  let component: VerEquipoCoordinadorComponent;
  let fixture: ComponentFixture<VerEquipoCoordinadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerEquipoCoordinadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerEquipoCoordinadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
