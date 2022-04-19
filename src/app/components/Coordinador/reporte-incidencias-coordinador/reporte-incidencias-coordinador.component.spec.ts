import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteIncidenciasCoordinadorComponent } from './reporte-incidencias-coordinador.component';

describe('ReporteIncidenciasCoordinadorComponent', () => {
  let component: ReporteIncidenciasCoordinadorComponent;
  let fixture: ComponentFixture<ReporteIncidenciasCoordinadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteIncidenciasCoordinadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteIncidenciasCoordinadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
