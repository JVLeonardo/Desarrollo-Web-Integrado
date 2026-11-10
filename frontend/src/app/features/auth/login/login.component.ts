import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiErrorResponse, LoginRequestDTO } from '../../../core/models';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';

interface DemoAccount {
  username: string;
  password: string;
  rol: string;
  icono: string;
  badgeClass: string;
  desc: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AlertBannerComponent],
  template: `
    <div class="auth-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4">
      <div class="auth-shell row g-0 overflow-hidden shadow-lg">
        <!-- Left Hero Panel -->
        <div class="col-lg-6 auth-hero p-4 p-lg-5 d-flex flex-column justify-content-between text-white">
          <div>
            <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill hero-pill mb-4">
              <i class="bi bi-recycle"></i>
              <span>Plataforma de Trazabilidad RAEE · APF3</span>
            </div>

            <h1 class="font-display fw-bold display-6 mb-3">
              ReusoTech <span class="text-emerald">Circular</span>
            </h1>
            <p class="text-slate-300 mb-4" style="font-size: 0.96rem; line-height: 1.65;">
              Sistema integral para la gestión del ciclo de vida de activos tecnológicos, emisión de
              <strong>Pasaporte Digital</strong> auditable e indicadores de circularidad conectados a
              <strong>Neon Cloud PostgreSQL (20,000 registros)</strong>.
            </p>

            <div class="row g-3 mb-4">
              <div class="col-6">
                <div class="hero-metric p-3 rounded-4">
                  <div class="fs-4 fw-bold font-display text-emerald">20,000+</div>
                  <div class="small text-slate-300">Equipos trazados en la nube</div>
                </div>
              </div>
              <div class="col-6">
                <div class="hero-metric p-3 rounded-4">
                  <div class="fs-4 fw-bold font-display text-emerald">100%</div>
                  <div class="small text-slate-300">Auditoría y Pasaporte Digital</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Demo Credentials Selector -->
          <div class="demo-panel p-3 rounded-4">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="small fw-bold text-uppercase tracking-wider text-emerald-light">
                <i class="bi bi-lightning-charge-fill me-1"></i>Acceso Rápido por Rol (DataInitializer)
              </span>
              <span class="badge bg-dark border border-secondary-subtle">1-Click Demo</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              @for (acc of demoAccounts; track acc.username) {
                <button
                  type="button"
                  class="btn btn-sm demo-role-btn d-flex align-items-center gap-2"
                  (click)="usarCuentaDemo(acc)"
                  [title]="acc.desc"
                >
                  <i class="bi" [ngClass]="acc.icono"></i>
                  <div class="text-start">
                    <div class="fw-bold" style="font-size: 0.74rem; line-height: 1.1;">{{ acc.rol }}</div>
                    <div class="opacity-75" style="font-size: 0.66rem;">{{ acc.username }}</div>
                  </div>
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Right Login Form Panel -->
        <div class="col-lg-6 bg-white p-4 p-lg-5 d-flex flex-column justify-content-center">
          <div class="mx-auto w-100" style="max-width: 420px;">
            <div class="mb-4">
              <h2 class="font-display fw-bold h3 mb-1 text-dark">Iniciar Sesión</h2>
              <p class="text-muted small mb-0">
                Ingrese sus credenciales corporativas o seleccione un perfil de prueba.
              </p>
            </div>

            <app-alert-banner
              [apiError]="error()"
              (closed)="error.set(null)"
            ></app-alert-banner>

            <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
              <div class="mb-3">
                <label class="form-label" for="username">Usuario</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 text-secondary">
                    <i class="bi bi-person"></i>
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    class="form-control border-start-0 ps-0"
                    placeholder="Ej. supervisor, recepcion, tecnico, auditor"
                    [(ngModel)]="credentials.username"
                    required
                    autocomplete="username"
                  />
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label" for="password">Contraseña</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 text-secondary">
                    <i class="bi bi-lock"></i>
                  </span>
                  <input
                    id="password"
                    name="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    class="form-control border-start-0 border-end-0 ps-0"
                    placeholder="••••••••"
                    [(ngModel)]="credentials.password"
                    required
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    class="input-group-text bg-light text-secondary"
                    (click)="showPassword.set(!showPassword())"
                  >
                    <i class="bi" [ngClass]="showPassword() ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-eco-primary w-100 py-2 mb-3 d-flex align-items-center justify-content-center gap-2"
                [disabled]="loading() || !credentials.username || !credentials.password"
              >
                @if (loading()) {
                  <span class="spinner-border spinner-border-sm" role="status"></span>
                  <span>Autenticando con JWT...</span>
                } @else {
                  <i class="bi bi-shield-lock-fill"></i>
                  <span>Ingresar al Sistema</span>
                }
              </button>
            </form>

            <div class="text-center mt-3 pt-3 border-top">
              <span class="text-muted small">¿Necesita registrar un nuevo operador? </span>
              <a routerLink="/register" class="fw-semibold text-decoration-none" style="color: #059669;">
                Crear cuenta RBAC
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      background: radial-gradient(circle at 15% 20%, rgba(16, 185, 129, 0.12), transparent 45%),
                  radial-gradient(circle at 85% 80%, rgba(13, 148, 136, 0.12), transparent 45%),
                  #f1f5f9;
    }

    .auth-shell {
      width: 100%;
      max-width: 1060px;
      border-radius: 24px;
      border: 1px solid rgba(226, 232, 240, 0.9);
      background: #ffffff;
    }

    .auth-hero {
      background: linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #064e3b 100%);
    }

    .hero-pill {
      background: rgba(16, 185, 129, 0.16);
      color: #6ee7b7;
      border: 1px solid rgba(16, 185, 129, 0.3);
      font-size: 0.78rem;
      font-weight: 600;
    }

    .text-emerald { color: #10b981; }
    .text-emerald-light { color: #6ee7b7; }
    .text-slate-300 { color: #cbd5e1; }

    .hero-metric {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .demo-panel {
      background: rgba(15, 23, 42, 0.55);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .demo-role-btn {
      background: rgba(255, 255, 255, 0.08);
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 0.38rem 0.65rem;
      transition: all 0.18s ease;

      &:hover {
        background: rgba(16, 185, 129, 0.22);
        border-color: #10b981;
        color: #ffffff;
        transform: translateY(-1px);
      }

      i {
        color: #34d399;
        font-size: 1rem;
      }
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  credentials: LoginRequestDTO = {
    username: '',
    password: ''
  };

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly error = signal<ApiErrorResponse | null>(null);

  readonly demoAccounts: DemoAccount[] = [
    {
      username: 'supervisor',
      password: 'supervisor123',
      rol: 'SUPERVISOR',
      icono: 'bi-shield-check',
      badgeClass: 'rol-supervisor',
      desc: 'Control total + Dashboard Circularidad + Baja lógica'
    },
    {
      username: 'recepcion',
      password: 'recepcion123',
      rol: 'RECEPCIÓN',
      icono: 'bi-inbox-fill',
      badgeClass: 'rol-recepcion',
      desc: 'Registro de ingreso (POST) y edición (PUT)'
    },
    {
      username: 'tecnico',
      password: 'tecnico123',
      rol: 'TÉCNICO',
      icono: 'bi-tools',
      badgeClass: 'rol-tecnico',
      desc: 'Diagnóstico, reparación y cierre con evidencia (PATCH)'
    },
    {
      username: 'auditor',
      password: 'auditor123',
      rol: 'AUDITOR',
      icono: 'bi-eye-fill',
      badgeClass: 'rol-auditor',
      desc: 'Solo lectura estricta: Pasaporte Digital y Reporte KPI'
    },
    {
      username: 'aportante',
      password: 'aportante123',
      rol: 'APORTANTE',
      icono: 'bi-building-check',
      badgeClass: 'rol-aportante',
      desc: 'Entidad donante: consulta de trazabilidad y pasaporte'
    }
  ];

  usarCuentaDemo(acc: DemoAccount): void {
    this.credentials = {
      username: acc.username,
      password: acc.password
    };
    this.onSubmit();
  }

  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.rol === 'SUPERVISOR' || res.rol === 'AUDITOR') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/equipos']);
        }
      },
      error: (err: ApiErrorResponse) => {
        this.loading.set(false);
        this.error.set(err);
      }
    });
  }
}

