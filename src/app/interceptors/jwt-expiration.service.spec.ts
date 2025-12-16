import { TestBed } from '@angular/core/testing';

import { JwtExpirationService } from './jwt-expiration.service';

describe('JwtExpirationService', () => {
  let service: JwtExpirationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JwtExpirationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
