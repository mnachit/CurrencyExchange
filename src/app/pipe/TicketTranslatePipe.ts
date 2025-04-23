// ticket-translate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { TicketLanguageService } from '../services/ticket-language.service';

@Pipe({
  name: 'ticketTranslate',
  pure: false
})
export class TicketTranslatePipe implements PipeTransform {
  constructor(private ticketLanguageService: TicketLanguageService) {}

  transform(key: string): string {
    return this.ticketLanguageService.translateTicket(key);
  }
}