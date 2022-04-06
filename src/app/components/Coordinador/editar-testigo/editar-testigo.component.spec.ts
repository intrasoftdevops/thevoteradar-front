import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTestigoComponent } from './editar-testigo.component';

describe('EditarTestigoComponent', () => {
  let component: EditarTestigoComponent;
  let fixture: ComponentFixture<EditarTestigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarTestigoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarTestigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
