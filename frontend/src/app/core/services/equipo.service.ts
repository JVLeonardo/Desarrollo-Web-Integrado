import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CambioEstadoRequestDTO,
  EquipoRequestDTO,
  EquipoResponseDTO,
  EstadoEquipoEnum,
  PasaporteDigitalResponseDTO
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/equipos';

  /**
   * GET /api/equipos
   * Optimizado en backend para devolver los últimos 100 registros activos o filtrar por serial/estado
   * sobre los 20,000 registros de Neon Cloud.
   */
  listarTodos(serial?: string, estado?: EstadoEquipoEnum | ''): Observable<EquipoResponseDTO[]> {
    let params = new HttpParams();
    if (serial && serial.trim().length > 0) {
      params = params.set('serial', serial.trim());
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<EquipoResponseDTO[]>(this.API_URL, { params });
  }

  obtenerPorId(id: number): Observable<EquipoResponseDTO> {
    return this.http.get<EquipoResponseDTO>(`${this.API_URL}/${id}`);
  }

  registrarEquipo(dto: EquipoRequestDTO): Observable<EquipoResponseDTO> {
    return this.http.post<EquipoResponseDTO>(this.API_URL, dto);
  }

  actualizarEquipo(id: number, dto: EquipoRequestDTO): Observable<EquipoResponseDTO> {
    return this.http.put<EquipoResponseDTO>(`${this.API_URL}/${id}`, dto);
  }

  cambiarEstado(id: number, dto: CambioEstadoRequestDTO): Observable<EquipoResponseDTO> {
    return this.http.patch<EquipoResponseDTO>(`${this.API_URL}/${id}/estado`, dto);
  }

  desactivarEquipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  obtenerPasaporteDigital(id: number): Observable<PasaporteDigitalResponseDTO> {
    return this.http.get<PasaporteDigitalResponseDTO>(`${this.API_URL}/${id}/pasaporte`);
  }
}

