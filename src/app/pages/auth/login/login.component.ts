import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isLoading = false;
  errorMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Drop any stale session before attempting a fresh login.
    this.authService.logout();

    const formValue = this.loginForm.getRawValue();
    const email = formValue.email!.trim().toLowerCase();
    const password = formValue.password!;

    this.authService
      .login({
        email,
        password,
      })
      .subscribe({
        next: (response) => {
          this.authService.saveAuthData(response);

          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const safeReturnUrl =
            returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')
              ? returnUrl
              : '/';

          this.router.navigateByUrl(safeReturnUrl);
        },
        error: (err) => {
          console.error('Login failed', err);
          this.isLoading = false;

          if (err?.status === 0) {
            this.errorMessage =
              'Cannot reach the server. Check your connection and try again.';
            return;
          }

          if (err?.status === 401) {
            this.errorMessage = 'Email or password is incorrect.';
            return;
          }

          this.errorMessage = 'Login failed. Please try again.';
        },
      });
  }
}
