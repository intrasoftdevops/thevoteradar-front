import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownMenuUsersComponent } from './dropdown-menu-users.component';

describe('DropdownMenuUsersComponent', () => {
  let component: DropdownMenuUsersComponent;
  let fixture: ComponentFixture<DropdownMenuUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropdownMenuUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownMenuUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
