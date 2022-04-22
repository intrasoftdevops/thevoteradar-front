import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpugnadorHomeComponent } from './impugnador-home.component';

describe('ImpugnadorHomeComponent', () => {
  let component: ImpugnadorHomeComponent;
  let fixture: ComponentFixture<ImpugnadorHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImpugnadorHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpugnadorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
