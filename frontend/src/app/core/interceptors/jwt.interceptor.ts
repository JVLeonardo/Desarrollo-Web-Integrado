import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ApiErrorResponse } from '../models';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isAuthEndpoint =
    req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');

  let authReq = req;
  if (token && !isAuthEndpoint) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        authService.logout();
      }

      const backendError = error.error as Partial<ApiErrorResponse> | null;
      const structuredError: ApiErrorResponse = {
        timestamp: backendError?.timestamp ?? new Date().toISOString(),
        status: error.status,
        error: backendError?.error ?? obtenerCodigoErrorPorStatus(error.status),
        mensaje: backendError?.mensaje ?? backendError?.error,
        message:
          backendError?.message ??
          obtenerMensajeAmigable(error.status, backendError?.details),
        details: backendError?.details,
        path: backendError?.path ?? req.url
      };

      return throwError(() => structuredError);
    })
  );
};

function obtenerCodigoErrorPorStatus(status: number): string {
  switch (status) {
    case 0:
      return 'SERVIDOR_NO_DISPONIBLE';
    case 401:
      return 'CREDENCIALES_INVALIDAS';
    case 403:
      return 'ACCESO_DENEGADO';
    case 404:
      return 'RECURSO_NO_ENCONTRADO';
    case 409:
      return 'SERIAL_DUPLICADO';
    case 422:
      return 'EVIDENCIA_DESTINO_INCOMPLETA';
    default:
      return 'ERROR_OPERACION';
  }
}

function obtenerMensajeAmigable(
  status: number,
  details?: Record<string, string>
): string {
  if (details && Object.keys(details).length > 0) {
    return Object.values(details).join(' | ');
  }
  switch (status) {
    case 0:
      return 'No se pudo conectar con el servidor API en http://localhost:8080. Verifique que Spring Boot esté en ejecución.';
    case 401:
      return 'Sesión expirada o credenciales inválidas.';
    case 403:
      return 'Su rol actual no tiene permisos para ejecutar esta operación (Control RBAC).';
    case 404:
      return 'El recurso solicitado no fue encontrado en la base de datos.';
    case 409:
      return 'Conflicto de integridad: El número de serie ya se encuentra registrado.';
    case 422:
      return 'Regla de negocio: No se puede cerrar el ciclo sin registrar Destino Final y Evidencia Documental.';
    default:
      return 'Ocurrió un error inesperado al procesar la solicitud.';
  }
}

