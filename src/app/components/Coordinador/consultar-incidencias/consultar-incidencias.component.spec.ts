import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarIncidenciasComponent } from './consultar-incidencias.component';

describe('ConsultarIncidenciasComponent', () => {
  let component: ConsultarIncidenciasComponent;
  let fixture: ComponentFixture<ConsultarIncidenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultarIncidenciasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultarIncidenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
