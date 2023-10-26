import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPuestoCoordinadorComponent } from './ver-puesto-coordinador.component';

describe('VerPuestoCoordinadorComponent', () => {
  let component: VerPuestoCoordinadorComponent;
  let fixture: ComponentFixture<VerPuestoCoordinadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerPuestoCoordinadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerPuestoCoordinadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
