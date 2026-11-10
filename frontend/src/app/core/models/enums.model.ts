/**
 * Estados del ciclo de vida del equipo en ReusoTech Circular.
 * Calza al 100% con com.reusotech.api.persistence.entity.EstadoEquipoEnum
 */
export type EstadoEquipoEnum =
  | 'RECEPCIONADO'
  | 'EN_DIAGNOSTICO'
  | 'EN_REPARACION'
  | 'REPARADO'
  | 'REUTILIZADO'
  | 'RECICLADO'
  | 'DESMANTELADO'
  | 'DISPOSICION_FINAL';

/**
 * Roles RBAC del sistema.
 * Calza al 100% con com.reusotech.api.persistence.entity.RolEnum
 */
export type RolEnum =
  | 'ENTIDAD_APORTANTE'
  | 'RECEPCION'
  | 'TECNICO'
  | 'SUPERVISOR'
  | 'AUDITOR';

export interface EstadoEquipoMetadata {
  codigo: EstadoEquipoEnum;
  etiqueta: string;
  esEstadoFinal: boolean;
  icono: string;
  colorClase: string;
  descripcion: string;
}

export const ESTADOS_EQUIPO_META: Record<EstadoEquipoEnum, EstadoEquipoMetadata> = {
  RECEPCIONADO: {
    codigo: 'RECEPCIONADO',
    etiqueta: 'Recepcionado',
    esEstadoFinal: false,
    icono: 'bi-box-seam',
    colorClase: 'estado-recepcionado',
    descripcion: 'Ingreso inicial al centro de acopio RAEE'
  },
  EN_DIAGNOSTICO: {
    codigo: 'EN_DIAGNOSTICO',
    etiqueta: 'En Diagnóstico',
    esEstadoFinal: false,
    icono: 'bi-cpu',
    colorClase: 'estado-diagnostico',
    descripcion: 'Evaluación técnica de hardware y componentes'
  },
  EN_REPARACION: {
    codigo: 'EN_REPARACION',
    etiqueta: 'En Reparación',
    esEstadoFinal: false,
    icono: 'bi-tools',
    colorClase: 'estado-reparacion',
    descripcion: 'Mantenimiento correctivo o reemplazo de piezas'
  },
  REPARADO: {
    codigo: 'REPARADO',
    etiqueta: 'Reparado',
    esEstadoFinal: false,
    icono: 'bi-check2-circle',
    colorClase: 'estado-reparado',
    descripcion: 'Equipo operativo listo para reasignación o donación'
  },
  REUTILIZADO: {
    codigo: 'REUTILIZADO',
    etiqueta: 'Reutilizado',
    esEstadoFinal: true,
    icono: 'bi-recycle',
    colorClase: 'estado-reutilizado',
    descripcion: 'Cierre circular por donación o segundo uso certificado'
  },
  RECICLADO: {
    codigo: 'RECICLADO',
    etiqueta: 'Reciclado',
    esEstadoFinal: true,
    icono: 'bi-arrow-repeat',
    colorClase: 'estado-reciclado',
    descripcion: 'Valorización de materiales con operador RAEE autorizado'
  },
  DESMANTELADO: {
    codigo: 'DESMANTELADO',
    etiqueta: 'Desmantelado',
    esEstadoFinal: true,
    icono: 'bi-motherboard',
    colorClase: 'estado-desmantelado',
    descripcion: 'Aprovechamiento de partes y repuestos en almacén técnico'
  },
  DISPOSICION_FINAL: {
    codigo: 'DISPOSICION_FINAL',
    etiqueta: 'Disposición Final',
    esEstadoFinal: true,
    icono: 'bi-shield-exclamation',
    colorClase: 'estado-disposicion',
    descripcion: 'Confinamiento seguro de residuos no aprovechables'
  }
};

export const LISTA_ESTADOS_EQUIPO: EstadoEquipoMetadata[] = Object.values(ESTADOS_EQUIPO_META);

export function esEstadoFinalEquipo(estado: EstadoEquipoEnum | null | undefined): boolean {
  if (!estado) return false;
  return ESTADOS_EQUIPO_META[estado]?.esEstadoFinal ?? false;
}

export interface RolMetadata {
  rol: RolEnum;
  nombre: string;
  icono: string;
  badgeClass: string;
  permisosResumen: string;
}

export const ROLES_METADATA: Record<RolEnum, RolMetadata> = {
  SUPERVISOR: {
    rol: 'SUPERVISOR',
    nombre: 'Supervisor Operativo',
    icono: 'bi-shield-check',
    badgeClass: 'rol-supervisor',
    permisosResumen: 'Acceso total: registro, edición, cambio de estado, baja lógica y reportes'
  },
  RECEPCION: {
    rol: 'RECEPCION',
    nombre: 'Operador de Recepción',
    icono: 'bi-inbox-fill',
    badgeClass: 'rol-recepcion',
    permisosResumen: 'Registro de ingreso, actualización de datos y consulta de trazabilidad'
  },
  TECNICO: {
    rol: 'TECNICO',
    nombre: 'Técnico Especialista',
    icono: 'bi-wrench-adjustable-circle',
    badgeClass: 'rol-tecnico',
    permisosResumen: 'Diagnóstico, reparación, transiciones de estado y cierre con evidencia'
  },
  AUDITOR: {
    rol: 'AUDITOR',
    nombre: 'Auditor de Calidad',
    icono: 'bi-eye-fill',
    badgeClass: 'rol-auditor',
    permisosResumen: 'Solo lectura estricta: fiscalización de Pasaporte Digital y Reportes KPI'
  },
  ENTIDAD_APORTANTE: {
    rol: 'ENTIDAD_APORTANTE',
    nombre: 'Entidad Aportante / Donante',
    icono: 'bi-building-check',
    badgeClass: 'rol-aportante',
    permisosResumen: 'Consulta de inventario y verificación de Pasaporte Digital'
  }
};

