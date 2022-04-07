import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPuestoGerenteComponent } from './ver-puesto-gerente.component';

describe('VerPuestoGerenteComponent', () => {
  let component: VerPuestoGerenteComponent;
  let fixture: ComponentFixture<VerPuestoGerenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerPuestoGerenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerPuestoGerenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
