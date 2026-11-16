import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiErrorResponse } from '../../../core/models';

@Component({
  selector: 'app-alert-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (apiError) {
      <div class="banner banner-danger" role="alert">
        <i class="bi bi-exclamation-circle"></i>
        <div class="flex-grow-1">
          <div class="banner-title">
            <span class="mono code">{{ apiError.status || 400 }}</span>
            {{ apiError.error }}
          </div>
          <div class="banner-text">{{ apiError.message }}</div>
          @if (apiError.details) {
            <ul class="banner-list">
              @for (item of objectEntries(apiError.details); track item[0]) {
                <li><span class="mono">{{ item[0] }}</span> — {{ item[1] }}</li>
              }
            </ul>
          }
        </div>
        @if (dismissible) {
          <button type="button" class="btn-close" aria-label="Cerrar" (click)="closed.emit()"></button>
        }
      </div>
    }

    @if (successMessage) {
      <div class="banner banner-success" role="status">
        <i class="bi bi-check-circle"></i>
        <div class="flex-grow-1">
          <div class="banner-text">{{ successMessage }}</div>
        </div>
        @if (dismissible) {
          <button type="button" class="btn-close" aria-label="Cerrar" (click)="closed.emit()"></button>
        }
      </div>
    }
  `,
  styles: [`
    .banner {
      --c: var(--rt-accent);
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      border-radius: 6px;
      border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
      background: color-mix(in srgb, var(--c) 8%, var(--rt-surface));
      font-size: 0.8125rem;
    }
    .banner > i { color: var(--c); font-size: 1rem; margin-top: 0.1rem; }
    .banner-danger { --c: var(--rt-danger); }
    .banner-title { font-weight: 600; color: var(--rt-text); }
    .banner-title .code {
      font-size: 0.6875rem;
      padding: 0.05rem 0.35rem;
      margin-right: 0.35rem;
      border-radius: 3px;
      color: var(--c);
      border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
    }
    .banner-text { color: var(--rt-muted); }
    .banner-list { margin: 0.4rem 0 0; padding-left: 1.1rem; color: var(--rt-muted); }
  `]
})
export class AlertBannerComponent {
  @Input() apiError: ApiErrorResponse | null = null;
  @Input() successMessage: string | null = null;
  @Input() dismissible = true;
  @Output() closed = new EventEmitter<void>();

  objectEntries(obj: Record<string, string>): [string, string][] {
    return Object.entries(obj);
  }
}
