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
import { CustomersComponent } from './customers/customers.component';
import { SettingsComponent } from './settings/settings.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { checkNotTokenGuard } from './Guard/check-Nottoken.guard';

const routes: Routes = [
  // Page d'accueil - accessible à tous
  { path: '', component: WelcomeComponent },
  
  // Page de login - accessible seulement aux utilisateurs non connectés
  { path: 'login', component: LoginComponent, canActivate: [checkNotTokenGuard] },
  
  // Pages protégées - accessibles seulement aux utilisateurs connectés
  { path: 'dashboard', component: DashboardComponent, canActivate: [checkTokenGuard] },
  { path: 'exchange', component: ExchangeCalculatorComponent, canActivate: [checkTokenGuard] },
  { path: 'transactions', component: TransactionHistoryComponent, canActivate: [checkTokenGuard] },
  { path: 'currencies', component: CurrencyRatesComponent, canActivate: [checkTokenGuard] },
  { path: 'loans', component: LoanManagementComponent, canActivate: [checkTokenGuard] },
  { path: 'funds-management', component: FundsManagementComponent, canActivate: [checkTokenGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [checkTokenGuard] },
  { path: 'customers', component: CustomersComponent, canActivate: [checkTokenGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [checkTokenGuard] },
  
  // Redirection par défaut
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }