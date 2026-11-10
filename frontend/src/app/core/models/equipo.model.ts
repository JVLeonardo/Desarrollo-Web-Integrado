import { EstadoEquipoEnum, RolEnum } from './enums.model';

/**
 * Equivale a com.reusotech.api.domain.dto.EquipoRequestDTO
 */
export interface EquipoRequestDTO {
  serial: string;
  tipo: string;
  caracteristicas?: string | null;
  estadoInicial?: EstadoEquipoEnum | null;
}

/**
 * Equivale a com.reusotech.api.domain.dto.EquipoResponseDTO
 */
export interface EquipoResponseDTO {
  id: number;
  serial: string;
  tipo: string;
  caracteristicas: string | null;
  estadoActual: EstadoEquipoEnum;
  destinoFinal: string | null;
  evidenciaDestino: string | null;
  fechaIngreso: string;
  fechaCierre: string | null;
  fechaActualizacion: string | null;
  activo: boolean;
  cerrado: boolean;
}

/**
 * Equivale a com.reusotech.api.domain.dto.CambioEstadoRequestDTO
 */
export interface CambioEstadoRequestDTO {
  nuevoEstado: EstadoEquipoEnum;
  motivo: string;
  destinoFinal?: string | null;
  evidenciaDestino?: string | null;
}

/**
 * Equivale a com.reusotech.api.domain.dto.HistorialResponseDTO
 */
export interface HistorialResponseDTO {
  id: number;
  equipoId: number;
  equipoSerial: string;
  usuarioId: number;
  usuarioNombre: string;
  usuarioUsername: string;
  usuarioRol: RolEnum;
  estadoAnterior: EstadoEquipoEnum | null;
  estadoNuevo: EstadoEquipoEnum;
  motivo: string;
  fecha: string;
}

/**
 * Equivale a com.reusotech.api.domain.dto.PasaporteDigitalResponseDTO
 */
export interface PasaporteDigitalResponseDTO {
  equipo: EquipoResponseDTO;
  historial: HistorialResponseDTO[];
  totalTransiciones: number;
  resumenCicloVida: string;
  fechaGeneracion: string;
}

