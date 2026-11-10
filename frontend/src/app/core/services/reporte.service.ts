import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReporteCircularidadDTO } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/reportes';

  /**
   * GET /api/reportes/circularidad
   * Calcula los indicadores sobre el total de registros (20,000+) en Neon Cloud.
   */
  obtenerReporteCircularidad(): Observable<ReporteCircularidadDTO> {
    return this.http.get<ReporteCircularidadDTO>(`${this.API_URL}/circularidad`);
  }
}

