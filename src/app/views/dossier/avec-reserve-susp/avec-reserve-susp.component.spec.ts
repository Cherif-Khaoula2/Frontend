import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvecReserveSuspComponent } from './avec-reserve-susp.component';

describe('AvecReserveSuspComponent', () => {
  let component: AvecReserveSuspComponent;
  let fixture: ComponentFixture<AvecReserveSuspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvecReserveSuspComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvecReserveSuspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
