import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTestigoSupervisorComponent } from './crear-testigo-supervisor.component';

describe('CrearTestigoSupervisorComponent', () => {
  let component: CrearTestigoSupervisorComponent;
  let fixture: ComponentFixture<CrearTestigoSupervisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearTestigoSupervisorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearTestigoSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
