import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpugnacionesComponent } from './impugnaciones.component';

describe('ImpugnacionesComponent', () => {
  let component: ImpugnacionesComponent;
  let fixture: ComponentFixture<ImpugnacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImpugnacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImpugnacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
