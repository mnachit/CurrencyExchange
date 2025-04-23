import { TestBed } from '@angular/core/testing';

import { EmployeeFundsService } from './employee-funds.service';

describe('EmployeeFundsService', () => {
  let service: EmployeeFundsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeFundsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
