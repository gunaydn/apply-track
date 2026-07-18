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

    const formValue = this.loginForm.getRawValue();

    this.authService
      .login({
        email: formValue.email!,
        password: formValue.password!,
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
          this.errorMessage = 'Email or password is incorrect.';
          this.isLoading = false;
        },
      });
  }
}
