import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteVotosTestigoComponent } from './reporte-votos-testigo.component';

describe('ReporteVotosTestigoComponent', () => {
  let component: ReporteVotosTestigoComponent;
  let fixture: ComponentFixture<ReporteVotosTestigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteVotosTestigoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteVotosTestigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
