// src/app/components/confirmation-dialog/confirmation-dialog.component.ts
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ConfirmationData, ConfirmationService } from '../services/confirmation.service';
import * as bootstrap from 'bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: false,
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {
  confirmations: {id: string, data: ConfirmationData}[] = [];
  modalInstance: any = null;
  private checkIntervalId: any = null;
  private modalElement: HTMLElement | null = null;
  private modalListener: (() => void) | null = null;
  private internalAction = false;

  constructor(
    private confirmationService: ConfirmationService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.modalElement = document.getElementById('confirmationModal');
    
    // Añade event listener para cuando el modal se oculta
    if (this.modalElement) {
      this.modalListener = () => {
        if (!this.internalAction) {
          // Si el modal se cerró por el backdrop o la X, cancela el diálogo actual
          if (this.confirmations.length > 0) {
            this.confirmationService.respond(this.confirmations[0].id, false);
          }
        }
        this.modalInstance = null;
        this.internalAction = false;
      };
      
      this.modalElement.addEventListener('hidden.bs.modal', this.modalListener);
    }
    
    // Inicia verificación de confirmaciones activas
    this.startCheckingConfirmations();
  }

  ngOnDestroy(): void {
    // Limpia el intervalo cuando el componente se destruye
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }
    
    // Remueve el event listener
    if (this.modalElement && this.modalListener) {
      this.modalElement.removeEventListener('hidden.bs.modal', this.modalListener);
    }
  }

  startCheckingConfirmations(): void {
    // Usa setInterval en lugar de setTimeout anidados
    this.checkIntervalId = setInterval(() => {
      this.zone.run(() => this.checkForActiveConfirmations());
    }, 100);
  }

  checkForActiveConfirmations(): void {
    const activeConfirmations = this.confirmationService.getActiveConfirmations();
    const previousLength = this.confirmations.length;
    
    this.confirmations = Array.from(activeConfirmations).map(([id, data]) => ({id, data}));
    
    // Solo muestra el modal si no hay uno ya visible y si hay confirmaciones activas
    if (this.confirmations.length > 0 && !this.modalInstance) {
      this.showModal();
    }
    // Si no hay confirmaciones pero hay un modal abierto, ciérralo
    else if (this.confirmations.length === 0 && this.modalInstance) {
      this.internalAction = true;
      this.modalInstance.hide();
      this.modalInstance = null;
    }
  }

  showModal(): void {
    if (this.modalInstance || !this.modalElement) {
      return;
    }
    
    this.zone.run(() => {
      if (this.modalElement) {
        this.modalInstance = new bootstrap.Modal(this.modalElement);
      }
      this.modalInstance.show();
    });
  }

  confirm(id: string): void {
    this.internalAction = true;
    this.confirmationService.respond(id, true);
    
    if (this.modalInstance) {
      this.modalInstance.hide();
      this.modalInstance = null;
    }
  }

  cancel(id: string): void {
    this.internalAction = true;
    this.confirmationService.respond(id, false);
    
    if (this.modalInstance) {
      this.modalInstance.hide();
      this.modalInstance = null;
    }
  }

  getButtonClass(type: string = 'warning'): string {
    switch (type) {
      case 'danger': return 'btn-danger';
      case 'success': return 'btn-success';
      case 'info': return 'btn-info';
      case 'warning': return 'btn-warning';
      default: return 'btn-primary';
    }
  }
}