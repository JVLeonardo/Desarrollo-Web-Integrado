import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat h-100" [ngClass]="'tone-' + variant">
      <div class="stat-head">
        <span class="stat-label">{{ title }}</span>
        <i class="bi stat-icon" [ngClass]="icon"></i>
      </div>

      <div class="stat-body">
        <span class="stat-value">{{ value }}</span>
        @if (suffix) {
          <span class="stat-suffix">{{ suffix }}</span>
        }
      </div>

      @if (subtitle) {
        <p class="stat-sub">{{ subtitle }}</p>
      }

      @if (progress !== null && progress !== undefined) {
        <div class="stat-foot">
          <div class="d-flex justify-content-between stat-foot-label">
            <span>{{ progressLabel || 'Cumplimiento' }}</span>
            <span class="mono">{{ progress | number: '1.1-2' }}%</span>
          </div>
          <div class="stat-track">
            <div class="stat-fill" [style.width.%]="clamp(progress)"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .stat {
      --tone: var(--rt-accent);
      background: var(--rt-surface);
      border: 1px solid var(--rt-border);
      border-radius: 6px;
      padding: 1rem 1.125rem 1.125rem;
      display: flex;
      flex-direction: column;
      transition: border-color 0.15s ease;
    }
    .stat:hover { border-color: var(--rt-border-strong); }

    .tone-emerald { --tone: var(--rt-accent); }
    .tone-teal { --tone: #4aa3a0; }
    .tone-indigo { --tone: var(--rt-blue); }
    .tone-amber { --tone: var(--rt-amber); }
    .tone-rose { --tone: var(--rt-danger); }

    .stat-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.875rem;
    }

    .stat-label {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--rt-muted);
    }

    .stat-icon { font-size: 0.95rem; color: var(--tone); opacity: 0.9; }

    .stat-body { display: flex; align-items: baseline; gap: 0.375rem; }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 600;
      line-height: 1.1;
      letter-spacing: -0.02em;
      color: var(--rt-text);
      font-variant-numeric: tabular-nums;
    }

    .stat-suffix { font-size: 0.8125rem; color: var(--rt-muted); }

    .stat-sub {
      margin: 0.5rem 0 0;
      font-size: 0.75rem;
      line-height: 1.45;
      color: var(--rt-muted);
    }

    .stat-foot {
      margin-top: auto;
      padding-top: 1rem;
    }

    .stat-foot-label {
      font-size: 0.6875rem;
      color: var(--rt-faint);
      margin-bottom: 0.4rem;
    }
    .stat-foot-label .mono { color: var(--rt-muted); }

    .stat-track {
      height: 3px;
      background: var(--rt-surface-3);
      border-radius: 2px;
      overflow: hidden;
    }

    .stat-fill {
      height: 100%;
      background: var(--tone);
      border-radius: 2px;
      transition: width 0.4s ease;
    }
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

  clamp(v: number): number {
    return Math.min(100, Math.max(0, v));
  }
}
