import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTestigoAdminComponent } from './crear-testigo-admin.component';

describe('CrearTestigoAdminComponent', () => {
  let component: CrearTestigoAdminComponent;
  let fixture: ComponentFixture<CrearTestigoAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearTestigoAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearTestigoAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
