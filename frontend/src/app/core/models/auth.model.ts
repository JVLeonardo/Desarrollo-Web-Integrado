import { RolEnum } from './enums.model';

/**
 * Equivale a com.reusotech.api.domain.dto.LoginRequestDTO
 */
export interface LoginRequestDTO {
  username: string;
  password: string;
}

/**
 * Equivale a com.reusotech.api.domain.dto.RegisterRequestDTO
 */
export interface RegisterRequestDTO {
  username: string;
  password: string;
  nombreCompleto: string;
  email: string;
  rol: RolEnum;
}

/**
 * Equivale a com.reusotech.api.domain.dto.AuthResponseDTO
 */
export interface AuthResponseDTO {
  token: string;
  tipo: string;
  id: number;
  username: string;
  nombreCompleto: string;
  email: string;
  rol: RolEnum;
}

/**
 * Equivale a com.reusotech.api.domain.dto.UsuarioResponseDTO
 */
export interface UsuarioResponseDTO {
  id: number;
  username: string;
  nombreCompleto: string;
  email: string;
  rol: RolEnum;
  activo: boolean;
}

