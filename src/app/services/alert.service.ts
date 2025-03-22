// src/app/services/alert.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Alert } from '../models/Alert';

@Injectable({
  providedIn: 'root'
})

export class AlertService {
  private subject = new Subject<Alert>();
  private defaultId = 'default-alert';

  // Enable subscribing to alerts observable
  onAlert(id = this.defaultId): Observable<Alert> {
    return this.subject.asObservable().pipe(
      filter(x => x && x.id === id)
    );
  }

  // Convenience methods
  success(message: string, options?: any) {
    this.alert(new AlertOptions({ ...options, type: 'success', message }));
  }

  error(message: string, options?: any) {
    this.alert(new AlertOptions({ ...options, type: 'danger', message }));
  }

  info(message: string, options?: any) {
    this.alert(new AlertOptions({ ...options, type: 'info', message }));
  }

  warn(message: string, options?: any) {
    this.alert(new AlertOptions({ ...options, type: 'warning', message }));
  }

  // Main alert method
  alert(options: AlertOptions) {
    const alert: Alert = {
      id: options.id || this.defaultId,
      type: options.type || 'info',
      message: options.message,
      autoClose: options.autoClose !== false,
      keepAfterRouteChange: options.keepAfterRouteChange || false,
      fade: options.fade || true
    };

    this.subject.next(alert);
  }

  // Clear alerts
  clear(id = this.defaultId) {
    this.subject.next({ id } as Alert);
  }
}

export class AlertOptions {
  id?: string;
  type?: 'success' | 'info' | 'warning' | 'danger';
  message?: string;
  autoClose?: boolean;
  keepAfterRouteChange?: boolean;
  fade?: boolean;

  constructor(init?: Partial<AlertOptions>) {
    Object.assign(this, init);
  }
}