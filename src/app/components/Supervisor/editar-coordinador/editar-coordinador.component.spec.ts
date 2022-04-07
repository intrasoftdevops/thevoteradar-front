import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCoordinadorComponent } from './editar-coordinador.component';

describe('EditarCoordinadorComponent', () => {
  let component: EditarCoordinadorComponent;
  let fixture: ComponentFixture<EditarCoordinadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarCoordinadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarCoordinadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
