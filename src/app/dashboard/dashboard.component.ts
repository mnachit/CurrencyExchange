import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DashboardStats } from '../models/DashboardStats.model';
import { Transaction } from '../models/transaction.model';
import { Currency } from '../models/currency.model';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  today: Date = new Date();
  loading: boolean = true;
  refreshInterval: any;

  // User greeting based on time of day
  greeting: string = '';

  // Dashboard statistics with improved data
  stats: DashboardStats = {
    availableFunds: 124750,
    totalExchanges: 432,
    activeLoans: 26380,
    todayProfit: 2148,
    fundsTrend: 12.5,
    exchangesTrend: 8.3,
    loansTrend: -3.2,
    profitTrend: 15.7
  };

  stats1: DashboardStats[] = []

  getDashboardStats(){
    this.dashbordService.getDashboardStats().subscribe((response) => {
      this.stats1 = response.result
      console.log(this.stats1);
    }
    );
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
  recentTransactions: Transaction[] = [
    {
      id: 'TX123456',
      date: new Date(),
      customerName: 'Ahmed Mohammed',
      fromCurrency: 'USD',
      fromAmount: 2000,
      toCurrency: 'EUR',
      toAmount: 1842.5,
      status: 'completed'
    },
    {
      id: 'TX123455',
      date: new Date(),
      customerName: 'Sara Abdullah',
      fromCurrency: 'EUR',
      fromAmount: 1150,
      toCurrency: 'GBP',
      toAmount: 985.2,
      status: 'completed'
    },
    {
      id: 'TX123454',
      date: new Date(),
      customerName: 'Khalid Omar',
      fromCurrency: 'SAR',
      fromAmount: 8812.5,
      toCurrency: 'USD',
      toAmount: 2350,
      status: 'completed'
    },
    {
      id: 'TX123453',
      date: new Date(Date.now() - 86400000), // yesterday
      customerName: 'Fatima Al-Saud',
      fromCurrency: 'AED',
      fromAmount: 1835,
      toCurrency: 'USD',
      toAmount: 500,
      status: 'completed'
    }
  ];

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
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        data: [65, 85, 45, 70, 90, 65, 75],
        label: 'Transactions',
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      }
    ]
  };

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
  popularCurrencies: Currency[] = [
    {
      code: 'USD',
      name: 'US Dollar',
      flagUrl: 'https://flagcdn.com/w40/us.png',
      buyRate: 1.0000,
      sellRate: 1.0000
    },
    {
      code: 'EUR',
      name: 'Euro',
      flagUrl: 'https://flagcdn.com/w40/eu.png',
      buyRate: 0.9120,
      sellRate: 0.9280
    },
    {
      code: 'GBP',
      name: 'British Pound',
      flagUrl: 'https://flagcdn.com/w40/gb.png',
      buyRate: 0.7850,
      sellRate: 0.7990
    },
    {
      code: 'JPY',
      name: 'Japanese Yen',
      flagUrl: 'https://flagcdn.com/w40/jp.png',
      buyRate: 142.50,
      sellRate: 145.20
    },
    {
      code: 'SAR',
      name: 'Saudi Riyal',
      flagUrl: 'https://flagcdn.com/w40/sa.png',
      buyRate: 3.7500,
      sellRate: 3.7600
    }
  ];

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

  constructor(private dashbordService : DashboardService) { }

  ngOnInit(): void {
    this.loading = true;
    this.getDashboardStats()
    this.setGreeting();

    // Simulate loading data
    setTimeout(() => {
      this.loadDashboardData();
      this.loading = false;
    }, 1000);

    // Set up auto-refresh for rates (every 5 minutes)
    this.refreshInterval = setInterval(() => {
      this.refreshRates();
    }, 300000);
  }

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
    // In a real application, these would be API calls
    this.calculateChartMetrics();
    this.loadTrendData();
    this.checkSystemStatus();
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

    // Simulate API call delay
    setTimeout(() => {
      switch (filter) {
        case 'last7Days':
          this.updateChartData(
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            [65, 85, 45, 70, 90, 65, 75]
          );
          break;
        case 'last30Days':
          this.updateChartData(
            ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            [320, 450, 380, 520]
          );
          break;
        case 'last90Days':
          this.updateChartData(
            ['Jan', 'Feb', 'Mar'],
            [1200, 1350, 1450]
          );
          break;
        case 'thisYear':
          this.updateChartData(
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            [1200, 1350, 1450, 1320, 1580, 1420, 1350, 1580, 1620, 1750, 1820, 1950]
          );
          break;
      }

      this.loading = false;
    }, 600);
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
  getTransactionIcon(transaction: Transaction): string {
    if (transaction.id.includes('TX')) {
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
    if (transaction.id.includes('TX')) {
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