import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardCircularidadComponent } from './features/dashboard/dashboard-circularidad.component';
import { EquiposListComponent } from './features/equipos/equipos-list/equipos-list.component';
import { PasaporteDigitalComponent } from './features/equipos/pasaporte-digital/pasaporte-digital.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión | ReusoTech Circular'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Registro RBAC | ReusoTech Circular'
  },
  {
    path: 'dashboard',
    component: DashboardCircularidadComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPERVISOR', 'AUDITOR'] },
    title: 'Dashboard de Circularidad | ReusoTech Circular'
  },
  {
    path: 'equipos',
    component: EquiposListComponent,
    canActivate: [authGuard],
    title: 'Inventario y Trazabilidad RAEE | ReusoTech Circular'
  },
  {
    path: 'equipos/:id/pasaporte',
    component: PasaporteDigitalComponent,
    canActivate: [authGuard],
    title: 'Pasaporte Digital | ReusoTech Circular'
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'equipos'
  },
  {
    path: '**',
    redirectTo: 'equipos'
  }
];
