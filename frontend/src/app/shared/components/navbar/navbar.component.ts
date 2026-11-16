import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ROLES_METADATA } from '../../../core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="glass-navbar sticky-top px-3 px-lg-4">
      <div class="bar">
        <div class="d-flex align-items-center gap-3">
          <button type="button" class="icon-btn d-lg-none" (click)="toggleSidebar.emit()" aria-label="Menú">
            <i class="bi bi-list"></i>
          </button>
          <span class="env d-none d-sm-inline-flex">
            <span class="status-dot"></span>PostgreSQL · Neon
          </span>
        </div>

        @if (user(); as currentUser) {
          <div class="d-flex align-items-center gap-3">
            <div class="text-end d-none d-md-block">
              <div class="u-name">{{ currentUser.nombreCompleto }}</div>
              <div class="u-mail">{{ currentUser.email }}</div>
            </div>

            @if (rolMeta(); as meta) {
              <span class="role" [title]="meta.permisosResumen">{{ currentUser.rol }}</span>
            }

            <button type="button" class="icon-btn" (click)="onLogout()" title="Cerrar sesión" aria-label="Cerrar sesión">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .glass-navbar { z-index: 1020; }

    .bar {
      min-height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .env {
      align-items: center;
      gap: 0.5rem;
      font-family: var(--rt-mono);
      font-size: 0.7188rem;
      color: var(--rt-muted);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--rt-accent);
    }

    .u-name { font-size: 0.8125rem; font-weight: 600; line-height: 1.2; color: var(--rt-text); }
    .u-mail { font-size: 0.7188rem; color: var(--rt-faint); }

    .role {
      font-family: var(--rt-mono);
      font-size: 0.6875rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      color: var(--rt-accent);
      border: 1px solid color-mix(in srgb, var(--rt-accent) 35%, transparent);
      background: var(--rt-accent-soft);
    }

    .icon-btn {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid var(--rt-border);
      border-radius: 6px;
      color: var(--rt-muted);
      transition: color 0.15s, border-color 0.15s, background 0.15s;
    }
    .icon-btn:hover { color: var(--rt-text); border-color: var(--rt-border-strong); background: var(--rt-surface-2); }
  `]
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  @Output() toggleSidebar = new EventEmitter<void>();

  readonly user = this.authService.currentUser;
  readonly rolMeta = computed(() => {
    const rol = this.authService.currentRole();
    return rol ? ROLES_METADATA[rol] : null;
  });

  onLogout(): void {
    this.authService.logout();
  }
}
