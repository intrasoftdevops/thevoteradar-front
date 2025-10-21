import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarCoordinadorComponent } from './consultar-coordinador.component';

describe('ConsultarCoordinadorComponent', () => {
  let component: ConsultarCoordinadorComponent;
  let fixture: ComponentFixture<ConsultarCoordinadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultarCoordinadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultarCoordinadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
