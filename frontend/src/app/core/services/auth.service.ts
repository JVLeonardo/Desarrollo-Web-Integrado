import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {
  AuthResponseDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  RolEnum,
  UsuarioResponseDTO
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'reusotech_jwt_token';
  private readonly USER_KEY = 'reusotech_auth_user';

  private readonly _currentUser = signal<AuthResponseDTO | null>(this.loadStoredUser());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser() && !!this.getToken());
  readonly currentRole = computed<RolEnum | null>(() => this._currentUser()?.rol ?? null);

  login(credentials: LoginRequestDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response));
        this._currentUser.set(response);
      })
    );
  }

  register(payload: RegisterRequestDTO): Observable<UsuarioResponseDTO> {
    return this.http.post<UsuarioResponseDTO>(`${this.API_URL}/register`, payload);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasAnyRole(roles: RolEnum[]): boolean {
    const rolActual = this.currentRole();
    return !!rolActual && roles.includes(rolActual);
  }

  /** POST /api/equipos y PUT /api/equipos/{id} -> RECEPCION, SUPERVISOR */
  canCreateOrEditEquipo(): boolean {
    return this.hasAnyRole(['RECEPCION', 'SUPERVISOR']);
  }

  /** PATCH /api/equipos/{id}/estado -> TECNICO, SUPERVISOR */
  canChangeEstado(): boolean {
    return this.hasAnyRole(['TECNICO', 'SUPERVISOR']);
  }

  /** DELETE /api/equipos/{id} -> SUPERVISOR */
  canDeleteEquipo(): boolean {
    return this.hasAnyRole(['SUPERVISOR']);
  }

  /** GET /api/reportes/circularidad -> SUPERVISOR, AUDITOR */
  canViewReportes(): boolean {
    return this.hasAnyRole(['SUPERVISOR', 'AUDITOR']);
  }

  private loadStoredUser(): AuthResponseDTO | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthResponseDTO;
    } catch {
      return null;
    }
  }
}

