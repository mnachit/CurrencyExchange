import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ProfileDto } from '../models/ProfileDto';
import { UpdatePasswordRequest } from '../models/UpdatePasswordRequest';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = environment.apiUrl + '/user';

  constructor(private http: HttpClient) { }

  /**
   * Get user settings
   */
  getUserSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getMockUserSettings`).pipe(
      catchError(error => {
        console.error('Error fetching user settings:', error);
        // Return mock data for demo or development purposes
        return of(this.getMockUserSettings());
      })
    );
  }

  getUser(): Observable<{ message: string, result: ProfileDto, errors: string, errorMap: string[] }> {
    return this.http.get<{ message: string, result: ProfileDto, errors: string, errorMap: string[] }>(`${this.apiUrl}/getMockUserSettings`);
  }

  /**
   * Update user profile
   */
  updateProfile(profileData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update`, profileData);
  }

  /**
   * Upload avatar image
   */
  uploadAvatar(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload-avatar`, formData);
  }

  /**
   * Remove avatar image
   */
  removeAvatar(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/remove-avatar`);
  }

  /**
   * Update password and security settings
   */
  updatePassword(securityData: any): Observable<{ message: string, result: UpdatePasswordRequest, errors: string, errorMap: string[] }> {
    return this.http.post<{ message: string, result: UpdatePasswordRequest, errors: string, errorMap: string[] }>(`${this.apiUrl}/update-password`, securityData);
  }

  /**
   * Logout from all devices
   */
  logoutAllDevices(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout-all-devices`, {});
  }

  /**
   * Update appearance settings
   */
  updateAppearance(appearanceData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update-appearance`, appearanceData);
  }

  /**
   * Update notification settings
   */
  updateNotifications(notificationData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update-notifications`, notificationData);
  }

  /**
   * Update language and region settings
   */
  updateLanguageAndRegion(languageData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update-language`, languageData);
  }

  /**
   * Get backup history
   */
  getBackupHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/backup-history`).pipe(
      catchError(error => {
        console.error('Error fetching backup history:', error);
        // Return mock data for demo or development purposes
        return of(this.getMockBackupHistory());
      })
    );
  }

  /**
   * Create a new backup
   */
  createBackup(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-backup`, {});
  }

  /**
   * Restore from a backup
   */
  restoreBackup(backupId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/restore-backup/${backupId}`, {});
  }

  /**
   * Delete a backup
   */
  deleteBackup(backupId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-backup/${backupId}`);
  }

  /**
   * Export data in various formats
   */
  exportData(dataType: string, format: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${dataType}/${format}`, {
      responseType: 'blob'
    });
  }

  /**
   * Get active login sessions
   */
  getActiveSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active-sessions`);
  }

  /**
   * Terminate a specific session
   */
  terminateSession(sessionId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/terminate-session/${sessionId}`);
  }

  /**
   * Update user permissions
   */
  updatePermissions(userId: number, permissions: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update-permissions`, { userId, permissions });
  }

  /**
   * Set up two-factor authentication
   */
  setupTwoFactorAuth(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/setup-2fa`, {});
  }

  /**
   * Verify two-factor authentication
   */
  verifyTwoFactorAuth(code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-2fa`, { code });
  }

  /**
   * Disable two-factor authentication
   */
  disableTwoFactorAuth(password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/disable-2fa`, { password });
  }

  /**
   * Generate recovery codes for two-factor authentication
   */
  generateRecoveryCodes(): Observable<string[]> {
    return this.http.post<string[]>(`${this.apiUrl}/generate-recovery-codes`, {});
  }

  /**
   * Reset or forgot password
   */
  resetPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { email });
  }

  /**
   * Set new password after reset
   */
  setNewPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/set-new-password`, { token, newPassword });
  }

  /**
   * Change email address
   */
  changeEmail(newEmail: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-email`, { newEmail, password });
  }

  /**
   * Verify email change
   */
  verifyEmailChange(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-email-change`, { token });
  }

  /**
   * Get activity logs
   */
  getActivityLogs(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/activity-logs?page=${page}&size=${size}`);
  }

  /**
   * Get system settings
   */
  getSystemSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/system-settings`);
  }

  /**
   * Update system settings
   */
  updateSystemSettings(settings: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update-system-settings`, settings);
  }

  /**
   * ----------------------------------------------------------------
   * Mock data methods for development and demo purposes
   * ----------------------------------------------------------------
   */

  /**
   * Get mock user settings
   */
  private getMockUserSettings(): any {
    return {
      profile: {
        fullName: 'Ahmed Mohammed',
        username: 'ahmed123',
        email: 'ahmed.mohammed@example.com',
        phone: '+966 50 123 4567',
        branchId: 1,
        position: 'Branch Manager',
        bio: 'Experienced branch manager with over 5 years in currency exchange operations.',
        avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg'
      },
      appearance: {
        themeMode: 'light',
        colorScheme: 'default',
        fontSize: 3,
        dashboardView: 'summary',
        layoutDensity: 'comfortable',
        enableAnimations: true,
        showWelcomeScreen: true
      },
      notifications: {
        transactionAlerts: true,
        exchangeRateAlerts: true,
        securityAlerts: true,
        marketingEmails: false,
        desktopNotifications: true,
        soundAlerts: true,
        frequency: 'immediate',
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00'
      },
      language: {
        interfaceLanguage: 'en-US',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12',
        currency: 'USD',
        firstDayOfWeek: '0',
        timezone: 'auto',
        numberFormat: '1,000.00'
      },
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: '2023-08-15T14:30:00Z',
        activeSessions: [
          {
            id: 'sess_12345',
            device: 'Chrome on Windows',
            ipAddress: '192.168.1.1',
            location: 'Riyadh, Saudi Arabia',
            lastActive: '2023-09-28T10:15:00Z',
            isCurrent: true
          },
          {
            id: 'sess_12346',
            device: 'Safari on iPhone',
            ipAddress: '192.168.1.2',
            location: 'Riyadh, Saudi Arabia',
            lastActive: '2023-09-25T08:30:00Z',
            isCurrent: false
          }
        ]
      }
    };
  }

  /**
   * Get mock backup history
   */
  private getMockBackupHistory(): any[] {
    return [
      {
        id: 'backup_123456',
        date: '2023-09-27T14:30:00Z',
        size: '2.4 MB',
        status: 'Completed',
        statusClass: 'success'
      },
      {
        id: 'backup_123455',
        date: '2023-09-20T10:15:00Z',
        size: '2.3 MB',
        status: 'Completed',
        statusClass: 'success'
      },
      {
        id: 'backup_123454',
        date: '2023-09-13T09:45:00Z',
        size: '2.2 MB',
        status: 'Completed',
        statusClass: 'success'
      }
    ];
  }
}