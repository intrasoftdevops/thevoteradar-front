import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerEquipoAdminComponent } from './ver-equipo-admin.component';

describe('VerEquipoAdminComponent', () => {
  let component: VerEquipoAdminComponent;
  let fixture: ComponentFixture<VerEquipoAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerEquipoAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerEquipoAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
