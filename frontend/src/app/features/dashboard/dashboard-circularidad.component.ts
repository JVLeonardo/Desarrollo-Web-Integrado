import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReporteService } from '../../core/services/reporte.service';
import {
  ApiErrorResponse,
  ESTADOS_EQUIPO_META,
  EstadoEquipoEnum,
  LISTA_ESTADOS_EQUIPO,
  ReporteCircularidadDTO
} from '../../core/models';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { EstadoBadgeComponent } from '../../shared/components/estado-badge/estado-badge.component';
import { AlertBannerComponent } from '../../shared/components/alert-banner/alert-banner.component';

interface FilaDistribucion {
  estado: EstadoEquipoEnum;
  etiqueta: string;
  cantidad: number;
  porcentaje: number;
  esFinal: boolean;
}

@Component({
  selector: 'app-dashboard-circularidad',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    EstadoBadgeComponent,
    AlertBannerComponent
  ],
  template: `
    <div class="container-fluid py-4 px-3 px-lg-4">
      <!-- Header -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle">
              <i class="bi bi-bar-chart-steps me-1"></i>Capítulo 1 · Matriz de Indicadores
            </span>
            <span class="badge bg-light text-secondary border">
              Consultas COUNT en tiempo real
            </span>
          </div>
          <h2 class="font-display fw-bold h3 mb-0">Dashboard de Circularidad y Trazabilidad RAEE</h2>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-eco-outline d-flex align-items-center gap-2"
            (click)="cargarReporte()"
            [disabled]="loading()"
          >
            <i class="bi bi-arrow-clockwise" [class.spin]="loading()"></i>
            <span>Actualizar KPIs</span>
          </button>
          <a routerLink="/equipos" class="btn btn-eco-primary d-flex align-items-center gap-2">
            <i class="bi bi-pc-display-horizontal"></i>
            <span>Ver Inventario</span>
          </a>
        </div>
      </div>

      <app-alert-banner
        [apiError]="error()"
        (closed)="error.set(null)"
      ></app-alert-banner>

      @if (loading() && !reporte()) {
        <div class="eco-card text-center py-5">
          <div class="spinner-border text-success mb-3" role="status"></div>
          <h5 class="font-display fw-bold mb-1">Calculando indicadores sobre Neon Cloud...</h5>
          <p class="text-muted small mb-0">Ejecutando agregaciones SQL sobre el padrón de equipos.</p>
        </div>
      }

      @if (reporte(); as data) {
        <!-- 4 KPIs Principales del Capítulo 1 -->
        <div class="row g-3 mb-4">
          <div class="col-sm-6 col-xl-3">
            <app-stat-card
              title="Índice de Circularidad"
              [value]="(data.indiceCircularidadPct | number:'1.1-2') + '%'"
              [subtitle]="(data.totalEquiposReutilizados + data.totalEquiposReparados | number) + ' equipos reutilizados o reparados'"
              icon="bi-recycle"
              variant="emerald"
              [progress]="data.indiceCircularidadPct"
              progressLabel="(Reutilizados + Reparados) / Total"
            ></app-stat-card>
          </div>

          <div class="col-sm-6 col-xl-3">
            <app-stat-card
              title="Completitud Trazabilidad"
              [value]="(data.completitudTrazabilidadPct | number:'1.1-2') + '%'"
              [subtitle]="(data.totalCerradosConEvidencia | number) + ' de ' + (data.totalEquiposCerrados | number) + ' cerrados con acta'"
              icon="bi-file-earmark-check-fill"
              variant="teal"
              [progress]="data.completitudTrazabilidadPct"
              progressLabel="Cerrados con destino y evidencia"
            ></app-stat-card>
          </div>

          <div class="col-sm-6 col-xl-3">
            <app-stat-card
              title="Exactitud de Registros"
              [value]="(data.tasaExactitudRegistrosPct | number:'1.1-2') + '%'"
              [subtitle]="'Sobre ' + (data.totalEquiposRecibidos | number) + ' equipos registrados'"
              icon="bi-patch-check-fill"
              variant="indigo"
              [progress]="data.tasaExactitudRegistrosPct"
              progressLabel="Serial y tipo verificados"
            ></app-stat-card>
          </div>

          <div class="col-sm-6 col-xl-3">
            <app-stat-card
              title="Duplicidad Detectada"
              [value]="(data.tasaDuplicidadDetectadaPct | number:'1.1-2') + '%'"
              subtitle="Control único por serial en base de datos"
              icon="bi-shield-shaded"
              variant="amber"
              [progress]="100 - data.tasaDuplicidadDetectadaPct"
              progressLabel="Índice de unicidad de seriales"
            ></app-stat-card>
          </div>
        </div>

        <!-- Volúmenes Globales (20,000 registros) + Gráfico de Distribución -->
        <div class="row g-4">
          <!-- Resumen de Volúmenes Operativos -->
          <div class="col-lg-5">
            <div class="eco-card h-100 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h5 class="font-display fw-bold mb-0">Balance Operativo Global</h5>
                  <span class="badge bg-dark-subtle text-dark-emphasis rounded-pill px-3">
                    Total: {{ data.totalEquiposRecibidos | number }} equipos
                  </span>
                </div>

                <div class="p-3 rounded-4 mb-3 bg-emerald-soft">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-uppercase small fw-bold text-success">Total Equipos Recibidos</span>
                      <div class="display-6 fw-bold font-display text-dark">
                        {{ data.totalEquiposRecibidos | number }}
                      </div>
                    </div>
                    <div class="display-5 text-success opacity-75">
                      <i class="bi bi-hdd-stack-fill"></i>
                    </div>
                  </div>
                </div>

                <div class="row g-2">
                  <div class="col-6">
                    <div class="metric-mini p-3 rounded-3 border">
                      <div class="text-muted small">En Proceso Activo</div>
                      <div class="h4 fw-bold font-display mb-0 text-primary">
                        {{ data.totalEquiposEnProceso | number }}
                      </div>
                      <small class="text-secondary">Recepción / Diag. / Rep.</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="metric-mini p-3 rounded-3 border">
                      <div class="text-muted small">Ciclos Cerrados</div>
                      <div class="h4 fw-bold font-display mb-0 text-success">
                        {{ data.totalEquiposCerrados | number }}
                      </div>
                      <small class="text-secondary">Con destino certificado</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="metric-mini p-3 rounded-3 border">
                      <div class="text-muted small">Reutilizados</div>
                      <div class="h5 fw-bold font-display mb-0" style="color: #059669;">
                        {{ data.totalEquiposReutilizados | number }}
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="metric-mini p-3 rounded-3 border">
                      <div class="text-muted small">Reparados</div>
                      <div class="h5 fw-bold font-display mb-0" style="color: #0d9488;">
                        {{ data.totalEquiposReparados | number }}
                      </div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="metric-mini p-2 rounded-3 border text-center">
                      <div class="text-muted" style="font-size: 0.75rem;">Reciclados</div>
                      <div class="fw-bold font-display">{{ data.totalEquiposReciclados | number }}</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="metric-mini p-2 rounded-3 border text-center">
                      <div class="text-muted" style="font-size: 0.75rem;">Desmantelados</div>
                      <div class="fw-bold font-display">{{ data.totalEquiposDesmantelados | number }}</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="metric-mini p-2 rounded-3 border text-center">
                      <div class="text-muted" style="font-size: 0.75rem;">Disp. Final</div>
                      <div class="fw-bold font-display text-danger">{{ data.totalEquiposDisposicionFinal | number }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-3 pt-3 border-top small text-muted d-flex align-items-center justify-content-between">
                <span><i class="bi bi-check2-all text-success me-1"></i>Evidencia documental validada</span>
                <strong>{{ data.totalCerradosConEvidencia | number }} / {{ data.totalEquiposCerrados | number }}</strong>
              </div>
            </div>
          </div>

          <!-- Distribución Visual por Estado -->
          <div class="col-lg-7">
            <div class="eco-card h-100">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h5 class="font-display fw-bold mb-0">Distribución por Estado del Ciclo de Vida</h5>
                  <p class="text-muted small mb-0">Desglose porcentual sobre el universo de equipos</p>
                </div>
                <span class="badge bg-emerald-subtle text-emerald border">8 Estados RAEE</span>
              </div>

              <div class="d-flex flex-column gap-3 mt-3">
                @for (fila of filasDistribucion(); track fila.estado) {
                  <div class="dist-row p-2 rounded-3">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                      <div class="d-flex align-items-center gap-2">
                        <app-estado-badge [estado]="fila.estado"></app-estado-badge>
                        @if (fila.esFinal) {
                          <span class="badge bg-light text-secondary border" style="font-size: 0.68rem;">
                            Estado Final
                          </span>
                        }
                      </div>
                      <div class="text-end">
                        <span class="fw-bold font-display me-2">{{ fila.cantidad | number }}</span>
                        <span class="text-muted small">({{ fila.porcentaje | number:'1.1-1' }}%)</span>
                      </div>
                    </div>
                    <div class="progress" style="height: 8px; border-radius: 999px;">
                      <div
                        class="progress-bar"
                        [ngClass]="fila.esFinal ? 'bg-success' : 'bg-info'"
                        [style.width.%]="Math.max(2, fila.porcentaje)"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .bg-emerald-soft {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(13, 148, 136, 0.08) 100%);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .bg-emerald-subtle {
      background: rgba(16, 185, 129, 0.1);
      color: #047857;
    }

    .metric-mini {
      background: #f8fafc;
    }

    .dist-row {
      background: #f8fafc;
      border: 1px solid rgba(226, 232, 240, 0.7);
    }

    .spin {
      animation: spinAnim 0.9s linear infinite;
    }

    @keyframes spinAnim {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class DashboardCircularidadComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);

  readonly reporte = signal<ReporteCircularidadDTO | null>(null);
  readonly loading = signal(false);
  readonly error = signal<ApiErrorResponse | null>(null);
  protected readonly Math = Math;

  readonly filasDistribucion = computed<FilaDistribucion[]>(() => {
    const rep = this.reporte();
    if (!rep) return [];
    const total = rep.totalEquiposRecibidos || 1;
    const dist = rep.distribucionPorEstado || {};

    return LISTA_ESTADOS_EQUIPO.map((meta) => {
      const cantidad = dist[meta.codigo] ?? 0;
      const porcentaje = rep.totalEquiposRecibidos > 0 ? (cantidad / total) * 100 : 0;
      return {
        estado: meta.codigo,
        etiqueta: meta.etiqueta,
        cantidad,
        porcentaje,
        esFinal: ESTADOS_EQUIPO_META[meta.codigo].esEstadoFinal
      };
    });
  });

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reporteService.obtenerReporteCircularidad().subscribe({
      next: (data) => {
        this.reporte.set(data);
        this.loading.set(false);
      },
      error: (err: ApiErrorResponse) => {
        this.error.set(err);
        this.loading.set(false);
      }
    });
  }
}

