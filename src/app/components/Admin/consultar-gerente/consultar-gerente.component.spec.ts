import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarGerenteComponent } from './consultar-gerente.component';

describe('ConsultarGerenteComponent', () => {
  let component: ConsultarGerenteComponent;
  let fixture: ComponentFixture<ConsultarGerenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultarGerenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultarGerenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
