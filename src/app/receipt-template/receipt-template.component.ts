import { Component, Input, OnInit } from '@angular/core';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-receipt-template',
  standalone: false,
  templateUrl: './receipt-template.component.html',
  styleUrl: './receipt-template.component.css'
})
export class ReceiptTemplateComponent implements OnInit {
  @Input() receiptData: any;
  @Input() showActions: boolean = true;
  nameCompany: string = '';
  addressCompany: string = '';
  phoneCompany: string = '';
  emailCompany: string = '';

  constructor(private token: TokenService) { }

  getNameCompany(): string {
    const company = this.token.getCompanyWithToken();
    return company?.name ?? '';
  }

  getAddressCompany(): string {
    const company = this.token.getCompanyWithToken();
    return company?.address ?? '';
  }

  getPhoneCompany(): string {
    const company = this.token.getCompanyWithToken();
    return company?.phone ?? '';
  }

  ngOnInit(): void {
    this.nameCompany = this.getNameCompany();
    this.addressCompany = this.getAddressCompany();
    this.phoneCompany = this.getPhoneCompany();
  }

  printReceipt(): void {
    window.print();
  }

  downloadReceipt(): void {
    // In a real application, this would generate a PDF for download
    alert('Downloading receipt...');
  }
}