import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerEquipoSupervisorComponent } from './ver-equipo-supervisor.component';

describe('VerEquipoSupervisorComponent', () => {
  let component: VerEquipoSupervisorComponent;
  let fixture: ComponentFixture<VerEquipoSupervisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerEquipoSupervisorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerEquipoSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
