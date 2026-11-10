import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiErrorResponse } from '../../../core/models';

@Component({
  selector: 'app-alert-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (apiError) {
      <div class="alert-eco alert-eco-danger d-flex align-items-start justify-content-between gap-3 mb-3" role="alert">
        <div class="d-flex align-items-start gap-3">
          <div class="alert-icon">
            <i class="bi bi-exclamation-octagon-fill"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
              <span class="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                HTTP {{ apiError.status || 400 }}
              </span>
              <strong class="font-display">{{ apiError.error }}</strong>
            </div>
            <p class="mb-0 small">{{ apiError.message }}</p>
            @if (apiError.details) {
              <ul class="mb-0 mt-1 ps-3 small">
                @for (item of objectEntries(apiError.details); track item[0]) {
                  <li><strong>{{ item[0] }}:</strong> {{ item[1] }}</li>
                }
              </ul>
            }
          </div>
        </div>
        @if (dismissible) {
          <button type="button" class="btn-close" aria-label="Cerrar" (click)="closed.emit()"></button>
        }
      </div>
    }

    @if (successMessage) {
      <div class="alert-eco alert-eco-success d-flex align-items-center justify-content-between gap-3 mb-3" role="status">
        <div class="d-flex align-items-center gap-3">
          <div class="alert-icon success">
            <i class="bi bi-check-circle-fill"></i>
          </div>
          <div>
            <strong class="d-block font-display">Operación exitosa</strong>
            <span class="small">{{ successMessage }}</span>
          </div>
        </div>
        @if (dismissible) {
          <button type="button" class="btn-close" aria-label="Cerrar" (click)="closed.emit()"></button>
        }
      </div>
    }
  `,
  styles: [`
    .alert-eco {
      border-radius: 14px;
      padding: 0.95rem 1.15rem;
      animation: fadeIn 0.2s ease-out;
    }

    .alert-eco-danger {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #7f1d1d;
    }

    .alert-eco-success {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #064e3b;
    }

    .alert-icon {
      font-size: 1.35rem;
      color: #dc2626;
      line-height: 1;
      margin-top: 0.1rem;

      &.success {
        color: #059669;
      }
    }
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

