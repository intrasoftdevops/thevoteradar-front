import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuImpugnadorComponent } from './menu-impugnador.component';

describe('MenuImpugnadorComponent', () => {
  let component: MenuImpugnadorComponent;
  let fixture: ComponentFixture<MenuImpugnadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuImpugnadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuImpugnadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
