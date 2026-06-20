import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isMobileMenuOpen = false;
  isFabVisible = true;
  hideNavbar = false;
  private lastScrollY = 0;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.closeMobileMenu();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigationEnd = event as NavigationEnd;

        this.hideNavbar = navigationEnd.urlAfterRedirects.startsWith('/auth');

        this.closeMobileMenu();
      });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const currentScrollY = window.scrollY;

    if (currentScrollY > this.lastScrollY + 10) {
      this.isFabVisible = false;
    }

    if (currentScrollY < this.lastScrollY - 10) {
      this.isFabVisible = true;
    }

    if (currentScrollY < 50) {
      this.isFabVisible = true;
    }

    this.lastScrollY = currentScrollY;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/auth/login']);
  }
}
