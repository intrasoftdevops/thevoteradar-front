import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinadorHomeComponent } from './coordinador-home.component';

describe('CoordinadorHomeComponent', () => {
  let component: CoordinadorHomeComponent;
  let fixture: ComponentFixture<CoordinadorHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoordinadorHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoordinadorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
