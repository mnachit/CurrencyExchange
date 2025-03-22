import { User } from '../models/User';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../services/alert.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { ReportsService } from '../reports.service';
import { recentReports } from '../models/recentReports';

declare var bootstrap: any;

// Define confirmation options interface
interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'primary' | 'danger' | 'warning' | 'success' | 'info';
  action?: string;
  data?: any;
}

@Component({
  selector: 'app-customers',
  standalone: false,
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  // Customer data
  customers: User[] = [];
  filteredCustomers: User[] = [];
  selectedCustomer: User | null = null;
  selectedCustomers: User[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  paginationInfo = {
    from: 0,
    to: 0,
    total: 0
  };

  // Filters
  searchTerm: string = '';
  roleFilter: string = 'all';
  statusFilter: string = 'all';

  // Statistics
  totalCustomers: number = 0;
  activeCustomers: number = 0;
  adminUsers: number = 0;
  regularUsers: number = 0;

  // Form
  customerForm: FormGroup;
  formMode: 'add' | 'edit' = 'add';
  editingCustomerId: number | null = null;
  loading: boolean = false;

  // Confirmation modal
  confirmationOptions: ConfirmationOptions | null = null;
  confirmationModal: any;
  confirmationResolve: ((value: boolean) => void) | null = null;

  // Available user roles
  availableRoles = [
    { id: 'ADMIN', name: 'Administrator' },
    { id: 'MANAGER', name: 'Manager' },
  ];

  // Recent activities log
  recentActivities: any[] = [];
  recentReportsWithType() {
    this.reportsService.recentReportsWithType("User").subscribe(
      (res) => {
        this.recentActivities = res.result;
      },
      (err) => {
        console.error(err);
      }
    );
  }
  // recentActivities1: any[] = [
  //   {
  //     action: 'User Created',
  //     description: 'New user Ahmed Mohammed was created',
  //     time: new Date(),
  //     type: 'success',
  //     icon: 'fa-user-plus'
  //   },
  //   {
  //     action: 'Role Changed',
  //     description: 'Sara Abdullah role changed to Manager',
  //     time: new Date(new Date().getTime() - 30 * 60000),
  //     type: 'primary',
  //     icon: 'fa-user-shield'
  //   },
  //   {
  //     action: 'Password Reset',
  //     description: 'Password reset for Khalid Omar',
  //     time: new Date(new Date().getTime() - 60 * 60000),
  //     type: 'info',
  //     icon: 'fa-key'
  //   },
  //   {
  //     action: 'User Deleted',
  //     description: 'Mohammed Ali was removed',
  //     time: new Date(new Date().getTime() - 2 * 60 * 60000),
  //     type: 'danger',
  //     icon: 'fa-user-times'
  //   }
  // ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private alertService: AlertService,
    private userService: UserService,
    private reportsService: ReportsService
  ) {
    this.customerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['customer', Validators.required],
      status: [true, Validators.required],
      phoneNumber: ['', Validators.pattern('^[0-9+\\s-]{8,15}$')],
      address: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.getListUser();

    this.recentReportsWithType();

    // Initialize modals
    document.addEventListener('DOMContentLoaded', () => {
      const customerModal = document.getElementById('customerModal');
      if (customerModal) {
        new bootstrap.Modal(customerModal);
      }

      const viewCustomerModal = document.getElementById('viewCustomerModal');
      if (viewCustomerModal) {
        new bootstrap.Modal(viewCustomerModal);
      }

      // Initialize confirmation modal
      const modalElement = document.getElementById('confirmationModal');
      if (modalElement) {
        this.confirmationModal = new bootstrap.Modal(modalElement);

        // Listen for modal hidden event to handle cancel action
        modalElement.addEventListener('hidden.bs.modal', () => {
          if (this.confirmationResolve) {
            this.confirmationResolve(false);
            this.confirmationResolve = null;
          }
        });
      }
    });
  }

  // Helper methods for confirmation modal
  getConfirmationIcon(): string {
    if (!this.confirmationOptions || !this.confirmationOptions.type) {
      return 'fa-question-circle';
    }

    switch (this.confirmationOptions.type) {
      case 'danger': return 'fa-exclamation-triangle';
      case 'warning': return 'fa-exclamation-circle';
      case 'success': return 'fa-check-circle';
      case 'info': return 'fa-info-circle';
      default: return 'fa-question-circle';
    }
  }

  getConfirmButtonIcon(): string {
    if (!this.confirmationOptions) {
      return 'fa-check me-1';
    }

    switch (this.confirmationOptions.action) {
      case 'delete': return 'fa-trash me-1';
      case 'activate': return 'fa-check-circle me-1';
      case 'deactivate': return 'fa-ban me-1';
      default: return 'fa-check me-1';
    }
  }

  // Show confirmation modal and return promise
  showConfirmationModal(options: ConfirmationOptions): Promise<boolean> {
    this.confirmationOptions = options;

    // Show modal
    if (this.confirmationModal) {
      this.confirmationModal.show();
    }

    // Return promise that resolves when user makes a choice
    return new Promise<boolean>((resolve) => {
      this.confirmationResolve = resolve;
    });
  }

  // Confirmation modal button handlers
  onConfirm(): void {
    if (this.confirmationModal) {
      this.confirmationModal.hide();
    }

    if (this.confirmationResolve) {
      this.confirmationResolve(true);
      this.confirmationResolve = null;
    }
  }

  onCancel(): void {
    if (this.confirmationResolve) {
      this.confirmationResolve(false);
      this.confirmationResolve = null;
    }
  }

  getListUser(): void {
    this.userService.getListUser().subscribe(
      (res) => {
        this.customers = res.result;

        this.calculateStatistics();
        this.applyFilters();
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.loading = false;
      }
    );
  }

  loadCustomers(): void {
    this.loading = true;

    // In a real app, this would be a service call to your API
    // For now, we'll populate with static data
    setTimeout(() => {
      this.userService.getListUser().subscribe(
        (res) => {
          this.customers = res.result;
          this.calculateStatistics();
          this.applyFilters();
          this.getListUser();

          this.recentReportsWithType();
          this.loading = false;
        },
        (err) => {
          console.error(err);
          this.loading = false;
        }
      );
      this.loading = false;
    }, 500);
  }

  calculateStatistics(): void {
    console.log("this.customers", this.customers);

    this.totalCustomers = this.customers.length;
    this.activeCustomers = this.customers.filter(c => c.active).length;
    this.adminUsers = this.customers.filter(c => c.role === 'ADMIN').length;
    this.regularUsers = this.customers.filter(c => c.role === 'MANAGER').length;
  }

  applyFilters(): void {
    // Apply search filter
    let filtered = this.customers;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.fullName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.phoneNumber && c.phoneNumber.toLowerCase().includes(term))
      );
    }

    // Apply role filter
    if (this.roleFilter !== 'all') {
      filtered = filtered.filter(c => c.role === this.roleFilter);
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter(c => c.status === isActive);
    }

    // Update pagination info
    this.paginationInfo.total = filtered.length;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);

    // Get items for current page
    const startItem = (this.currentPage - 1) * this.itemsPerPage;
    const endItem = Math.min(startItem + this.itemsPerPage, filtered.length);

    this.paginationInfo.from = filtered.length > 0 ? startItem + 1 : 0;
    this.paginationInfo.to = endItem;

    this.filteredCustomers = filtered.slice(startItem, endItem);

    // Clear selection when filters change
    this.selectedCustomers = [];
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onRoleChange(role: string): void {
    this.roleFilter = role;
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusChange(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.roleFilter = 'all';
    this.statusFilter = 'all';
    this.currentPage = 1;
    this.applyFilters();
  }

  showAddCustomerModal(): void {
    this.formMode = 'add';
    this.resetForm();

    // Show Modal
    const modal = new bootstrap.Modal(document.getElementById('customerModal'));
    modal.show();
  }

  showEditCustomerModal(customer: User): void {
    this.formMode = 'edit';
    this.editingCustomerId = customer.id || null;

    this.customerForm.patchValue({
      fullName: customer.fullName,
      email: customer.email,
      role: customer.role,
      status: customer.active,
      phoneNumber: customer.phoneNumber || '',
      address: customer.address || '',
      notes: customer.notes || ''
    });

    console.log("customer", customer);

    this.customerForm.get('password')?.clearValidators();
    this.customerForm.get('password')?.updateValueAndValidity();

    // Show Modal
    const modal = new bootstrap.Modal(document.getElementById('customerModal'));
    modal.show();
  }

  viewCustomerDetails(customer: User): void {
    this.selectedCustomer = customer;

    // Show Modal
    const modal = new bootstrap.Modal(document.getElementById('viewCustomerModal'));
    modal.show();
  }

  saveCustomer(): void {
    if (this.customerForm.valid) {
      this.loading = true;
      setTimeout(() => {
        if (this.formMode === 'add') {
          // Create new customer
          const newCustomer: User = {
            fullName: this.customerForm.value.fullName,
            email: this.customerForm.value.email,
            password: this.customerForm.value.password, // In real app, this would be handled securely
            role: this.customerForm.value.role,
            status: this.customerForm.value.status,
            phoneNumber: this.customerForm.value.phoneNumber || '',
            address: this.customerForm.value.address || '',
            notes: this.customerForm.value.notes || '',
            createdAt: new Date(),
            lastActive: new Date()
          };

          this.userService.saveUser(newCustomer).subscribe(
            (res) => {
              this.customers.push(res.result);
              this.alertService.success(`User ${newCustomer.fullName} created successfully`);
              this.loadCustomers();
              // Add to activity log
              // this.addActivity('User Created', `New user ${newCustomer.fullName} was created`, 'success', 'fa-user-plus');
            },
            (err) => {
              console.error(err);
            }
          );
        } else if (this.editingCustomerId) {
          // Update existing customer
          const index = this.customers.findIndex(c => c.id === this.editingCustomerId);
          if (index !== -1) {
            const updatedCustomer = {
              ...this.customers[index],
              fullName: this.customerForm.value.fullName,
              email: this.customerForm.value.email,
              role: this.customerForm.value.role,
              status: this.customerForm.value.status,
              phoneNumber: this.customerForm.value.phoneNumber || '',
              address: this.customerForm.value.address || '',
              notes: this.customerForm.value.notes || ''
            };


            // Only update password if provided
            if (this.customerForm.value.password) {
              updatedCustomer.password = this.customerForm.value.password;
            }

            this.customers[index] = updatedCustomer;



            this.userService.updateUser(updatedCustomer).subscribe(
              (res) => {
                this.customers.push(res.result);
                this.alertService.success(`User ${updatedCustomer.fullName} updated successfully`);
                this.loadCustomers();
                // Add to activity log
                // this.addActivity('User Created', `New user ${newCustomer.fullName} was created`, 'success', 'fa-user-plus');
              },
              (err) => {
                console.error(err);
              }
            );
          }
        }

        // Refresh data
        this.calculateStatistics();
        this.applyFilters();
        this.loading = false;

        // Close modal
        document.getElementById('customerModal')?.querySelector('.btn-close')?.dispatchEvent(new Event('click'));
      }, 500);
    } else {
      // Mark all controls as touched to trigger validation messages
      Object.keys(this.customerForm.controls).forEach(key => {
        this.customerForm.get(key)?.markAsTouched();
      });
    }
  }

  async deleteCustomer(customer: User): Promise<void> {
    const confirmed = await this.showConfirmationModal({
      title: 'Delete User',
      message: `Are you sure you want to delete the user "${customer.fullName}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      action: 'delete'
    });

    if (confirmed) {
      this.loading = true;

      setTimeout(() => {
        // Remove customer from array
        this.customers = this.customers.filter(c => c.id !== customer.id);

        // Refresh data
        this.calculateStatistics();
        this.applyFilters();
        this.loading = false;

        this.alertService.success(`User ${customer.fullName} deleted successfully`);
        this.getListUser();

        this.recentReportsWithType();

        // Add to activity log
        // this.addActivity('User Deleted', `User ${customer.fullName} was removed`, 'danger', 'fa-user-times');
      }, 500);
    } else {
      console.log('Delete operation canceled');
    }
  }

  async resetPassword(customer: User): Promise<void> {
    const confirmed = await this.showConfirmationModal({
      title: 'Reset Password',
      message: `Are you sure you want to reset the password for "${customer.fullName}"?`,
      confirmText: 'Reset',
      cancelText: 'Cancel',
      type: 'warning',
      action: 'reset-password'
    });

    if (confirmed) {
      this.loading = true;

      setTimeout(() => {
        // In a real app, this would call an API to reset the password
        this.loading = false;
        this.alertService.success(`Password for ${customer.fullName} has been reset`);
        this.getListUser();

        this.recentReportsWithType();

        // Add to activity log
        // this.addActivity('Password Reset', `Password reset for ${customer.fullName}`, 'info', 'fa-key');
      }, 500);
    } else {
      console.log('Password reset canceled');
    }
  }

  async changeRole(customer: User, newRole: string): Promise<void> {
    const confirmed = await this.showConfirmationModal({
      title: 'Change Role',
      message: `Are you sure you want to change ${customer.fullName}'s role to ${this.getRoleName(newRole)}?`,
      confirmText: 'Change',
      cancelText: 'Cancel',
      type: 'primary',
      action: 'change-role'
    });

    if (confirmed) {
      this.loading = true;

      setTimeout(() => {
        // Update customer role
        const index = this.customers.findIndex(c => c.id === customer.id);
        if (index !== -1) {
          const oldRole = this.customers[index].role;
          this.customers[index].role = newRole;

          // Refresh data
          this.calculateStatistics();
          this.applyFilters();
          this.loading = false;
          this.getListUser();

          this.recentReportsWithType();

          this.alertService.success(`${customer.fullName}'s role changed to ${this.getRoleName(newRole)}`);

          // Add to activity log
          // this.addActivity('Role Changed', `${customer.fullName}'s role changed from ${oldRole} to ${this.getRoleName(newRole)}`, 'primary', 'fa-user-shield');
        }
      }, 500);
    } else {
      console.log('Role change canceled');
    }
  }

  async toggleStatus(customer: User): Promise<void> {
    const newStatus = !customer.status;
    const statusText = newStatus ? 'activate' : 'deactivate';

    const confirmed = await this.showConfirmationModal({
      title: `${newStatus ? 'Activate' : 'Deactivate'} User`,
      message: `Are you sure you want to ${statusText} ${customer.fullName}?`,
      confirmText: newStatus ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      type: newStatus ? 'success' : 'warning',
      action: newStatus ? 'activate' : 'deactivate'
    });

    if (confirmed) {
      this.loading = true;

      setTimeout(() => {
        // Update customer status
        const index = this.customers.findIndex(c => c.id === customer.id);
        if (index !== -1) {
          this.customers[index].status = newStatus;
          const statusLabel = newStatus ? 'active' : 'inactive';

          // Refresh data
          this.calculateStatistics();
          this.applyFilters();
          this.loading = false;

          this.alertService.success(`${customer.fullName} is now ${statusLabel}`);

          // Add to activity log
          // this.addActivity('Status Changed', `${customer.fullName} is now ${statusLabel}`, newStatus ? 'success' : 'warning', newStatus ? 'fa-check-circle' : 'fa-ban');
        }
      }, 500);
    } else {
      console.log('Status change canceled');
    }
  }

  // Helper Methods
  getRoleName(roleId: string): string {
    const role = this.availableRoles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-info';
      case 'MANAGER': return 'bg-warning';
      case 'operator': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusBadgeClass(status: boolean): string {
    return status ? 'bg-success' : 'bg-secondary';
  }

  // Get user initials for avatar
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  resetForm(): void {
    this.customerForm.reset({
      fullName: '',
      email: '',
      password: '',
      role: 'customer',
      status: true,
      phoneNumber: '',
      address: '',
      notes: ''
    });

    // For add mode, make password required again
    this.customerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.customerForm.get('password')?.updateValueAndValidity();

    this.editingCustomerId = null;
  }

  goToPage(page: number | string): void {
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;

    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= this.totalPages) {
      this.currentPage = pageNum;
      this.applyFilters();
    }
  }

  // Creates smart pagination array with ellipsis
  getPaginationArray(): (number | string)[] {
    if (this.totalPages <= 7) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    if (this.currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current page
    const startPage = Math.max(2, this.currentPage - 1);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (this.currentPage < this.totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    pages.push(this.totalPages);

    return pages;
  }

  // Selection methods
  toggleSelect(customer: User): void {
    if (this.isSelected(customer)) {
      this.selectedCustomers = this.selectedCustomers.filter(c => c.id !== customer.id);
    } else {
      this.selectedCustomers.push(customer);
    }
  }

  isSelected(customer: User): boolean {
    return this.selectedCustomers.some(c => c.id === customer.id);
  }

  toggleSelectAll(): void {
    if (this.areAllSelected()) {
      this.selectedCustomers = [];
    } else {
      this.selectedCustomers = [...this.filteredCustomers];
    }
  }

  areAllSelected(): boolean {
    return this.filteredCustomers.length > 0 &&
      this.selectedCustomers.length === this.filteredCustomers.length;
  }

  // Bulk actions
  async bulkAction(action: string): Promise<void> {
    if (this.selectedCustomers.length === 0) {
      return;
    }

    let confirmed = false;

    switch (action) {
      case 'export':
        // In a real app, this would generate a CSV/Excel file
        alert(`Exporting ${this.selectedCustomers.length} users...`);
        break;

      case 'delete':
        confirmed = await this.showConfirmationModal({
          title: 'Delete Users',
          message: `Are you sure you want to delete ${this.selectedCustomers.length} users?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          type: 'danger',
          action: 'delete'
        });

        if (confirmed) {
          this.loading = true;

          try {
            // Get the IDs, filtering out any undefined values
            const userIds = this.selectedCustomers
              .map(c => c.id)
              .filter((id): id is number => id !== undefined);

            // Call the service and wait for it to complete
            await this.userService.deleteUser(userIds).toPromise();

            // Reload the user list from server
            await this.getListUserAsync();

            // Show success message
            this.alertService.success(`${this.selectedCustomers.length} users deleted successfully`);

            // Clear selection after successful operation
            this.selectedCustomers = [];
          } catch (err) {
            console.error(err);
            this.alertService.error('Failed to delete users');
          } finally {
            this.loading = false;
          }
        }
        break;

      case 'activate':
        confirmed = await this.showConfirmationModal({
          title: 'Activate Users',
          message: `Are you sure you want to activate ${this.selectedCustomers.length} users?`,
          confirmText: 'Activate',
          cancelText: 'Cancel',
          type: 'success',
          action: 'activate'
        });

        if (confirmed) {
          this.loading = true;

          try {
            const userIds = this.selectedCustomers
              .map(c => c.id)
              .filter((id): id is number => id !== undefined);

            // Call the service and wait for it to complete
            await this.userService.changeStatus(userIds, "active").toPromise();

            // Reload the user list from server
            await this.getListUserAsync();

            // Show success message
            this.alertService.success(`${this.selectedCustomers.length} users activated successfully`);

            // Clear selection after successful operation
            this.selectedCustomers = [];
          } catch (err) {
            console.error(err);
            this.alertService.error('Failed to activate users');
          } finally {
            this.loading = false;
          }
        }
        break;

      case 'deactivate':
        confirmed = await this.showConfirmationModal({
          title: 'Deactivate Users',
          message: `Are you sure you want to deactivate ${this.selectedCustomers.length} users?`,
          confirmText: 'Deactivate',
          cancelText: 'Cancel',
          type: 'warning',
          action: 'deactivate'
        });

        if (confirmed) {
          this.loading = true;

          try {
            const userIds = this.selectedCustomers
              .map(c => c.id)
              .filter((id): id is number => id !== undefined);

            // Call the service and wait for it to complete
            await this.userService.changeStatus(userIds, "locked").toPromise();

            // Reload the user list from server
            await this.getListUserAsync();

            // Show success message
            this.alertService.success(`${this.selectedCustomers.length} users activated successfully`);

            // Clear selection after successful operation
            this.selectedCustomers = [];
          } catch (err) {
            console.error(err);
            this.alertService.error('Failed to activate users');
          } finally {
            this.loading = false;
          }
        }
        break;

        break;
    }
  }

  // Add this helper method to properly await the getListUser call
  async getListUserAsync(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getListUser().subscribe(
        (res) => {
          this.customers = res.result;
          this.calculateStatistics();
          this.applyFilters();
          this.recentReportsWithType();
          resolve();
        },
        (err) => {
          console.error(err);
          reject(err);
        }
      );
    });
  }

  addActivity(action: string, description: string, type: string, icon: string): void {
    this.recentActivities.unshift({
      action,
      description,
      time: new Date(),
      type,
      icon
    });

    // Keep only the most recent 10 activities
    if (this.recentActivities.length > 10) {
      this.recentActivities.pop();
    }
  }
}