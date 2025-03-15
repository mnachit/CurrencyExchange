// src/app/services/confirmation.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmationDialogData {
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
  private confirmationSubject = new Subject<boolean>();
  private dialogData: ConfirmationDialogData | null = null;
  private isOpen = false;

  constructor() { }

  // Open confirmation dialog and return promise
  confirm(data: ConfirmationDialogData): Promise<boolean> {
    // If a dialog is already open, reject
    if (this.isOpen) {
      return Promise.reject('A dialog is already open');
    }

    this.dialogData = {
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'warning',
      ...data
    };
    
    this.isOpen = true;
    
    // Return promise that resolves when user responds
    return new Promise<boolean>((resolve) => {
      const subscription = this.confirmationSubject.subscribe(result => {
        resolve(result);
        this.isOpen = false;
        this.dialogData = null;
        subscription.unsubscribe();
      });
    });
  }

  // Methods called by the confirmation component
  getDialogData(): ConfirmationDialogData | null {
    return this.dialogData;
  }

  isDialogOpen(): boolean {
    return this.isOpen;
  }

  confirm_response(confirmed: boolean): void {
    this.confirmationSubject.next(confirmed);
  }
}