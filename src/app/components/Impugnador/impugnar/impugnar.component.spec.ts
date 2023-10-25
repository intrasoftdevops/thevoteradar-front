import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpugnarComponent } from './impugnar.component';

describe('ImpugnarComponent', () => {
  let component: ImpugnarComponent;
  let fixture: ComponentFixture<ImpugnarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImpugnarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpugnarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
