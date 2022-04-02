import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestigoHomeComponent } from './testigo-home.component';

describe('TestigoHomeComponent', () => {
  let component: TestigoHomeComponent;
  let fixture: ComponentFixture<TestigoHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestigoHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestigoHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
