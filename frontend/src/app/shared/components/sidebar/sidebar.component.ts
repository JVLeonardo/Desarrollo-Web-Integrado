import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ROLES_METADATA } from '../../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="eco-sidebar d-flex flex-column justify-content-between" [class.open]="isOpen">
      <div>
        <!-- Brand Header -->
        <div class="brand-box d-flex align-items-center justify-content-between px-4 py-3">
          <a routerLink="/equipos" class="d-flex align-items-center gap-3 text-decoration-none">
            <div class="brand-logo">
              <i class="bi bi-recycle"></i>
            </div>
            <div>
              <span class="brand-title font-display d-block">ReusoTech</span>
              <span class="brand-subtitle d-block">Economía Circular RAEE</span>
            </div>
          </a>
          <button
            type="button"
            class="btn btn-sm text-light d-lg-none"
            (click)="closeSidebar.emit()"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Navigation Links -->
        <div class="px-3 mt-3">
          <div class="nav-section-title px-3 mb-2">MÓDULOS OPERATIVOS</div>
          <nav class="nav flex-column gap-1">
            @if (authService.canViewReportes()) {
              <a
                routerLink="/dashboard"
                routerLinkActive="active"
                class="nav-link-eco"
                (click)="closeSidebar.emit()"
              >
                <i class="bi bi-pie-chart-fill"></i>
                <span>Dashboard Circularidad</span>
              </a>
            }

            <a
              routerLink="/equipos"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="nav-link-eco"
              (click)="closeSidebar.emit()"
            >
              <i class="bi bi-pc-display-horizontal"></i>
              <span>Inventario y Trazabilidad</span>
            </a>
          </nav>
        </div>
      </div>

      <!-- Role Matrix Card -->
      @if (rolMeta(); as meta) {
        <div class="p-3 m-3 rounded-4 role-info-box">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi text-emerald fs-5" [ngClass]="meta.icono"></i>
            <div>
              <div class="text-white fw-bold small">{{ meta.nombre }}</div>
              <div class="text-emerald-light" style="font-size: 0.7rem;">RBAC Activo · JWT</div>
            </div>
          </div>
          <p class="mb-2 text-slate-300" style="font-size: 0.75rem; line-height: 1.4;">
            {{ meta.permisosResumen }}
          </p>
          <div class="d-flex flex-wrap gap-1 mt-2">
            @if (authService.canCreateOrEditEquipo()) {
              <span class="perm-chip">POST/PUT</span>
            }
            @if (authService.canChangeEstado()) {
              <span class="perm-chip">PATCH Estado</span>
            }
            @if (authService.canDeleteEquipo()) {
              <span class="perm-chip">DELETE Baja</span>
            }
            @if (authService.canViewReportes()) {
              <span class="perm-chip">KPI Reportes</span>
            }
            <span class="perm-chip">Pasaporte Digital</span>
          </div>
        </div>
      }
    </aside>
  `,
  styles: [`
    .eco-sidebar {
      width: 270px;
      min-height: 100vh;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      color: #f8fafc;
      border-right: 1px solid rgba(255, 255, 255, 0.07);
      flex-shrink: 0;
      transition: transform 0.25s ease;
    }

    .brand-box {
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      min-height: 64px;
    }

    .brand-logo {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 1.3rem;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
    }

    .brand-title {
      font-weight: 800;
      font-size: 1.1rem;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      font-size: 0.72rem;
      color: #34d399;
      font-weight: 500;
    }

    .nav-section-title {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #64748b;
    }

    .nav-link-eco {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.72rem 1rem;
      border-radius: 12px;
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.18s ease;

      i {
        font-size: 1.1rem;
        color: #94a3b8;
        transition: color 0.18s ease;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #ffffff;

        i {
          color: #34d399;
        }
      }

      &.active {
        background: rgba(16, 185, 129, 0.16);
        color: #ffffff;
        font-weight: 600;
        border: 1px solid rgba(16, 185, 129, 0.32);

        i {
          color: #10b981;
        }
      }
    }

    .role-info-box {
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(16, 185, 129, 0.22);
    }

    .text-emerald { color: #10b981; }
    .text-emerald-light { color: #6ee7b7; }
    .text-slate-300 { color: #cbd5e1; }

    .perm-chip {
      font-size: 0.66rem;
      font-weight: 600;
      padding: 0.15rem 0.45rem;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.15);
      color: #a7f3d0;
    }

    @media (max-width: 991.98px) {
      .eco-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 1045;
        transform: translateX(-100%);

        &.open {
          transform: translateX(0);
        }
      }
    }
  `]
})
export class SidebarComponent {
  readonly authService = inject(AuthService);
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  readonly rolMeta = computed(() => {
    const rol = this.authService.currentRole();
    return rol ? ROLES_METADATA[rol] : null;
  });
}

