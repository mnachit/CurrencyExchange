import { TestBed } from '@angular/core/testing';

import { TicketLanguageService } from './ticket-language.service';

describe('TicketLanguageService', () => {
  let service: TicketLanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketLanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
