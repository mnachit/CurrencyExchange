// src/app/services/alert.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum AlertType {
  SUCCESS = 'success',
  DANGER = 'danger',
  WARNING = 'warning',
  INFO = 'info'
}

export interface Alert {
  type: AlertType;
  message: string;
  autoClose?: boolean;
  timeout?: number;
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alerts = new BehaviorSubject<Alert[]>([]);
  private counter = 0;

  constructor() { }

  getAlerts(): Observable<Alert[]> {
    return this.alerts.asObservable();
  }

  success(message: string, autoClose = true, timeout = 5000): void {
    
    this.addAlert({
      type: AlertType.SUCCESS,
      message,
      autoClose,
      timeout
    });
  }

  failure(message: string, autoClose = true, timeout = 5000): void {
    this.addAlert({
      type: AlertType.DANGER,
      message,
      autoClose,
      timeout
    });
  }

  warning(message: string, autoClose = true, timeout = 5000): void {
    this.addAlert({
      type: AlertType.WARNING,
      message,
      autoClose,
      timeout
    });
  }

  info(message: string, autoClose = true, timeout = 5000): void {
    this.addAlert({
      type: AlertType.INFO,
      message,
      autoClose,
      timeout
    });
  }

  clear(): void {
    this.alerts.next([]);
  }

  removeAlert(id: number): void {
    const currentAlerts = this.alerts.getValue();
    const filteredAlerts = currentAlerts.filter(alert => alert.id !== id);
    this.alerts.next(filteredAlerts);
  }

  private addAlert(alert: Alert): void {
    alert.id = ++this.counter;
    
    const currentAlerts = this.alerts.getValue();
    this.alerts.next([...currentAlerts, alert]);

    if (alert.autoClose) {
      setTimeout(() => this.removeAlert(alert.id!), alert.timeout);
    }
  }
}