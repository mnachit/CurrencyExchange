// src/app/services/confirmation.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationSubject = new Subject<{id: string, confirmed: boolean}>();
  private activeConfirmations: Map<string, ConfirmationData> = new Map();
  private counter = 0;

  constructor() {}

  // Get a unique ID for each confirmation
  private getNextId(): string {
    return `confirmation-${++this.counter}`;
  }

  // Add a new confirmation request
  confirm(data: ConfirmationData): Promise<boolean> {
    const id = this.getNextId();
    
    // Store the confirmation data with default values
    this.activeConfirmations.set(id, {
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'warning',
      ...data
    });
    
    // Return a promise that resolves when user responds
    return new Promise<boolean>((resolve) => {
      const subscription = this.confirmationSubject
        .subscribe(result => {
          if (result.id === id) {
            resolve(result.confirmed);
            this.activeConfirmations.delete(id);
            subscription.unsubscribe();
          }
        });
    });
  }

  // Get all active confirmations
  getActiveConfirmations(): Map<string, ConfirmationData> {
    return this.activeConfirmations;
  }

  // Respond to a confirmation
  respond(id: string, confirmed: boolean): void {
    this.confirmationSubject.next({ id, confirmed });
  }
}