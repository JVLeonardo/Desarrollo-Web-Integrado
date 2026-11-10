import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="eco-card eco-card-interactive h-100 d-flex flex-column justify-content-between" [ngClass]="'accent-' + variant">
      <div>
        <div class="d-flex align-items-center justify-content-between mb-3">
          <span class="stat-label text-uppercase fw-bold">{{ title }}</span>
          <div class="stat-icon" [ngClass]="'icon-' + variant">
            <i class="bi" [ngClass]="icon"></i>
          </div>
        </div>
        <div class="d-flex align-items-baseline gap-2 mb-1">
          <h3 class="stat-value font-display mb-0">{{ value }}</h3>
          @if (suffix) {
            <span class="stat-suffix fw-semibold">{{ suffix }}</span>
          }
        </div>
        @if (subtitle) {
          <p class="stat-subtitle text-muted mb-0">{{ subtitle }}</p>
        }
      </div>

      @if (progress !== null && progress !== undefined) {
        <div class="mt-3 pt-2 border-top border-light-subtle">
          <div class="d-flex justify-content-between small mb-1">
            <span class="text-secondary fw-medium">{{ progressLabel || 'Nivel de cumplimiento' }}</span>
            <span class="fw-bold">{{ progress | number:'1.1-2' }}%</span>
          </div>
          <div class="progress" style="height: 7px; border-radius: 999px;">
            <div
              class="progress-bar"
              role="progressbar"
              [ngClass]="'bg-bar-' + variant"
              [style.width.%]="Math.min(100, Math.max(0, progress))"
            ></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .stat-label {
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      color: #64748b;
    }

    .stat-value {
      font-size: 1.9rem;
      font-weight: 800;
      color: #0f172a;
    }

    .stat-suffix {
      font-size: 0.9rem;
      color: #10b981;
    }

    .stat-subtitle {
      font-size: 0.82rem;
      line-height: 1.4;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .icon-emerald {
      background: rgba(16, 185, 129, 0.14);
      color: #059669;
    }
    .icon-teal {
      background: rgba(13, 148, 136, 0.14);
      color: #0d9488;
    }
    .icon-indigo {
      background: rgba(99, 102, 241, 0.14);
      color: #4f46e5;
    }
    .icon-amber {
      background: rgba(245, 158, 11, 0.15);
      color: #d97706;
    }
    .icon-rose {
      background: rgba(239, 68, 68, 0.14);
      color: #e11d48;
    }

    .bg-bar-emerald { background: linear-gradient(90deg, #10b981, #059669); }
    .bg-bar-teal { background: linear-gradient(90deg, #14b8a6, #0d9488); }
    .bg-bar-indigo { background: linear-gradient(90deg, #6366f1, #4f46e5); }
    .bg-bar-amber { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .bg-bar-rose { background: linear-gradient(90deg, #ef4444, #dc2626); }
  `]
})
export class StatCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input() suffix?: string;
  @Input() subtitle?: string;
  @Input() icon = 'bi-activity';
  @Input() variant: 'emerald' | 'teal' | 'indigo' | 'amber' | 'rose' = 'emerald';
  @Input() progress?: number | null = null;
  @Input() progressLabel?: string;

  protected readonly Math = Math;
}

