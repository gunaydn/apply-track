import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  isLoading = false;
  errorMessage = '';

  registerForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.logout();

    const formValue = this.registerForm.getRawValue();

    this.authService
      .register({
        fullName: formValue.fullName!.trim(),
        email: formValue.email!.trim().toLowerCase(),
        password: formValue.password!,
      })
      .subscribe({
        next: (response) => {
          this.authService.saveAuthData(response);
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Register failed', err);

          if (err?.error?.message === 'Email already exists') {
            this.errorMessage = 'This email is already registered.';
          } else {
            this.errorMessage = 'Account could not be created.';
          }

          this.isLoading = false;
        },
      });
  }
}
