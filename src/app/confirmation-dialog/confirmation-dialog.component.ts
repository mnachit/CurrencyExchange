// src/app/components/confirmation-dialog/confirmation-dialog.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ConfirmationService, ConfirmationDialogData } from '../services/confirmation.service';

declare var bootstrap: any;

@Component({
  selector: 'app-confirmation-dialog',
  standalone: false,
  templateUrl: './confirmation-dialog.component.html'
})
export class ConfirmationDialogComponent implements OnInit {
  @ViewChild('confirmationModal') modalElement!: ElementRef;
  
  private modalInstance: any;
  
  constructor(private confirmationService: ConfirmationService) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    
    // Listen for dialog data changes
    setInterval(() => {
      if (this.confirmationService.isDialogOpen() && !this.modalElement.nativeElement.classList.contains('show')) {
        this.modalInstance.show();
      }
    }, 100);
    
    // Set up modal hide event listener
    this.modalElement.nativeElement.addEventListener('hidden.bs.modal', () => {
      if (this.confirmationService.isDialogOpen()) {
        this.confirmationService.confirm_response(false);
      }
    });
  }

  get dialogData(): ConfirmationDialogData | null {
    return this.confirmationService.getDialogData();
  }

  onConfirm(): void {
    this.modalInstance.hide();
    this.confirmationService.confirm_response(true);
  }

  onCancel(): void {
    this.modalInstance.hide();
    this.confirmationService.confirm_response(false);
  }
}