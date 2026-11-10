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
    <header class="glass-navbar sticky-top px-3 px-lg-4 py-2">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <button
            type="button"
            class="btn btn-sm btn-light d-lg-none border"
            (click)="toggleSidebar.emit()"
            title="Menú de navegación"
          >
            <i class="bi bi-list fs-5"></i>
          </button>

          <div class="d-none d-sm-flex align-items-center gap-2">
            <span class="cloud-pill">
              <span class="pulse-dot"></span>
              <i class="bi bi-database-check me-1"></i>
              Neon Cloud PostgreSQL · 20K Dataset Ready
            </span>
          </div>
        </div>

        @if (user(); as currentUser) {
          <div class="d-flex align-items-center gap-3">
            <div class="text-end d-none d-md-block">
              <div class="fw-bold text-dark small lh-sm">{{ currentUser.nombreCompleto }}</div>
              <div class="text-muted" style="font-size: 0.75rem;">
                &#64;{{ currentUser.username }} · {{ currentUser.email }}
              </div>
            </div>

            @if (rolMeta(); as meta) {
              <span class="role-badge" [ngClass]="meta.badgeClass" [title]="meta.permisosResumen">
                <i class="bi" [ngClass]="meta.icono"></i>
                <span>{{ currentUser.rol }}</span>
              </span>
            }

            <button
              type="button"
              class="btn btn-sm btn-outline-danger rounded-3 d-flex align-items-center gap-1 px-2 py-1"
              (click)="onLogout()"
              title="Cerrar sesión"
            >
              <i class="bi bi-box-arrow-right"></i>
              <span class="d-none d-sm-inline">Salir</span>
            </button>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .glass-navbar {
      min-height: 64px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      z-index: 1020;
    }

    .cloud-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
      font-size: 0.76rem;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.1);
      color: #047857;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
    }

    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.75rem;
      border-radius: 10px;
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.03em;
    }

    .rol-supervisor {
      background: rgba(16, 185, 129, 0.15);
      color: #065f46;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }
    .rol-recepcion {
      background: rgba(14, 165, 233, 0.15);
      color: #075985;
      border: 1px solid rgba(14, 165, 233, 0.35);
    }
    .rol-tecnico {
      background: rgba(245, 158, 11, 0.16);
      color: #92400e;
      border: 1px solid rgba(245, 158, 11, 0.35);
    }
    .rol-auditor {
      background: rgba(99, 102, 241, 0.15);
      color: #3730a3;
      border: 1px solid rgba(99, 102, 241, 0.35);
    }
    .rol-aportante {
      background: rgba(13, 148, 136, 0.15);
      color: #115e59;
      border: 1px solid rgba(13, 148, 136, 0.35);
    }
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

