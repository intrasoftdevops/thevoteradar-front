import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearSupervisorAdminComponent } from './crear-supervisor-admin.component';

describe('CrearSupervisorAdminComponent', () => {
  let component: CrearSupervisorAdminComponent;
  let fixture: ComponentFixture<CrearSupervisorAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearSupervisorAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearSupervisorAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
