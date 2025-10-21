import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPuestoAdminComponent } from './ver-puesto-admin.component';

describe('VerPuestoAdminComponent', () => {
  let component: VerPuestoAdminComponent;
  let fixture: ComponentFixture<VerPuestoAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerPuestoAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerPuestoAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
