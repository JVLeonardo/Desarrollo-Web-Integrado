/**
 * Estructura JSON de errores devuelta por GlobalExceptionHandler.java
 * Códigos de negocio:
 * - 409 CONFLICT -> SERIAL_DUPLICADO
 * - 422 UNPROCESSABLE_ENTITY -> EVIDENCIA_DESTINO_INCOMPLETA
 * - 403 FORBIDDEN -> AUDITOR_SOLO_LECTURA | ACCESO_DENEGADO
 * - 404 NOT_FOUND -> RECURSO_NO_ENCONTRADO
 * - 401 UNAUTHORIZED -> CREDENCIALES_INVALIDAS
 * - 400 BAD_REQUEST -> VALIDACION_FALLIDA | REGLA_DE_NEGOCIO
 */
export interface ApiErrorResponse {
  timestamp?: string;
  status: number;
  error: string;
  mensaje?: string;
  message: string;
  details?: Record<string, string>;
  path?: string;
}

