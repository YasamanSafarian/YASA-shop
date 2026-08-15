import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { getErrorMessage } from '../../../shared/utils/errors';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    phone: [
      '',
      [Validators.required, Validators.pattern(/^[0-9+\- ]{6,20}$/)],
    ],
    firstName: ['', [Validators.maxLength(100)]],
    lastName: ['', [Validators.maxLength(100)]],
    email: ['', [Validators.email, Validators.maxLength(255)]],
    password: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(72)],
    ],
  });

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  get phone() {
    return this.form.controls.phone;
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      const value = this.form.getRawValue();
      await this.auth.register({
        phone: value.phone,
        password: value.password,
        ...(value.firstName ? { firstName: value.firstName } : {}),
        ...(value.lastName ? { lastName: value.lastName } : {}),
        ...(value.email ? { email: value.email } : {}),
      });
      await this.router.navigate(['/']);
    } catch (error) {
      this.errorMessage.set(getErrorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
