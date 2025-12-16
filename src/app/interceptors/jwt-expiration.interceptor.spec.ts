import { TestBed } from '@angular/core/testing';

import { JwtExpirationInterceptor } from './jwt-expiration.interceptor';

describe('JwtExpirationInterceptor', () => {
  let service: JwtExpirationInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JwtExpirationInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
