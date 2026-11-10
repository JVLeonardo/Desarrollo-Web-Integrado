/**
 * Equivale a com.reusotech.api.domain.dto.ReporteCircularidadDTO
 */
export interface ReporteCircularidadDTO {
  totalEquiposRecibidos: number;
  totalEquiposReutilizados: number;
  totalEquiposReparados: number;
  totalEquiposReciclados: number;
  totalEquiposDesmantelados: number;
  totalEquiposDisposicionFinal: number;
  totalEquiposEnProceso: number;
  totalEquiposCerrados: number;
  totalCerradosConEvidencia: number;

  // Indicadores clave del Capítulo 1
  indiceCircularidadPct: number;
  tasaExactitudRegistrosPct: number;
  tasaDuplicidadDetectadaPct: number;
  completitudTrazabilidadPct: number;

  distribucionPorEstado: Record<string, number>;
}

