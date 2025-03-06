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
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { LoanManagementComponent } from './loan-management/loan-management.component';
import { FundsManagementComponent } from './funds-management/funds-management.component';
import { LoginComponent } from './login/login.component';
import { CalculatorComponent } from './calculator/calculator.component';


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
    // CalculatorComponent,
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
    CalculatorComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
