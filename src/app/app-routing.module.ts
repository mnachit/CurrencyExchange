import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExchangeCalculatorComponent } from './exchange-calculator/exchange-calculator.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { CurrencyRatesComponent } from './currency-rates/currency-rates.component';
import { LoanManagementComponent } from './loan-management/loan-management.component';
import { FundsManagementComponent } from './funds-management/funds-management.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'exchange', component: ExchangeCalculatorComponent },
  { path: 'transactions', component: TransactionHistoryComponent },
  { path: 'currencies', component: CurrencyRatesComponent },
  { path: 'loans', component: LoanManagementComponent },
  { path: 'funds-management', component: FundsManagementComponent },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
