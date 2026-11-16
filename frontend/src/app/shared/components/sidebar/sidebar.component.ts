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
    <aside class="eco-sidebar" [class.open]="isOpen">
      <div>
        <div class="brand">
          <a routerLink="/equipos" class="brand-link">
            <span class="logo"><i class="bi bi-recycle"></i></span>
            <span>
              <span class="brand-title">ReusoTech</span>
              <span class="brand-sub">Circular</span>
            </span>
          </a>
          <button type="button" class="close-btn d-lg-none" (click)="closeSidebar.emit()" aria-label="Cerrar">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <nav class="nav-group">
          <div class="nav-title">Operación</div>

          @if (authService.canViewReportes()) {
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="closeSidebar.emit()">
              <i class="bi bi-bar-chart-line"></i><span>Circularidad</span>
            </a>
          }

          <a routerLink="/equipos" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
             class="nav-item" (click)="closeSidebar.emit()">
            <i class="bi bi-hdd-stack"></i><span>Inventario</span>
          </a>
        </nav>
      </div>

      @if (rolMeta(); as meta) {
        <div class="role-box">
          <div class="role-name">{{ meta.nombre }}</div>
          <p class="role-desc">{{ meta.permisosResumen }}</p>
          <div class="chips">
            @if (authService.canCreateOrEditEquipo()) { <span>escritura</span> }
            @if (authService.canChangeEstado()) { <span>estados</span> }
            @if (authService.canDeleteEquipo()) { <span>baja</span> }
            @if (authService.canViewReportes()) { <span>reportes</span> }
            <span>pasaporte</span>
          </div>
        </div>
      }
    </aside>
  `,
  styles: [`
    .eco-sidebar {
      width: 232px;
      min-height: 100vh;
      background: var(--rt-surface);
      border-right: 1px solid var(--rt-border);
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s ease;
    }

    .brand {
      height: 52px;
      padding: 0 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--rt-border);
    }

    .brand-link { display: flex; align-items: center; gap: 0.625rem; text-decoration: none; }

    .logo {
      width: 26px;
      height: 26px;
      border-radius: 5px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      color: var(--rt-accent);
      background: var(--rt-accent-soft);
      border: 1px solid color-mix(in srgb, var(--rt-accent) 35%, transparent);
    }

    .brand-title { font-size: 0.875rem; font-weight: 600; color: var(--rt-text); margin-right: 0.3rem; }
    .brand-sub { font-size: 0.875rem; color: var(--rt-muted); }

    .close-btn { background: none; border: none; color: var(--rt-muted); }

    .nav-group { padding: 1rem 0.625rem; display: flex; flex-direction: column; gap: 2px; }

    .nav-title {
      padding: 0 0.625rem 0.5rem;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--rt-faint);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.45rem 0.625rem;
      border-radius: 5px;
      color: var(--rt-muted);
      text-decoration: none;
      font-size: 0.8125rem;
      font-weight: 500;
      border-left: 2px solid transparent;
      transition: background 0.15s, color 0.15s;
    }
    .nav-item i { font-size: 0.95rem; }
    .nav-item:hover { background: var(--rt-surface-2); color: var(--rt-text); }
    .nav-item.active {
      background: var(--rt-surface-2);
      color: var(--rt-text);
      border-left-color: var(--rt-accent);
    }
    .nav-item.active i { color: var(--rt-accent); }

    .role-box { margin: 0.75rem; padding: 0.75rem; border: 1px solid var(--rt-border); border-radius: 6px; background: var(--rt-bg); }
    .role-name { font-size: 0.75rem; font-weight: 600; color: var(--rt-text); }
    .role-desc { margin: 0.35rem 0 0.6rem; font-size: 0.7188rem; line-height: 1.45; color: var(--rt-faint); }
    .chips { display: flex; flex-wrap: wrap; gap: 4px; }
    .chips span {
      font-family: var(--rt-mono);
      font-size: 0.625rem;
      padding: 0.1rem 0.4rem;
      border-radius: 3px;
      color: var(--rt-muted);
      border: 1px solid var(--rt-border);
    }

    @media (max-width: 991.98px) {
      .eco-sidebar {
        position: fixed;
        inset: 0 auto 0 0;
        z-index: 1045;
        transform: translateX(-100%);
        &.open { transform: translateX(0); }
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
