import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  // Active tab
  activeTab: string = 'profile';

  // Form groups
  profileForm: FormGroup;
  passwordForm: FormGroup;
  appearanceForm: FormGroup;
  notificationsForm: FormGroup;
  languageForm: FormGroup;

  // UI state
  loading: boolean = false;
  loadingMessage: string = 'Loading settings';
  isUploading: boolean = false;
  avatarUrl: string | null = null;
  lastBackupDate: Date | null = null;
  backupHistory: any[] = [];

  // Password visibility flags
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Password strength
  passwordStrength: number = 0;
  passwordStrengthText: string = '';
  passwordStrengthClass: string = '';
  passwordStrengthIcon: string = '';
  passwordStrengthTextClass: string = '';

  // Theme settings
  colorThemes = [
    { name: 'Default Blue', value: 'default', color: '#1e3a8a' },
    { name: 'Emerald Green', value: 'emerald', color: '#10b981' },
    { name: 'Ruby Red', value: 'ruby', color: '#ef4444' },
    { name: 'Amber Gold', value: 'amber', color: '#f59e0b' },
    { name: 'Indigo', value: 'indigo', color: '#6366f1' },
    { name: 'Purple', value: 'purple', color: '#8b5cf6' },
    { name: 'Teal', value: 'teal', color: '#14b8a6' },
    { name: 'Gray', value: 'gray', color: '#6b7280' }
  ];

  // Mock data for branches
  branches = [
    { id: 'MANAGER', name: 'MANAGER' },
    { id: 'ADMIN', name: 'ADMIN' },
    { id: 'NACHIT', name: 'NACHIT' },
  ];

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private alertService: AlertService
  ) {
    // Initialize forms with default values
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: [''], 
      branch: [''],
      position: [''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required],
      twoFactorEnabled: [false]
    }, { validators: this.passwordMatchValidator });

    this.appearanceForm = this.fb.group({
      themeMode: ['light'],
      colorScheme: ['default'],
      fontSize: [3],
      dashboardView: ['summary'],
      layoutDensity: ['comfortable'],
      enableAnimations: [true],
      showWelcomeScreen: [true]
    });

    this.notificationsForm = this.fb.group({
      transactionAlerts: [true],
      exchangeRateAlerts: [true],
      securityAlerts: [true],
      marketingEmails: [false],
      desktopNotifications: [true],
      soundAlerts: [true],
      notificationFrequency: ['immediate'],
      quietHoursStart: ['22:00'],
      quietHoursEnd: ['07:00']
    });

    this.languageForm = this.fb.group({
      language: ['en-US'],
      dateFormat: ['MM/DD/YYYY'],
      timeFormat: ['12'],
      currency: ['USD'],
      firstDayOfWeek: ['0'],
      timezone: ['auto'],
      numberFormat: ['1,000.00']
    });
  }

  ngOnInit(): void {
    this.loadSettings();
    this.loadBackupHistory();

    // Watch for password changes to calculate strength
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(password => {
      if (password) {
        this.calculatePasswordStrength(password);
      } else {
        this.passwordStrength = 0;
        this.passwordStrengthText = '';
      }
    });

    this.languageForm = this.fb.group({
      language: [this.getSavedLanguage(), Validators.required]
    });
  }

  loadSettings(): void {
    this.loading = true;
    this.loadingMessage = 'Loading your settings';
  
    // First load the user profile data
    this.settingsService.getUser().subscribe({
      next: (response) => {
        if (response && response.result) {
          // Fill profile form with response.result (ProfileDto)
          this.profileForm.patchValue({
            fullName: response.result.fullName || '',
            username: response.result.username || '',
            email: response.result.email || '',
            phone: response.result.phone || response.result.phoneNumber || '',
            role: response.result.role || '',
            position: response.result.address || ''
          });
          // Set avatar URL if available in ProfileDto
          this.avatarUrl = response.result.avatarUrl || null;
          this.loading = false;
        }
        
        // Continue loading other settings
        this.loadOtherSettings();
      },
      error: (error) => {
        console.error('Failed to load user profile:', error);
        this.loading = false;
      }
    });
  }
  
  // Method to load remaining settings
  private loadOtherSettings(): void {
    this.settingsService.getUserSettings().subscribe({
      next: (settings) => {
        // Fill appearance form
        this.appearanceForm.patchValue({
          themeMode: settings.appearance.themeMode,
          colorScheme: settings.appearance.colorScheme,
          fontSize: settings.appearance.fontSize,
          dashboardView: settings.appearance.dashboardView,
          layoutDensity: settings.appearance.layoutDensity,
          enableAnimations: settings.appearance.enableAnimations,
          showWelcomeScreen: settings.appearance.showWelcomeScreen
        });
  
        // Fill notifications form
        this.notificationsForm.patchValue({
          transactionAlerts: settings.notifications.transactionAlerts,
          exchangeRateAlerts: settings.notifications.exchangeRateAlerts,
          securityAlerts: settings.notifications.securityAlerts,
          marketingEmails: settings.notifications.marketingEmails,
          desktopNotifications: settings.notifications.desktopNotifications,
          soundAlerts: settings.notifications.soundAlerts,
          notificationFrequency: settings.notifications.frequency,
          quietHoursStart: settings.notifications.quietHoursStart,
          quietHoursEnd: settings.notifications.quietHoursEnd
        });
  
        // Fill language form
        this.languageForm.patchValue({
          language: settings.language.interfaceLanguage,
          dateFormat: settings.language.dateFormat,
          timeFormat: settings.language.timeFormat,
          currency: settings.language.currency,
          firstDayOfWeek: settings.language.firstDayOfWeek,
          timezone: settings.language.timezone,
          numberFormat: settings.language.numberFormat
        });
  
        // Apply theme settings immediately
        this.applyThemeSettings();
  
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load settings:', error);
        this.loading = false;
      }
    });
  }
  loadBackupHistory(): void {
    this.settingsService.getBackupHistory().subscribe({
      next: (history) => {
        this.backupHistory = history;
        if (history.length > 0) {
          this.lastBackupDate = new Date(history[0].date);
        }
      },
      error: (error) => {
        console.error('Failed to load backup history:', error);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Profile methods
  updateProfile(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.loadingMessage = 'Updating profile information';

      const profileData = {
        fullName: this.profileForm.value.fullName,
        username: this.profileForm.value.username,
        email: this.profileForm.value.email,
        phone: this.profileForm.value.phone,
        branchId: this.profileForm.value.branch,
        position: this.profileForm.value.position,
        bio: this.profileForm.value.bio
      };

      this.settingsService.updateProfile(profileData).subscribe({
        next: (response) => {
          this.alertService.success('Profile information updated successfully.');
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to update profile:', error);
          this.alertService.error('Failed to update profile. Please try again.');
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  resetProfileForm(): void {
    this.loadSettings();
  }

  uploadAvatar(): void {
    // Simulate file input click and upload
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file = (target.files as FileList)[0];

      if (file) {
        this.isUploading = true;

        // Create a FormData object
        const formData = new FormData();
        formData.append('avatar', file);

        this.settingsService.uploadAvatar(formData).subscribe({
          next: (response) => {
            this.avatarUrl = response.avatarUrl;
            this.isUploading = false;
            this.alertService.success('Profile picture updated successfully.');
          },
          error: (error) => {
            console.error('Failed to upload avatar:', error);
            // this.alertService.failure('Failed to upload profile picture. Please try again.');
            this.isUploading = false;
          }
        });
      }
    };
    fileInput.click();
  }

  removeAvatar(): void {
    if (confirm('Are you sure you want to remove your profile picture?')) {
      this.isUploading = true;

      this.settingsService.removeAvatar().subscribe({
        next: () => {
          this.avatarUrl = null;
          this.isUploading = false;
          this.alertService.success('Profile picture removed successfully.');
        },
        error: (error) => {
          console.error('Failed to remove avatar:', error);
          // this.alertService.failure('Failed to remove profile picture. Please try again.');
          this.isUploading = false;
        }
      });
    }
  }

  // Password methods
  updatePassword(): void {
    if (this.passwordForm.valid) {
      this.loading = true;
      this.loadingMessage = 'Updating security settings';

      const securityData = {
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword,
        twoFactorEnabled: this.passwordForm.value.twoFactorEnabled
      };

      this.settingsService.updatePassword(securityData).subscribe({
        next: () => {
          this.alertService.success('Security settings updated successfully.');
          this.passwordForm.patchValue({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to update security settings:', error);
          this.alertService.error('Failed to update security settings. Please try again.');
          // Check for specific error types
          if (error.error && error.error.code === 'INVALID_CURRENT_PASSWORD') {
            // this.alertService.failure('Current password is incorrect. Please try again.');
          } else {
            // this.alertService.failure('Failed to update security settings. Please try again.');
          }

          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  calculatePasswordStrength(password: string): void {
    // Initialize with a basic score
    let strength = 0;

    // Check length
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;

    // Check for different character types
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[@$!%*?&#]/.test(password)) strength += 15;

    // Check for repeated characters or sequences
    if (!/(.)\1{2,}/.test(password)) strength += 15;

    // Set strength properties
    this.passwordStrength = Math.min(strength, 100);

    // Set text and styles based on strength
    if (this.passwordStrength < 40) {
      this.passwordStrengthText = 'Weak';
      this.passwordStrengthClass = 'bg-danger';
      this.passwordStrengthTextClass = 'text-danger';
      this.passwordStrengthIcon = 'fa-times-circle';
    } else if (this.passwordStrength < 70) {
      this.passwordStrengthText = 'Moderate';
      this.passwordStrengthClass = 'bg-warning';
      this.passwordStrengthTextClass = 'text-warning';
      this.passwordStrengthIcon = 'fa-exclamation-circle';
    } else {
      this.passwordStrengthText = 'Strong';
      this.passwordStrengthClass = 'bg-success';
      this.passwordStrengthTextClass = 'text-success';
      this.passwordStrengthIcon = 'fa-check-circle';
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return newPassword && confirmPassword && newPassword !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  }

  logoutAllDevices(): void {
    if (confirm('Are you sure you want to log out from all devices? You will need to log in again on this device.')) {
      this.loading = true;
      this.loadingMessage = 'Logging out from all devices';

      this.settingsService.logoutAllDevices().subscribe({
        next: () => {
          this.loading = false;
          // Redirect to login page or show a message
          window.location.href = '/login';
        },
        error: (error) => {
          console.error('Failed to logout from all devices:', error);
          // this.alertService.failure('Failed to logout from all devices. Please try again.');
          this.loading = false;
        }
      });
    }
  }

  // Appearance methods
  updateAppearance(): void {
    if (this.appearanceForm.valid) {
      this.loading = true;
      this.loadingMessage = 'Updating appearance settings';

      this.settingsService.updateAppearance(this.appearanceForm.value).subscribe({
        next: () => {
          this.alertService.success('Appearance settings updated successfully.');
          this.applyThemeSettings();
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to update appearance settings:', error);
          // this.alertService.failure('Failed to update appearance settings. Please try again.');
          this.loading = false;
        }
      });
    }
  }

  resetAppearanceForm(): void {
    // Reset to default appearance settings
    this.appearanceForm.reset({
      themeMode: 'light',
      colorScheme: 'default',
      fontSize: 3,
      dashboardView: 'summary',
      layoutDensity: 'comfortable',
      enableAnimations: true,
      showWelcomeScreen: true
    });

    // Apply the reset settings
    this.applyThemeSettings();
  }

  applyThemeSettings(): void {
    // Apply theme mode (light/dark)
    if (this.appearanceForm.value.themeMode === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Apply color scheme
    document.documentElement.style.setProperty('--primary-color',
      this.colorThemes.find(t => t.value === this.appearanceForm.value.colorScheme)?.color || '#1e3a8a');

    // Apply font size
    const fontSizeClass = `font-size-${this.appearanceForm.value.fontSize}`;
    document.body.classList.remove('font-size-1', 'font-size-2', 'font-size-3', 'font-size-4', 'font-size-5');
    document.body.classList.add(fontSizeClass);

    // Apply animations setting
    if (!this.appearanceForm.value.enableAnimations) {
      document.body.classList.add('disable-animations');
    } else {
      document.body.classList.remove('disable-animations');
    }
  }

  selectColorScheme(scheme: string): void {
    this.appearanceForm.patchValue({ colorScheme: scheme });
  }

  getFontSizeLabel(size: number): string {
    switch (size) {
      case 1: return 'Extra Small';
      case 2: return 'Small';
      case 3: return 'Medium (Default)';
      case 4: return 'Large';
      case 5: return 'Extra Large';
      default: return 'Medium';
    }
  }

  // Notifications methods
  updateNotifications(): void {
    if (this.notificationsForm.valid) {
      this.loading = true;
      this.loadingMessage = 'Updating notification settings';

      this.settingsService.updateNotifications(this.notificationsForm.value).subscribe({
        next: () => {
          this.alertService.success('Notification settings updated successfully.');
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to update notification settings:', error);
          // this.alertService.failure('Failed to update notification settings. Please try again.');
          this.loading = false;
        }
      });
    }
  }

  resetNotificationsForm(): void {
    // Reset to default notification settings
    this.notificationsForm.reset({
      transactionAlerts: true,
      exchangeRateAlerts: true,
      securityAlerts: true,
      marketingEmails: false,
      desktopNotifications: true,
      soundAlerts: true,
      notificationFrequency: 'immediate',
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00'
    });
  }

  // Language & Region methods
  updateLanguage(): void {
    if (this.languageForm.valid) {
      this.loading = true;
      this.loadingMessage = 'Updating language & region settings';
  
      // Get the selected language value
      const selectedLanguage = this.languageForm.get('language')?.value;
      
      // Save language preference to localStorage
      localStorage.setItem('userLanguage', selectedLanguage);
  
      // Update language on the server
      this.settingsService.updateLanguageAndRegion(this.languageForm.value).subscribe({
        next: () => {
          this.alertService.success('Language & region settings updated successfully.');
          this.loading = false;
          
          // Optionally reload the page to apply language changes
          // window.location.reload();
        },
        error: (error) => {
          console.error('Failed to update language & region settings:', error);
          // Even on API failure, keep the language preference in localStorage
          // this.alertService.failure('Changes saved locally. Server update failed.');
          this.loading = false;
        }
      });
    }
  }
  
  // Helper method to get saved language
  getSavedLanguage(): string {
    const savedLanguage = localStorage.getItem('userLanguage');
    return savedLanguage || 'en-US'; // Default to English (US) if not found
  }
  
  // Reset language form
  resetLanguageForm(): void {
    this.languageForm.patchValue({
      language: 'en-US' // Default language
    });
    // Optionally clear from localStorage
    localStorage.removeItem('userLanguage');
  }

  getCurrentDateFormatSample(): string {
    const today = new Date();
    const format = this.languageForm.value.dateFormat;

    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();

    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return `${month}/${day}/${year}`;
    }
  }

  getCurrentTimeFormatSample(): string {
    const now = new Date();
    const is24Hour = this.languageForm.value.timeFormat === '24';

    if (is24Hour) {
      return now.toLocaleTimeString('en-US', { hour12: false });
    } else {
      return now.toLocaleTimeString('en-US', { hour12: true });
    }
  }

  // Backup & Export methods
  createBackup(): void {
    this.loading = true;
    this.loadingMessage = 'Creating backup';

    this.settingsService.createBackup().subscribe({
      next: (response) => {
        this.alertService.success('Backup created successfully.');
        this.loadBackupHistory();
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to create backup:', error);
        // this.alertService.failure('Failed to create backup. Please try again.');
        this.loading = false;
      }
    });
  }

  restoreBackup(backup: any): void {
    if (confirm(`Are you sure you want to restore from backup dated ${new Date(backup.date).toLocaleString()}? This will overwrite your current data.`)) {
      this.loading = true;
      this.loadingMessage = 'Restoring from backup';

      this.settingsService.restoreBackup(backup.id).subscribe({
        next: () => {
          this.alertService.success('Backup restored successfully. Page will refresh in a moment.');
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        },
        error: (error) => {
          console.error('Failed to restore backup:', error);
          // this.alertService.failure('Failed to restore backup. Please try again.');
          this.loading = false;
        }
      });
    }
  }

  deleteBackup(backup: any): void {
    if (confirm(`Are you sure you want to delete backup dated ${new Date(backup.date).toLocaleString()}? This action cannot be undone.`)) {
      this.loading = true;
      this.loadingMessage = 'Deleting backup';

      this.settingsService.deleteBackup(backup.id).subscribe({
        next: () => {
          this.alertService.success('Backup deleted successfully.');
          this.loadBackupHistory();
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to delete backup:', error);
          // this.alertService.failure('Failed to delete backup. Please try again.');
          this.loading = false;
        }
      });
    }
  }

  exportData(dataType: string, format: string): void {
    this.loading = true;
    this.loadingMessage = `Exporting ${dataType} data`;

    this.settingsService.exportData(dataType, format).subscribe({
      next: (blob) => {
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.alertService.success(`${dataType} data exported successfully.`);
        this.loading = false;
      },
      error: (error) => {
        console.error(`Failed to export ${dataType} data:`, error);
        // this.alertService.failure(`Failed to export ${dataType} data. Please try again.`);
        this.loading = false;
      }
    });
  }

  // Helper methods
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}