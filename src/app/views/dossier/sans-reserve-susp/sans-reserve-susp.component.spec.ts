import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SansReserveSuspComponent } from './sans-reserve-susp.component';

describe('SansReserveSuspComponent', () => {
  let component: SansReserveSuspComponent;
  let fixture: ComponentFixture<SansReserveSuspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SansReserveSuspComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SansReserveSuspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
