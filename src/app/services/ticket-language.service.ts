// ticket-language.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketLanguageService {
  // Default ticket language
  private ticketLanguageSubject = new BehaviorSubject<string>(this.getTicketLanguage());
  public ticketLanguage$ = this.ticketLanguageSubject.asObservable();
  
  // Copy of necessary translations
  private translations: { [key: string]: { [key: string]: string } } = {
    'en': {
      //bureau de change english
      'ticket.bureau-title': 'Bureau de Change',
      'ticket.receipt-title': 'Transaction Receipt',
      'ticket.receipt-no': 'Receipt No',
      'ticket.date-time': 'Date & Time',
      'ticket.customer': 'Customer',
      'ticket.id-number': 'ID Number',
      'ticket.from-curr': 'From Currency',
      'ticket.to-curr': 'To Currency',
      'ticket.exch-rate': 'Exchange Rate',
      'ticket.amount': 'Amount',
      'ticket.exch-fee': 'Exchange Fee',
      'ticket.service': 'Service Charge',
      'ticket.total-paid': 'Total Paid',
      'ticket.total-received': 'Total Received',
      'ticket.thanks': 'Thank you for your business!',
      'ticket.terms': 'This receipt is your proof of transaction. Keep it safe for future reference.',
      'ticket.close': 'Close',
      'ticket.print': 'Print',
    },
    'fr': {
      'ticket.bureau-title': 'Bureau de Change ',
      'ticket.receipt-title': 'Reçu de transaction',
      'ticket.receipt-no': 'N° de reçu',
      'ticket.date-time': 'Date et heure',
      'ticket.customer': 'Client',
      'ticket.id-number': 'Numéro d\'ID',
      'ticket.from-curr': 'Devise source',
      'ticket.to-curr': 'Devise cible',
      'ticket.exch-rate': 'Taux de change',
      'ticket.amount': 'Montant',
      'ticket.exch-fee': 'Frais de change',
      'ticket.service': 'Frais de service',
      'ticket.total-paid': 'Total payé',
      'ticket.total-received': 'Total reçu',
      'ticket.thanks': 'Merci pour votre confiance!',
      'ticket.terms': 'Ce reçu est votre preuve de transaction. Conservez-le en lieu sûr pour référence future.',
      'ticket.close': 'Fermer',
      'ticket.print': 'Imprimer',
    },
    'es': {
      'ticket.bureau-title': 'Bureau de Change ',
      'ticket.receipt-title': 'Recibo de transacción',
      'ticket.receipt-no': 'N° de recibo',
      'ticket.date-time': 'Fecha y hora',
      'ticket.customer': 'Cliente',
      'ticket.id-number': 'Número de ID',
      'ticket.from-curr': 'Divisa origen',
      'ticket.to-curr': 'Divisa destino',
      'ticket.exch-rate': 'Tasa de cambio',
      'ticket.amount': 'Cantidad',
      'ticket.exch-fee': 'Comisión de cambio',
      'ticket.service': 'Cargo por servicio',
      'ticket.total-paid': 'Total pagado',
      'ticket.total-received': 'Total recibido',
      'ticket.thanks': '¡Gracias por su preferencia!',
      'ticket.terms': 'Este recibo es su comprobante de transacción. Manténgalo seguro para futuras referencias.',
      'ticket.close': 'Cerrar',
      'ticket.print': 'Imprimir',
    },
    'ar': {
      'ticket.bureau-title': 'Bureau de Change ',
      'ticket.receipt-title': 'إيصال المعاملة',
      'ticket.receipt-no': 'رقم الإيصال',
      'ticket.date-time': 'التاريخ والوقت',
      'ticket.customer': 'العميل',
      'ticket.id-number': 'رقم الهوية',
      'ticket.from-curr': 'من العملة',
      'ticket.to-curr': 'إلى العملة',
      'ticket.exch-rate': 'سعر الصرف',
      'ticket.amount': 'المبلغ',
      'ticket.exch-fee': 'رسوم الصرف',
      'ticket.service': 'رسوم الخدمة',
      'ticket.total-paid': 'إجمالي المدفوع',
      'ticket.total-received': 'إجمالي المستلم',
      'ticket.thanks': 'شكراً لتعاملكم معنا!',
      'ticket.terms': 'هذا الإيصال هو إثبات للمعاملة. يرجى الاحتفاظ به للرجوع إليه في المستقبل.',
      'ticket.close': 'إغلاق',
      'ticket.print': 'طباعة',
    },
    'ita': {
      'ticket.bureau-title': 'Bureau de Change ',
      'ticket.receipt-title': 'Ricevuta di transazione',
      'ticket.receipt-no': 'N° ricevuta',
      'ticket.date-time': 'Data e ora',
      'ticket.customer': 'Cliente',
      'ticket.id-number': 'Numero ID',
      'ticket.from-curr': 'Valuta di origine',
      'ticket.to-curr': 'Valuta di destinazione',
      'ticket.exch-rate': 'Tasso di cambio',
      'ticket.amount': 'Importo',
      'ticket.exch-fee': 'Commissione di cambio',
      'ticket.service': 'Spese di servizio',
      'ticket.total-paid': 'Totale pagato',
      'ticket.total-received': 'Totale ricevuto',
      'ticket.thanks': 'Grazie per il tuo business!',
      'ticket.terms': 'Questa ricevuta è la prova della tua transazione. Conservala al sicuro per riferimenti futuri.',
      'ticket.close': 'Chiudi',
      'ticket.print': 'Stampa',
    }
  };

  constructor() {}

  // Get saved ticket language or use default
  getTicketLanguage(): string {
    return localStorage.getItem('ticketLanguage') || 'en';
  }

  // Save ticket language
  setTicketLanguage(language: string): void {
    localStorage.setItem('ticketLanguage', language);
    this.ticketLanguageSubject.next(language);
  }

  // Translate a key using the ticket language
  translateTicket(key: string): string {
    const ticketLanguage = this.getTicketLanguage();
    
    // Get translations for the current ticket language
    const languageData = this.translations[ticketLanguage] || this.translations['en'];
    
    // Return the translation or key if not found
    return languageData[key] || key;
  }

  // Get available languages
  getAvailableLanguages(): { code: string, name: string }[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'French' },
      { code: 'es', name: 'Spanish' },
      { code: 'ar', name: 'Arabic' },
      { code: 'ita', name: 'Italian' }
    ];
  }
}