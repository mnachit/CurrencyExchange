import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { LanguageService } from '../services/language.service';
import { TranslatePipe } from '../pipe/translate.pipe';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslatePipe],
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isSidebarVisible: boolean = false;
  isSidebarCollapsed: boolean = false;
  screenWidth: number;

  fullName?: string;
  role?: string;
  nameCompany: string = '';

  constructor(private router: Router, private tokenService: TokenService, public languageService: LanguageService) {
    this.screenWidth = window.innerWidth;
    this.checkScreenSize();
  }

  getNameCompany(): string {
    const company = this.tokenService.getCompanyWithToken();
    return company?.name ?? '';
  }

  ngOnInit(): void {
    // Listen for route changes to auto-close sidebar on mobile
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.screenWidth < 992) {
        this.closeSidebar();
      }
    });
    this.role = this.tokenService.getRoleUserWithToken() ?? undefined;
    this.fullName = this.tokenService.getFullNameUserWithToken() ?? undefined;
    this.nameCompany = this.getNameCompany();

    const savedLanguage = this.languageService.getCurrentLanguage();
    this.languageService.setLanguage(savedLanguage);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = event.target.innerWidth;
    this.checkScreenSize();
  }

  /**
   * Check screen size and set appropriate sidebar state
   */
  checkScreenSize(): void {
    if (this.screenWidth >= 992) {
      // On desktop, sidebar is always visible
      this.isSidebarVisible = true;
    } else {
      // On mobile, sidebar is hidden by default
      this.isSidebarVisible = false;
    }
  }

  /**
   * Toggle sidebar visibility
   */
  toggleSidebar(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
    
    // Prevent body scrolling when sidebar is open on mobile
    if (this.isSidebarVisible && this.screenWidth < 992) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  /**
   * Close the sidebar
   */
  closeSidebar(): void {
    if (this.screenWidth < 992) {
      this.isSidebarVisible = false;
      document.body.style.overflow = '';
    }
  }

  /**
   * Toggle sidebar collapsed state (on desktop)
   */
  toggleCollapse(): void {
    if (this.screenWidth >= 992) {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      document.body.classList.toggle('sidebar-collapsed', this.isSidebarCollapsed);
    }
  }

  /**
   * Handle menu item click (for mobile view)
   */
  onMenuItemClick(): void {
    if (this.screenWidth < 992) {
      this.closeSidebar();
    }
  }

  /**
   * Check if the current route is active
   */
  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}