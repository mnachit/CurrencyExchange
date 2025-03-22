import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExchangeCalculatorComponent } from './exchange-calculator/exchange-calculator.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { CurrencyRatesComponent } from './currency-rates/currency-rates.component';
// import { LoanManagementComponent } from './loan-management/loan-management.component';
import { ReceiptTemplateComponent } from './receipt-template/receipt-template.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { LoanManagementComponent } from './loan-management/loan-management.component';
import { FundsManagementComponent } from './funds-management/funds-management.component';
import { LoginComponent } from './login/login.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { AlertComponent } from './alert/alert.component';
import { AlertService } from './services/alert.service';
import { ConfirmationService } from './services/confirmation.service';
import { AuthInterceptor } from './auth.interceptor';
import { TokenService } from './services/token.service';
import { ReportsComponent } from './reports/reports.component';
import { CustomersComponent } from './customers/customers.component';
import { SettingsComponent } from './settings/settings.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    // SidebarComponent,
    HeaderComponent,
    DashboardComponent,
    // ExchangeCalculatorComponent,
    TransactionHistoryComponent,
    CurrencyRatesComponent,
    LoanManagementComponent,
    ReceiptTemplateComponent,
    CalculatorComponent,
    AlertComponent,
    ReportsComponent,
    CustomersComponent,
    SettingsComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgChartsModule,
    SidebarComponent,
    ExchangeCalculatorComponent,
    CommonModule,
    FormsModule,
    CommonModule,
    FundsManagementComponent,
    LoginComponent,
  ],
  providers: [
    AlertService,
    ConfirmationService,
    TokenService,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
