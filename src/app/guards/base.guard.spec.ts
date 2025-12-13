import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { baseGuard } from './base.guard';

describe('baseGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => baseGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
