import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearSupervisorComponent } from './crear-supervisor.component';

describe('CrearSupervisorComponent', () => {
  let component: CrearSupervisorComponent;
  let fixture: ComponentFixture<CrearSupervisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearSupervisorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
