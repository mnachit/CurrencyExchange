import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-receipt-template',
  standalone: false,
  templateUrl: './receipt-template.component.html',
  styleUrl: './receipt-template.component.css'
})
export class ReceiptTemplateComponent implements OnInit {
  @Input() receiptData: any;
  @Input() showActions: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

  printReceipt(): void {
    window.print();
  }

  downloadReceipt(): void {
    // In a real application, this would generate a PDF for download
    alert('Downloading receipt...');
  }
}