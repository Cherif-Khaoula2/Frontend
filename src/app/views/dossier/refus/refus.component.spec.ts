import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefusComponent } from './refus.component';

describe('RefusComponent', () => {
  let component: RefusComponent;
  let fixture: ComponentFixture<RefusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
