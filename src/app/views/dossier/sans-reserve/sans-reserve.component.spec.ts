import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SansReserveComponent } from './sans-reserve.component';

describe('SansReserveComponent', () => {
  let component: SansReserveComponent;
  let fixture: ComponentFixture<SansReserveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SansReserveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SansReserveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
