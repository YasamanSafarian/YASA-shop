import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UiAlertComponent } from '../../../shared/components/ui/ui-alert/ui-alert.component';
import { UiButtonComponent } from '../../../shared/components/ui/ui-button/ui-button.component';
import { UiInputComponent } from '../../../shared/components/ui/ui-input/ui-input.component';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateService } from '../../../core/services/translate.service';
import { getErrorMessage } from '../../../shared/utils/errors';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, UiAlertComponent, UiButtonComponent, UiInputComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly translate = inject(TranslateService);

  readonly identifierForm = this.fb.nonNullable.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],
  });

  readonly resetForm = this.fb.nonNullable.group({
    otp: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(8)],
    ],
    newPassword: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(72)],
    ],
  });

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly sessionId = signal<string | null>(null);

  get identifier() {
    return this.identifierForm.controls.identifier;
  }

  get otp() {
    return this.resetForm.controls.otp;
  }

  get newPassword() {
    return this.resetForm.controls.newPassword;
  }

  onReset() {
    this.sessionId.set(null);
    this.errorMessage.set(null);
    this.resetForm.reset();
  }

  async requestReset(): Promise<void> {
    if (this.identifierForm.invalid) {
      this.identifierForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      const result = await this.auth.forgotPassword(
        this.identifierForm.getRawValue().identifier,
      );
      this.sessionId.set(result.sessionId);
    } catch (error) {
      this.errorMessage.set(getErrorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }

  async submitReset(): Promise<void> {
    const sessionId = this.sessionId();
    if (!sessionId || this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      const value = this.resetForm.getRawValue();
      await this.auth.resetPassword({
        sessionId,
        otp: value.otp.trim(),
        newPassword: value.newPassword,
      });
      await this.router.navigate(['/login']);
    } catch (error) {
      this.errorMessage.set(getErrorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }
}