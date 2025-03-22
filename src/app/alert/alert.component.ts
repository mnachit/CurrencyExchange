import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../services/alert.service';
import { Alert } from '../models/Alert';

@Component({
  selector: 'app-alert',
  standalone: false,
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  alertSubscription!: Subscription;

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    // Subscribe to alert messages
    this.alertSubscription = this.alertService.onAlert()
      .subscribe(alert => {
        // Clear alerts when an empty alert is received
        if (!alert.message) {
          // Filter out alerts without 'keepAfterRouteChange' flag
          this.alerts = this.alerts.filter(x => x.keepAfterRouteChange);

          // Remove 'keepAfterRouteChange' flag on the rest
          this.alerts.forEach(x => x.keepAfterRouteChange = false);
          return;
        }

        // Add alert to array
        this.alerts.push(alert);

        // Auto close alert if required
        if (alert.autoClose) {
          setTimeout(() => this.removeAlert(alert), 5000);
        }
      });
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    this.alertSubscription.unsubscribe();
  }

  removeAlert(alert: Alert) {
    // Remove alert from array
    this.alerts = this.alerts.filter(x => x !== alert);
  }

  cssClass(alert: Alert) {
    if (!alert) return;

    const classes = ['alert', 'alert-dismissible', 'fade', 'show'];

    const alertTypeClass = {
      'success': 'alert-success',
      'info': 'alert-info',
      'warning': 'alert-warning',
      'danger': 'alert-danger'
    }

    if (alert.type) {
      classes.push(alertTypeClass[alert.type]);
    }

    if (alert.fade) {
      classes.push('fade');
    }

    return classes.join(' ');
  }
}