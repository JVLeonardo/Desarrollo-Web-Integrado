import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  ApiErrorResponse,
  ROLES_METADATA,
  RegisterRequestDTO,
  RolEnum
} from '../../../core/models';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AlertBannerComponent],
  template: `
    <div class="auth-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4">
      <div class="eco-card shadow-lg w-100 p-4 p-lg-5" style="max-width: 560px;">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <div class="d-flex align-items-center gap-3">
            <div class="brand-badge">
              <i class="bi bi-person-plus-fill"></i>
            </div>
            <div>
              <h2 class="font-display fw-bold h4 mb-0">Registro de Operador RBAC</h2>
              <p class="text-muted small mb-0">Alta de usuario en ReusoTech Circular</p>
            </div>
          </div>
          <a routerLink="/login" class="btn btn-sm btn-eco-outline">
            <i class="bi bi-arrow-left me-1"></i>Volver
          </a>
        </div>

        <app-alert-banner
          [apiError]="error()"
          [successMessage]="successMsg()"
          (closed)="error.set(null); successMsg.set(null)"
        ></app-alert-banner>

        <form (ngSubmit)="onSubmit()" #regForm="ngForm">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="username">Usuario (3 - 50 caracteres) *</label>
              <input
                id="username"
                name="username"
                type="text"
                class="form-control"
                placeholder="Ej. tecnico_sede_norte"
                [(ngModel)]="form.username"
                required
                minlength="3"
                maxlength="50"
              />
            </div>

            <div class="col-md-6">
              <label class="form-label" for="password">Contraseña (mín. 6 caracteres) *</label>
              <input
                id="password"
                name="password"
                type="password"
                class="form-control"
                placeholder="Mínimo 6 caracteres"
                [(ngModel)]="form.password"
                required
                minlength="6"
              />
            </div>

            <div class="col-12">
              <label class="form-label" for="nombreCompleto">Nombre Completo *</label>
              <input
                id="nombreCompleto"
                name="nombreCompleto"
                type="text"
                class="form-control"
                placeholder="Ej. Ing. Carlos Mendoza"
                [(ngModel)]="form.nombreCompleto"
                required
              />
            </div>

            <div class="col-12">
              <label class="form-label" for="email">Correo Electrónico Institucional *</label>
              <input
                id="email"
                name="email"
                type="email"
                class="form-control"
                placeholder="carlos.mendoza@reusotech.com"
                [(ngModel)]="form.email"
                required
              />
            </div>

            <div class="col-12">
              <label class="form-label" for="rol">Rol Operativo RBAC *</label>
              <select
                id="rol"
                name="rol"
                class="form-select"
                [(ngModel)]="form.rol"
                required
              >
                @for (rol of rolesDisponibles; track rol) {
                  <option [ngValue]="rol">
                    {{ rol }} — {{ rolesMeta[rol].nombre }}
                  </option>
                }
              </select>
              <div class="form-text small mt-1">
                <i class="bi bi-info-circle me-1"></i>
                {{ rolesMeta[form.rol].permisosResumen }}
              </div>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-eco-primary w-100 py-2 mt-4 d-flex align-items-center justify-content-center gap-2"
            [disabled]="loading() || !regForm.form.valid"
          >
            @if (loading()) {
              <span class="spinner-border spinner-border-sm"></span>
              <span>Registrando usuario...</span>
            } @else {
              <i class="bi bi-check2-circle"></i>
              <span>Completar Registro</span>
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      background: radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.12), transparent 45%),
                  #f1f5f9;
    }

    .brand-badge {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      background: linear-gradient(135deg, #10b981, #0d9488);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
    }
  `]
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly rolesMeta = ROLES_METADATA;
  readonly rolesDisponibles: RolEnum[] = [
    'RECEPCION',
    'TECNICO',
    'SUPERVISOR',
    'AUDITOR',
    'ENTIDAD_APORTANTE'
  ];

  form: RegisterRequestDTO = {
    username: '',
    password: '',
    nombreCompleto: '',
    email: '',
    rol: 'TECNICO'
  };

  readonly loading = signal(false);
  readonly error = signal<ApiErrorResponse | null>(null);
  readonly successMsg = signal<string | null>(null);

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);
    this.successMsg.set(null);

    this.authService.register(this.form).subscribe({
      next: (usuario) => {
        this.loading.set(false);
        this.successMsg.set(
          `Usuario "${usuario.username}" (${usuario.rol}) creado correctamente. Redirigiendo al login...`
        );
        setTimeout(() => this.router.navigate(['/login']), 1400);
      },
      error: (err: ApiErrorResponse) => {
        this.loading.set(false);
        this.error.set(err);
      }
    });
  }
}

