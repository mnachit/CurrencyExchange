import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  notifications = 3;
  messages = 5;

  searchQuery: string = '';

  showNotifications: boolean = false;
  showMessages: boolean = false;
  showUserMenu: boolean = false;
  fullName?: string;
  role?: string;

  // Mock notification data
  notificationList = [
    {
      id: 1,
      message: 'New exchange rate update available',
      time: new Date(new Date().getTime() - 15 * 60000), // 15 minutes ago
      icon: 'fas fa-sync-alt'
    },
    {
      id: 2,
      message: 'New customer registration: Ahmed M.',
      time: new Date(new Date().getTime() - 45 * 60000), // 45 minutes ago
      icon: 'fas fa-user-plus'
    },
    {
      id: 3,
      message: 'System update completed successfully',
      time: new Date(new Date().getTime() - 120 * 60000), // 2 hours ago
      icon: 'fas fa-check-circle'
    }
  ];

  // Mock message data
  messageList = [
    {
      id: 1,
      sender: 'Sarah',
      content: 'Is the exchange rate for EUR updated?',
      time: new Date(new Date().getTime() - 30 * 60000), // 30 minutes ago
      read: false
    },
    {
      id: 2,
      sender: 'Mohammed',
      content: 'Please check the transaction #45982',
      time: new Date(new Date().getTime() - 50 * 60000), // 50 minutes ago
      read: false
    },
    {
      id: 3,
      sender: 'Khalid',
      content: 'The new report is ready for review',
      time: new Date(new Date().getTime() - 90 * 60000), // 1.5 hours ago
      read: false
    },
    {
      id: 4,
      sender: 'Fatima',
      content: 'When will the system maintenance end?',
      time: new Date(new Date().getTime() - 150 * 60000), // 2.5 hours ago
      read: false
    },
    {
      id: 5,
      sender: 'Omar',
      content: 'Request for new currency pair: CAD/AUD',
      time: new Date(new Date().getTime() - 300 * 60000), // 5 hours ago
      read: false
    }
  ];

  constructor(private router: Router, public authService: AuthService, private tokenService: TokenService) { }

  ngOnInit(): void {
    // Close dropdowns when clicking outside
    document.addEventListener('click', this.closeDropdowns.bind(this));
    this.fullName = this.tokenService.getFullNameUserWithToken() ?? undefined;
    this.role = this.tokenService.getRoleUserWithToken() ?? undefined;
  }

  /**
   * Close all dropdowns when clicking outside
   */
  @HostListener('document:click', ['$event'])
  closeDropdowns(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Only close if clicking outside of any dropdown
    if (!target.closest('.action-item') && !target.closest('.user-dropdown')) {
      this.showNotifications = false;
      this.showMessages = false;
      this.showUserMenu = false;
    }
  }

  /**
   * Toggle notifications dropdown
   */
  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    this.showMessages = false;
    this.showUserMenu = false;
  }

  /**
   * Toggle messages dropdown
   */
  toggleMessages(event: MouseEvent): void {
    event.stopPropagation();
    this.showMessages = !this.showMessages;
    this.showNotifications = false;
    this.showUserMenu = false;
  }

  /**
   * Toggle user menu dropdown
   */
  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
    this.showMessages = false;
  }

  /**
   * Handle search
   */
  onSearch(): void {
    // In a real application, this would trigger a search service
    console.log('Searching for:', this.searchQuery);

    // Navigate to search results (in a real app)
    // this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(): void {
    this.notifications = 0;
  }

  /**
   * Mark all messages as read
   */
  markAllMessagesAsRead(): void {
    this.messages = 0;
  }

  /**
   * Handle logout
   */
  logout(): void {
    this.authService.logout();
  }
}