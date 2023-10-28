import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuAdministradorImpugnacionesComponent } from './menu-administrador-impugnaciones.component';

describe('MenuAdministradorImpugnacionesComponent', () => {
  let component: MenuAdministradorImpugnacionesComponent;
  let fixture: ComponentFixture<MenuAdministradorImpugnacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuAdministradorImpugnacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuAdministradorImpugnacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
