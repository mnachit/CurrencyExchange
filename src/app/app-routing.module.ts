import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExchangeCalculatorComponent } from './exchange-calculator/exchange-calculator.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { CurrencyRatesComponent } from './currency-rates/currency-rates.component';
import { LoanManagementComponent } from './loan-management/loan-management.component';
import { FundsManagementComponent } from './funds-management/funds-management.component';
import { LoginComponent } from './login/login.component';
import { checkTokenGuard } from './Guard/check-token.guard';
import { ReportsComponent } from './reports/reports.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'dashboard', component: DashboardComponent, canActivate: [checkTokenGuard]},
  { path: 'exchange', component: ExchangeCalculatorComponent, canActivate: [checkTokenGuard]},
  { path: 'transactions', component: TransactionHistoryComponent, canActivate: [checkTokenGuard]},
  { path: 'currencies', component: CurrencyRatesComponent, canActivate: [checkTokenGuard]},
  { path: 'loans', component: LoanManagementComponent, canActivate: [checkTokenGuard]},
  { path: 'funds-management', component: FundsManagementComponent, canActivate: [checkTokenGuard]},
  { path: 'reports', component: ReportsComponent, canActivate: [checkTokenGuard]},
  { path: '**', redirectTo: 'dashboard'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
