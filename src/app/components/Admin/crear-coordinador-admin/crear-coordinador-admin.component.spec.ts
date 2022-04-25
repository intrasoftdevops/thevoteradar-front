import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCoordinadorAdminComponent } from './crear-coordinador-admin.component';

describe('CrearCoordinadorAdminComponent', () => {
  let component: CrearCoordinadorAdminComponent;
  let fixture: ComponentFixture<CrearCoordinadorAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearCoordinadorAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearCoordinadorAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
