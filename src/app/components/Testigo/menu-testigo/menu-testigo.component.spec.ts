import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuTestigoComponent } from './menu-testigo.component';

describe('MenuTestigoComponent', () => {
  let component: MenuTestigoComponent;
  let fixture: ComponentFixture<MenuTestigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuTestigoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuTestigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
