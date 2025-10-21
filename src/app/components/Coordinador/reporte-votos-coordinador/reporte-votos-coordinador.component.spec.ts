import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteVotosCoordinadorComponent } from './reporte-votos-coordinador.component';

describe('ReporteVotosCoordinadorComponent', () => {
  let component: ReporteVotosCoordinadorComponent;
  let fixture: ComponentFixture<ReporteVotosCoordinadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteVotosCoordinadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteVotosCoordinadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
