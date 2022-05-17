import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiarRolGerenteComponent } from './cambiar-rol-gerente.component';

describe('CambiarRolGerenteComponent', () => {
  let component: CambiarRolGerenteComponent;
  let fixture: ComponentFixture<CambiarRolGerenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CambiarRolGerenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CambiarRolGerenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
