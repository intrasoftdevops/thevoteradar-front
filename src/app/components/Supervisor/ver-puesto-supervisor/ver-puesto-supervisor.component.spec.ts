import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPuestoSupervisorComponent } from './ver-puesto-supervisor.component';

describe('VerPuestoSupervisorComponent', () => {
  let component: VerPuestoSupervisorComponent;
  let fixture: ComponentFixture<VerPuestoSupervisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerPuestoSupervisorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerPuestoSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
