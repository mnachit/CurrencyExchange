import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DashboardStats } from '../models/DashboardStats.model';
import { Transaction } from '../models/transaction.model';
import { Currency } from '../models/currency.model';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { CurrencyService } from '../services/currency.service';
import { DashboardService } from '../services/dashboard.service';
import { TransactionService } from '../services/transaction.service';
import { TokenService } from '../services/token.service';
import { TranslatePipe } from '../pipe/translate.pipe';
import { LanguageService } from '../services/language.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule,
    FormsModule, 
    TranslatePipe,
    NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  dashboardStats: DashboardStats = {
    availableFunds: 0,
    fundsTrend: 0,
    totalExchanges: 0,
    exchangesTrend: 0,
    completedTransactions: 0,
    activeLoans: 0,
    loansTrend: 0,
    todayProfit: 0,
    profitTrend: 0
  };

  today: Date = new Date();
  loading: boolean = true;
  refreshInterval: any;
  fullName?: string;
  constructor(private dashboardService: DashboardService, private currencyService: CurrencyService, private transactionService: TransactionService, private tokenService: TokenService,  public languageService: LanguageService) { }

  ngOnInit(): void {
    this.loading = true;
    this.setGreeting();
    this.getCurrencies();
    this.getTransactions();
    this.initializeChartData();
    this.fullName = this.tokenService.getFullNameUserWithToken() ?? undefined;
    

    // Simulate loading data
    setTimeout(() => {
      this.loadDashboardStats
      this.loadDashboardData();
      this.loading = false;
    }, 1000);

    // Set up auto-refresh for rates (every 5 minutes)
    this.refreshInterval = setInterval(() => {
      this.refreshRates();
    }, 300000);


    const savedLanguage = this.languageService.getCurrentLanguage();
    this.languageService.setLanguage(savedLanguage);
  }

  // User greeting based on time of day
  greeting: string = '';

  // Dashboard statistics with improved data
  stats: DashboardStats = {
    availableFunds: 0,
    fundsTrend: 0,
    totalExchanges: 0,
    exchangesTrend: 0,
    activeLoans: 0,
    loansTrend: 0,
    todayProfit: 0,
    completedTransactions: 0,
    profitTrend: 0
  };

  loadDashboardStats(): void {

  }

  // Historical data for mini charts in stat cards
  availableFundsHistory: number[] = [105000, 109000, 113500, 118000, 120500, 122000, 124750];
  exchangesHistory: number[] = [385, 398, 410, 418, 425, 429, 432];
  loansHistory: number[] = [29800, 28900, 28100, 27500, 27000, 26750, 26380];
  profitHistory: number[] = [1850, 1920, 2050, 1980, 2100, 2080, 2148];

  // Currency performance data
  currencyPerformance: any = {
    bestPerforming: { code: 'GBP', change: 1.2 },
    worstPerforming: { code: 'JPY', change: -0.8 }
  };

  // Recent transactions
  recentTransactions: Transaction[] = [];

  getTransactions() {
    this.transactionService.getRecentTransactions().subscribe(data => {
      this.recentTransactions = data.result;
      console.log(this.recentTransactions);

    });
  }

  // Chart configuration with improved styling
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          // drawBorder: false
        },
        ticks: {
          color: '#64748b'
        }
      },
      y: {
        min: 0,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          // drawBorder: false
        },
        ticks: {
          color: '#64748b'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        cornerRadius: 8
      }
    },
    elements: {
      bar: {
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
        borderSkipped: false
      },
      line: {
        tension: 0.4
      }
    }
  };

  public barChartType: ChartType = 'bar';

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Transactions',
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      }
    ]
  };

  initializeChartData(): void {
    // Default to 7 days view
    this.dashboardService.getRecentTransactionsLast7Days().subscribe(
      (response) => {
        if (response && response.result && response.result.length > 0) {
          const chartData = response.result;
          
          // Extract labels and data from API response
          const labels = chartData.map((item: any) => item.days || '');
          const data = chartData.map((item: any) => item.count);
          
          // Update the barChartData
          this.barChartData = {
            labels: labels,
            datasets: [
              {
                data: data,
                label: 'Transactions',
                backgroundColor: 'rgba(59, 130, 246, 0.8)'
              }
            ]
          };
          
          // Update the chart if it exists
          if (this.chart) {
            this.chart.update();
          }
        }
      },
      (error) => {
        console.error('Error loading initial chart data:', error);
        // Set fallback data if API call fails
        this.barChartData = {
          labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          datasets: [
            {
              data: [0, 0, 0, 0, 0, 0, 0],
              label: 'Transactions',
              backgroundColor: 'rgba(59, 130, 246, 0.8)'
            }
          ]
        };
      }
    );
  }

  // Chart metrics
  totalTransactions: number = 495;
  averageTransactionValue: number = 1850;
  peakDay: string = 'Friday';

  // Multiple chart types support
  chartTypes: { id: string, name: string, type: ChartType }[] = [
    { id: 'bar', name: 'Bar Chart', type: 'bar' },
    { id: 'line', name: 'Line Chart', type: 'line' },
    { id: 'doughnut', name: 'Doughnut Chart', type: 'doughnut' }
  ];

  selectedChartType: string = 'bar';

  // Time filter for chart
  timeFilter: string = 'last7Days';

  // Popular currencies
  popularCurrencies: Currency[] = [];

  // Last update timestamp
  lastRateUpdate: Date = new Date();

  // Recent alerts or notifications
  recentAlerts: any[] = [
    { type: 'info', message: 'Exchange rates updated', time: new Date(Date.now() - 30 * 60000) },
    { type: 'warning', message: 'GBP rate volatility detected', time: new Date(Date.now() - 120 * 60000) },
    { type: 'success', message: 'Daily backup completed', time: new Date(Date.now() - 240 * 60000) }
  ];

  // System status indicators
  systemStatus = {
    server: 'operational',
    database: 'operational',
    api: 'operational',
    lastCheck: new Date()
  };

  ngAfterViewInit(): void {
    // Initialize the chart with animations after view is ready
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    // Clear intervals when component is destroyed
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  /**
   * Sets the greeting based on time of day
   */
  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  /**
   * Loads all dashboard data
   */
  loadDashboardData(): void {
    this.dashboardService.getDashboardStats().subscribe(
      (response) => {
        this.dashboardStats = response.result;
        this.loading = false;
        console.log(this.dashboardStats);
      },
      (error) => {
        console.error('Error loading dashboard stats:', error);
        this.loading = false;
      }
    );

    // Load dynamic transaction data for chart based on timeFilter
    this.loadDynamicChartData(this.timeFilter);

    this.loadTrendData();
    this.checkSystemStatus();
  }

  /**
   * Load dynamic transaction data from the API
   */
  loadDynamicChartData(timeFilter: string): void {
    this.loading = true;

    let dayParam: string;

    switch (timeFilter) {
      case 'last7Days':
        dayParam = '7';
        break;
      case 'last30Days':
        dayParam = '30';
        break;
      case 'last90Days':
        dayParam = '90';
        break;
      case 'thisYear':
        dayParam = '365';
        break;
      default:
        dayParam = '7';
    }

    this.dashboardService.getRecentCountTransactionsWithDay(dayParam).subscribe(
      (response) => {
        if (response && response.result) {
          const chartData = response.result;

          // Extract labels and data from the API response
          // Assuming the API returns data in format: [{ day: 'Monday', count: 10 }, ...]
          const labels = chartData.map((item: any) => item.day);
          const data = chartData.map((item: any) => item.count);

          // Update chart with dynamic data
          this.updateChartData(labels, data);
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error loading chart data:', error);
        this.loading = false;

        // Fallback to default data if API call fails
        this.setDefaultChartData(timeFilter);
      }
    );
  }

  /**
   * Set default chart data if API call fails
   */
  setDefaultChartData(filter: string): void {
    interface TransactionData {
      days?: string;
      weeks?: string;
      months?: string;
      count: number;
    }

    switch (filter) {
      case 'last7Days':
        this.dashboardService.getRecentTransactionsLast7Days().subscribe(
          (response) => {
            const labels = response.result.map((item: TransactionData) => item.days);
            const data = response.result.map((item: TransactionData) => item.count);
            this.updateChartData(labels, data);
          },
          (error) => {
            console.error('Error loading 7-day data:', error);
            // Fallback to default values if API fails
            this.updateChartData(
              ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
              [0, 0, 0, 0, 0, 0, 0]
            );
          }
        );
        break;

      case 'last30Days':
        this.dashboardService.getRecentTransactionsLast4Weeks().subscribe(
          (response) => {
            const labels = response.result.map((item: TransactionData) =>
              `Week ${item.weeks?.split('-')[1] || ''}`);
            const data = response.result.map((item: TransactionData) => item.count);
            this.updateChartData(labels, data);
          },
          (error) => {
            console.error('Error loading 4-week data:', error);
            // Fallback to default values if API fails
            this.updateChartData(
              ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              [0, 0, 0, 0]
            );
          }
        );
        break;

      case 'last90Days':
        this.dashboardService.getRecentTransactionsLast3Months().subscribe(
          (response) => {
            const labels = response.result.map((item: TransactionData) => {
              if (item.months) {
                const [year, month] = item.months.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                return date.toLocaleString('default', { month: 'short' });
              }
              return '';
            });
            const data = response.result.map((item: TransactionData) => item.count);
            this.updateChartData(labels, data);
          },
          (error) => {
            console.error('Error loading 3-month data:', error);
            // Fallback to default values if API fails
            this.updateChartData(
              ['Jan', 'Feb', 'Mar'],
              [0, 0, 0]
            );
          }
        );
        break;

      case 'thisYear':
        this.dashboardService.getRecentTransactionsLast12Months().subscribe(
          (response) => {
            const labels = response.result.map((item: TransactionData) => {
              if (item.months) {
                const [year, month] = item.months.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                return date.toLocaleString('default', { month: 'short' });
              }
              return '';
            });
            const data = response.result.map((item: TransactionData) => item.count);
            this.updateChartData(labels, data);
          },
          (error) => {
            console.error('Error loading 12-month data:', error);
            // Fallback to default values if API fails
            this.updateChartData(
              ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            );
          }
        );
        break;
    }
  }

  /**
   * Loads trend data for sparklines
   */
  loadTrendData(): void {
    // In a real app, this would fetch historical data from an API
    console.log('Loading trend data...');
  }

  /**
   * Checks the status of all connected systems
   */
  checkSystemStatus(): void {
    // In a real app, this would check the status of various services
    this.systemStatus.lastCheck = new Date();
  }

  /**
   * Calculate metrics based on chart data
   */
  calculateChartMetrics(): void {
    const data = this.barChartData.datasets[0].data;
    const labels = this.barChartData.labels as string[];

    // Calculate total transactions
    // this.totalTransactions = data.reduce((sum, value) => sum + value, 0);

    // Find peak day
    const maxValue = Math.max(10);
    const maxIndex = data.indexOf(maxValue);
    this.peakDay = labels[maxIndex] || 'Friday';

    // Calculate average transaction value (simulated)
    this.averageTransactionValue = parseFloat((this.totalTransactions * 18.5).toFixed(2));
  }

  /**
   * Updates chart data based on selected time filter
   */
  onTimeFilterChange(filter: string): void {
    this.timeFilter = filter;
    this.loading = true;

    // Clear current chart data before loading new data
    this.updateChartData([], []);

    interface TransactionData {
      days?: string;
      weeks?: string;
      months?: string;
      count: number;
    }

    switch (filter) {
      case 'last7Days':
        this.dashboardService.getRecentTransactionsLast7Days().subscribe(
          (response) => {
            if (response && response.result && response.result.length > 0) {
              const labels = response.result.map((item: TransactionData) => item.days || '');
              const data = response.result.map((item: TransactionData) => item.count);
              this.updateChartData(labels, data);
            } else {
              // No data, show empty chart
              this.updateChartData(
                ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                [0, 0, 0, 0, 0, 0, 0]
              );
            }
            this.loading = false;
          },
          (error) => {
            console.error('Error loading 7-day data:', error);
            this.updateChartData(
              ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
              [0, 0, 0, 0, 0, 0, 0]
            );
            this.loading = false;
          }
        );
        break;

      case 'last30Days':
        this.dashboardService.getRecentTransactionsLast4Weeks().subscribe(
          (response) => {
            if (response && response.result && response.result.length > 0) {
              const labels = response.result.map((item: TransactionData) =>
                `Week ${item.weeks?.split('-')[1] || ''}`);
              const data = response.result.map((item: TransactionData) => item.count);
              this.updateChartData(labels, data);
            } else {
              this.updateChartData(
                ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                [0, 0, 0, 0]
              );
            }
            this.loading = false;
          },
          (error) => {
            console.error('Error loading 4-week data:', error);
            this.updateChartData(
              ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              [0, 0, 0, 0]
            );
            this.loading = false;
          }
        );
        break;

      case 'last90Days':
        this.dashboardService.getRecentTransactionsLast3Months().subscribe(
          (response) => {
            if (response && response.result && response.result.length > 0) {
              const labels = response.result.map((item: TransactionData) => {
                if (item.months) {
                  const [year, month] = item.months.split('-');
                  const date = new Date(parseInt(year), parseInt(month) - 1);
                  return date.toLocaleString('default', { month: 'short' });
                }
                return '';
              });
              const data = response.result.map((item: TransactionData) => item.count);
              this.updateChartData(labels, data);
            } else {
              this.updateChartData(
                ['Jan', 'Feb', 'Mar'],
                [0, 0, 0]
              );
            }
            this.loading = false;
          },
          (error) => {
            console.error('Error loading 3-month data:', error);
            this.updateChartData(
              ['Jan', 'Feb', 'Mar'],
              [0, 0, 0]
            );
            this.loading = false;
          }
        );
        break;

      case 'thisYear':
        this.dashboardService.getRecentTransactionsLast12Months().subscribe(
          (response) => {
            if (response && response.result && response.result.length > 0) {
              const labels = response.result.map((item: TransactionData) => {
                if (item.months) {
                  const [year, month] = item.months.split('-');
                  const date = new Date(parseInt(year), parseInt(month) - 1);
                  return date.toLocaleString('default', { month: 'short' });
                }
                return '';
              });
              const data = response.result.map((item: TransactionData) => item.count);
              this.updateChartData(labels, data);
            } else {
              this.updateChartData(
                ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              );
            }
            this.loading = false;
          },
          (error) => {
            console.error('Error loading 12-month data:', error);
            this.updateChartData(
              ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            );
            this.loading = false;
          }
        );
        break;
    }
  }

  /**
   * Update chart data and recalculate metrics
   */
  updateChartData(labels: string[], data: number[]): void {
    this.barChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          label: 'Transactions',
          backgroundColor: 'rgba(59, 130, 246, 0.8)'
        }
      ]
    };

    // Update the chart
    if (this.chart) {
      this.chart.update();
    }

    // Recalculate metrics
    this.calculateChartMetrics();
  }

  /**
   * Change the chart type
   */
  changeChartType(type: string): void {
    this.selectedChartType = type;
    const chartType = this.chartTypes.find(t => t.id === type);
    if (chartType) {
      this.barChartType = chartType.type;

      // Update specific options based on chart type
      if (type === 'doughnut') {
        this.barChartOptions = {
          ...this.barChartOptions,
          plugins: {
            ...this.barChartOptions!.plugins,
            legend: {
              display: true,
              position: 'right'
            }
          }
        };
      } else {
        this.barChartOptions = {
          ...this.barChartOptions,
          plugins: {
            ...this.barChartOptions!.plugins,
            legend: {
              display: false
            }
          }
        };
      }

      // Update the chart
      if (this.chart) {
        this.chart.update();
      }
    }
  }

  /**
   * Utility function to get the maximum value in an array for sparkline scaling
   */
  getMaxValue(array: number[]): number {
    return Math.max(...array);
  }

  /**
   * Returns appropriate icon for transaction
   */
  /**
 * Returns appropriate icon for transaction
 */
getTransactionIcon(transaction: Transaction): string {
  // Check if transaction is defined and has an id property that's a string
  if (transaction && transaction.id && typeof transaction.id === 'string' && transaction.id.includes('TX')) {
    if (transaction.fromCurrency === 'USD' || transaction.toCurrency === 'USD') {
      return 'fas fa-arrow-up';
    } else {
      return 'fas fa-arrow-down';
    }
  }
  return 'fas fa-hand-holding-usd';
}

/**
 * Returns appropriate icon class for transaction
 */
getTransactionIconClass(transaction: Transaction): string {
  // Check if transaction is defined and has an id property that's a string
  if (transaction && transaction.id && typeof transaction.id === 'string' && transaction.id.includes('TX')) {
    if (transaction.fromCurrency === 'USD' || transaction.toCurrency === 'USD') {
      return 'bg-info-light text-info';
    } else {
      return 'bg-danger-light text-danger';
    }
  }
  return 'bg-warning-light text-warning';
}

  /**
   * Formats amount with currency
   */
  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getCurrencies(): void {
    this.currencyService.getCurrencies().subscribe(data => {
      // Define the currency codes you want to display
      const desiredCurrencies = ['MAD', 'EUR', 'USD', 'JPY', 'SAR'];

      // Filter the currencies to only include the ones in your desired list
      this.popularCurrencies = data.result.filter(currency =>
        desiredCurrencies.includes(currency.code)
      );

      // Optional: Sort them in the exact order you specified
      this.popularCurrencies.sort((a, b) => {
        return desiredCurrencies.indexOf(a.code) - desiredCurrencies.indexOf(b.code);
      });
    });
  }

  /**
   * Refresh currency rates
   */
  refreshRates(): void {
    // Simulate API call to update rates
    this.loading = true;

    setTimeout(() => {
      // Randomly adjust rates slightly
      this.popularCurrencies = this.popularCurrencies.map(currency => ({
        ...currency,
        buyRate: +(currency.buyRate * (1 + (Math.random() * 0.02 - 0.01))).toFixed(4),
        sellRate: +(currency.sellRate * (1 + (Math.random() * 0.02 - 0.01))).toFixed(4)
      }));

      // Update timestamp
      this.lastRateUpdate = new Date();

      // Add new alert
      this.recentAlerts.unshift({
        type: 'info',
        message: 'Exchange rates updated',
        time: new Date()
      });

      // Keep only the most recent 5 alerts
      if (this.recentAlerts.length > 5) {
        this.recentAlerts.pop();
      }

      this.loading = false;
    }, 800);
  }

  /**
   * Simulate a daily financial summary export
   */
  exportSummary(): void {
    // In a real app, this would generate a CSV/PDF report
    alert('Daily summary exported to downloads folder');
  }

  /**
   * Get alert icon based on type
   */
  getAlertIcon(type: string): string {
    switch (type) {
      case 'info': return 'fas fa-info-circle text-info';
      case 'warning': return 'fas fa-exclamation-triangle text-warning';
      case 'success': return 'fas fa-check-circle text-success';
      case 'error': return 'fas fa-times-circle text-danger';
      default: return 'fas fa-bell';
    }
  }

  /**
   * Get system status indicator class
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'operational': return 'text-success';
      case 'degraded': return 'text-warning';
      case 'outage': return 'text-danger';
      default: return '';
    }
  }

  /**
   * Get time period label for display
   */
  getTimeFilterLabel(): string {
    switch (this.timeFilter) {
      case 'last7Days': return 'Last 7 Days';
      case 'last30Days': return 'Last 30 Days';
      case 'last90Days': return 'Last 90 Days';
      case 'thisYear': return 'This Year';
      default: return 'Custom Period';
    }
  }
}