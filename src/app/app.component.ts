import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isMobileMenuOpen = false;
  isFabVisible = true;
  private lastScrollY = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.closeMobileMenu();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
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
}
