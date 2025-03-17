import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TransactionService } from '../services/transaction.service';
import { CurrencyService } from '../services/currency.service';
import { Currency } from '../models/currency.model';
import { AlertService } from '../services/alert.service';
import { finalize } from 'rxjs/operators';
import { ReportsService } from '../reports.service';
import { recentReports } from '../models/recentReports';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reportForm: FormGroup;
  currencies: Currency[] = [];
  loading = false;
  generateClicked = false;
  downloadProgress = 0;
  recentReports: recentReports[] = [];

  // Available report types
  reportTypes = [
    { id: 'transactions', name: 'Transactions Report' },
    { id: 'funds', name: 'Funds Management Report' },
    // { id: 'currencies', name: 'Currency Rates Report' },
    { id: 'loans', name: 'Loans Report' },
    // { id: 'profit', name: 'Profit & Loss Report' },
    // { id: 'customer', name: 'Customer Activity Report' },
  ];

  // Available formats
  formats = [
    { id: 'excel', name: 'Excel (.xlsx)', icon: 'fa-file-excel' },
    { id: 'pdf', name: 'PDF (.pdf)', icon: 'fa-file-pdf' },
    { id: 'csv', name: 'CSV (.csv)', icon: 'fa-file-csv' }
  ];

  // Selected report configuration
  selectedReport: any = null;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private currencyService: CurrencyService,
    private reportsService: ReportsService,
    private alertService: AlertService
  ) {
    this.reportForm = this.fb.group({
      reportType: ['transactions'],
      format: ['excel'],
      dateRange: this.fb.group({
        startDate: [this.getDefaultStartDate()],
        endDate: [this.getDefaultEndDate()]
      }),
      currency: ['all'],
      status: ['all'],
      includeDetails: [true]
    });
  }

  ngOnInit(): void {
    this.loadCurrencies();
    this.onReportTypeChange();
    this.loadRecentReports();
  }

  loadRecentReports(): void {
    this.reportsService.getRecentReports().subscribe({
      next: (response) => {
        if (response && response.result) {
          this.recentReports = response.result;
          console.log("Recent reports:", this.recentReports);

        }
      },
      error: (error) => {
        console.error('Error loading recent reports:', error);
      }
    });
  }

  getDefaultStartDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadCurrencies(): void {
    this.currencyService.getCurrencies().subscribe({
      next: (response) => {
        if (response && response.result) {
          this.currencies = response.result;
        }
      },
      error: (error) => {
        console.error('Error loading currencies:', error);
      }
    });
  }

  onReportTypeChange(): void {
    const reportType = this.reportForm.get('reportType')?.value;

    // Configure form based on report type
    switch (reportType) {
      case 'transactions':
        this.selectedReport = {
          title: 'Transactions Report',
          icon: 'fa-exchange-alt',
          description: 'Detailed report of all currency exchange transactions',
          showDateRange: true,
          showCurrency: true,
          showStatus: true,
          showDetails: true,
          previewData: [
            { id: 'TX123456', date: '2025-03-10', customer: 'Ahmed Mohammed', fromCurrency: 'USD', fromAmount: 1000, toCurrency: 'EUR', toAmount: 920, status: 'COMPLETED' },
            { id: 'TX123457', date: '2025-03-11', customer: 'Sara Abdullah', fromCurrency: 'EUR', fromAmount: 500, toCurrency: 'GBP', toAmount: 430, status: 'COMPLETED' },
          ]
        };
        break;

      case 'funds':
        this.selectedReport = {
          title: 'Funds Management Report',
          icon: 'fa-wallet',
          description: 'Report on fund operations and available balances',
          showDateRange: true,
          showCurrency: true,
          showStatus: false,
          showDetails: true,
          previewData: [
            { date: '2025-03-10', operation: 'ADD', currency: 'USD', amount: 5000, notes: 'Initial deposit', balance: 5000 },
            { date: '2025-03-11', operation: 'WITHDRAW', currency: 'USD', amount: 1000, notes: 'ATM withdrawal', balance: 4000 },
          ]
        };
        break;

      // case 'currencies':
      //   this.selectedReport = {
      //     title: 'Currency Rates Report',
      //     icon: 'fa-coins',
      //     description: 'Report on currency exchange rates and their changes',
      //     showDateRange: true,
      //     showCurrency: true,
      //     showStatus: false,
      //     showDetails: false,
      //     previewData: [
      //       { date: '2025-03-10', currency: 'EUR', buyRate: 0.92, sellRate: 0.93, previousBuyRate: 0.91, previousSellRate: 0.92, change: '+1.09%' },
      //       { date: '2025-03-10', currency: 'GBP', buyRate: 0.78, sellRate: 0.79, previousBuyRate: 0.77, previousSellRate: 0.78, change: '+1.29%' },
      //     ]
      //   };
      //   break;

      case 'loans':
        this.selectedReport = {
          title: 'Loans Report',
          icon: 'fa-hand-holding-usd',
          description: 'Report on all loans and their statuses',
          showDateRange: true,
          showCurrency: true,
          showStatus: true,
          showDetails: true,
          previewData: [
            { id: 'LN123', customer: 'Khalid Omar', amount: 5000, currency: 'USD', issueDate: '2025-02-10', dueDate: '2025-05-10', status: 'ACTIVE' },
            { id: 'LN124', customer: 'Fatima Al-Saud', amount: 3000, currency: 'EUR', issueDate: '2025-01-15', dueDate: '2025-04-15', status: 'OVERDUE' },
          ]
        };
        break;

      // case 'profit':
      //   this.selectedReport = {
      //     title: 'Profit & Loss Report',
      //     icon: 'fa-chart-line',
      //     description: 'Financial performance report with profit and loss analysis',
      //     showDateRange: true,
      //     showCurrency: true,
      //     showStatus: false,
      //     showDetails: true,
      //     previewData: [
      //       { date: '2025-03-01', revenue: 12500, expenses: 8200, profit: 4300, transactions: 42 },
      //       { date: '2025-03-02', revenue: 10800, expenses: 7100, profit: 3700, transactions: 38 },
      //     ]
      //   };
      //   break;

      // case 'customer':
      //   this.selectedReport = {
      //     title: 'Customer Activity Report',
      //     icon: 'fa-users',
      //     description: 'Detailed customer transaction and activity report',
      //     showDateRange: true,
      //     showCurrency: false,
      //     showStatus: true,
      //     showDetails: true,
      //     previewData: [
      //       { customer: 'Ahmed Mohammed', totalTransactions: 12, totalVolume: '$15,000', lastTransaction: '2025-03-10', favoredCurrency: 'EUR' },
      //       { customer: 'Sara Abdullah', totalTransactions: 8, totalVolume: '$12,200', lastTransaction: '2025-03-09', favoredCurrency: 'GBP' },
      //     ]
      //   };
      //   break;

      default:
        this.selectedReport = null;
    }
  }

  downloadReport(report: recentReports): void {
    console.log("Downloading report:", report);
    if (this.reportForm.valid) {
      this.loading = true;
      this.downloadProgress = 0;

      const progressInterval = setInterval(() => {
        this.downloadProgress += 10;
        if (this.downloadProgress >= 90) {
          clearInterval(progressInterval);
        }
      }, 300);

      const reportConfig = {
        type: report.reportType,
        format: report.format,
        startDate: report.startDate,
        endDate: report.endDate,
        currency: report.currency,
        status: report.status,
      };

      setTimeout(() => {
        let reportObservable;

        switch (reportConfig.type) {
          case 'transactions':
            reportObservable = this.reportsService.generateTransactionReport(
              reportConfig.format,
              reportConfig.startDate,
              reportConfig.endDate,
              reportConfig.currency,
              reportConfig.status
            );
            break;

          case 'funds':
            reportObservable = this.reportsService.generateFundsReport(
              reportConfig.format,
              reportConfig.startDate,
              reportConfig.endDate,
              reportConfig.currency
            );
            break;

          case 'loans':
            reportObservable = this.reportsService.generateLoansReport(
              reportConfig.format,
              reportConfig.startDate,
              reportConfig.endDate,
              reportConfig.currency,
              reportConfig.status
            );
            break;

          default:
            reportObservable = this.mockExportReport(reportConfig);
        }

        reportObservable.pipe(
          finalize(() => {
            this.loading = false;
            this.downloadProgress = 100;

            setTimeout(() => {
              this.downloadProgress = 0;
              this.generateClicked = false;
            }, 1000);
          })
        ).subscribe({
          next: (blob: Blob) => {
            this.loadRecentReports();
            this.downloadFile(blob, this.getFileName(reportConfig));
            this.alertService.success('Report generated successfully');
          },
        });
      }, 2000);
    }
    
  }

  generateReport(): void {
    this.generateClicked = true;

    if (this.reportForm.valid) {
      this.loading = true;
      this.downloadProgress = 0;

      // Simulate progress
      const progressInterval = setInterval(() => {
        this.downloadProgress += 10;
        if (this.downloadProgress >= 90) {
          clearInterval(progressInterval);
        }
      }, 300);

      const reportConfig = {
        type: this.reportForm.get('reportType')?.value,
        format: this.reportForm.get('format')?.value,
        startDate: this.reportForm.get('dateRange.startDate')?.value,
        endDate: this.reportForm.get('dateRange.endDate')?.value,
        currency: this.reportForm.get('currency')?.value,
        status: this.reportForm.get('status')?.value,
        includeDetails: this.reportForm.get('includeDetails')?.value
      };

      // Call the appropriate service based on report type
      setTimeout(() => {
        let reportObservable;

        switch (reportConfig.type) {
          case 'transactions':
            reportObservable = this.reportsService.generateTransactionReport(
              reportConfig.format,
              reportConfig.startDate,
              reportConfig.endDate,
              reportConfig.currency,
              reportConfig.status
            );
            break;

          case 'funds':
            reportObservable = this.reportsService.generateFundsReport(
              reportConfig.format,
              reportConfig.startDate,
              reportConfig.endDate,
              reportConfig.currency
            );
            break;

          // case 'currencies':
          //   reportObservable = this.reportsService.generateCurrencyRatesReport(
          //     reportConfig.format,
          //     reportConfig.startDate,
          //     reportConfig.endDate,
          //     reportConfig.currency
          //   );
          //   break;

          case 'loans':
            reportObservable = this.reportsService.generateLoansReport(
              reportConfig.format,
              reportConfig.startDate,
              reportConfig.endDate,
              reportConfig.currency,
              reportConfig.status
            );
            break;

          // case 'profit':
          //   reportObservable = this.reportsService.generateProfitLossReport(
          //     reportConfig.format,
          //     reportConfig.startDate,
          //     reportConfig.endDate,
          //     reportConfig.currency
          //   );
          //   break;

          // case 'customer':
          //   reportObservable = this.reportsService.generateCustomerReport(
          //     reportConfig.format,
          //     reportConfig.startDate,
          //     reportConfig.endDate,
          //     reportConfig.status
          //   );
          //   break;

          default:
            // Fallback for testing when the API isn't available
            reportObservable = this.mockExportReport(reportConfig);
        }

        reportObservable.pipe(
          finalize(() => {
            this.loading = false;
            this.downloadProgress = 100;

            // Reset progress after 1 second
            setTimeout(() => {
              this.downloadProgress = 0;
              this.generateClicked = false;
            }, 1000);
          })
        ).subscribe({
          next: (blob: Blob) => {
            this.loadRecentReports();
            this.downloadFile(blob, this.getFileName(reportConfig));
            this.alertService.success('Report generated successfully');
          },
          // error: (error) => {
          //   console.error('Error generating report:', error);
          //   this.alertService.failure('Failed to generate report. Please try again.');
          // }
        });
      }, 2000);
    }
  }

  // Temporary mock function until backend implementation
  mockExportReport(config: any) {
    return this.transactionService.exportTransactions(config.format);
  }

  downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  getFileName(config: any): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const reportType = this.reportTypes.find(r => r.id === config.type)?.name.replace(/\s/g, '_') || config.type;
    const extension = this.getExtension(config.format);

    return `${reportType}_${date}.${extension}`;
  }

  getExtension(format: string): string {
    switch (format) {
      case 'excel': return 'xlsx';
      case 'pdf': return 'pdf';
      case 'csv': return 'csv';
      default: return 'xlsx';
    }
  }

  getFormatIcon(format: string): string {
    const formatObj = this.formats.find(f => f.id === format);
    return formatObj ? formatObj.icon : 'fa-file';
  }

  setPresetDateRange(range: string): void {
    const today = new Date();
    let startDate = new Date();

    switch (range) {
      case 'today':
        startDate = today;
        break;
      case 'yesterday':
        startDate.setDate(today.getDate() - 1);
        break;
      case 'last7days':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'last30days':
        startDate.setDate(today.getDate() - 30);
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        this.reportForm.get('dateRange.endDate')?.setValue(endDate.toISOString().split('T')[0]);
        break;
    }

    this.reportForm.get('dateRange.startDate')?.setValue(startDate.toISOString().split('T')[0]);

    if (range !== 'lastMonth') {
      this.reportForm.get('dateRange.endDate')?.setValue(today.toISOString().split('T')[0]);
    }
  }

  // Helper method to get object keys for the template
  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  printReport(): void {
    window.print();
  }
}