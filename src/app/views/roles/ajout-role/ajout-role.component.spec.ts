import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutRoleComponent } from './ajout-role.component';

describe('AjoutRoleComponent', () => {
  let component: AjoutRoleComponent;
  let fixture: ComponentFixture<AjoutRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjoutRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjoutRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
