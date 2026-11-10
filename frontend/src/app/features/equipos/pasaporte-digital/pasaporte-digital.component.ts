import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EquipoService } from '../../../core/services/equipo.service';
import {
  ApiErrorResponse,
  PasaporteDigitalResponseDTO,
  ROLES_METADATA
} from '../../../core/models';
import { EstadoBadgeComponent } from '../../../shared/components/estado-badge/estado-badge.component';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';

@Component({
  selector: 'app-pasaporte-digital',
  standalone: true,
  imports: [CommonModule, RouterModule, EstadoBadgeComponent, AlertBannerComponent],
  template: `
    <div class="container-fluid py-4 px-3 px-lg-4">
      <!-- Top Breadcrumb / Back Action -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div class="d-flex align-items-center gap-3">
          <a routerLink="/equipos" class="btn btn-eco-outline d-flex align-items-center gap-2">
            <i class="bi bi-arrow-left"></i>
            <span>Volver al Inventario</span>
          </a>
          <div>
            <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle mb-1">
              <i class="bi bi-qr-code-scan me-1"></i>Certificado de Trazabilidad Inmutable
            </span>
            <h2 class="font-display fw-bold h4 mb-0">Pasaporte Digital del Activo RAEE</h2>
          </div>
        </div>

        <button
          type="button"
          class="btn btn-eco-outline d-flex align-items-center gap-2"
          (click)="imprimirPasaporte()"
        >
          <i class="bi bi-printer"></i>
          <span>Imprimir / Exportar PDF</span>
        </button>
      </div>

      <app-alert-banner
        [apiError]="error()"
        (closed)="error.set(null)"
      ></app-alert-banner>

      @if (loading()) {
        <div class="eco-card text-center py-5">
          <div class="spinner-border text-success mb-3" role="status"></div>
          <h5 class="font-display fw-bold mb-1">Recuperando Pasaporte Digital...</h5>
          <p class="text-muted small mb-0">Consultando historial cronológico auditable.</p>
        </div>
      }

      @if (pasaporte(); as data) {
        <!-- Passport Header Card -->
        <div class="passport-hero p-4 rounded-4 mb-4 text-white shadow">
          <div class="row g-4 align-items-center">
            <div class="col-lg-8">
              <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span class="badge bg-emerald text-white px-3 py-1 rounded-pill">
                  ID #{{ data.equipo.id }}
                </span>
                <span class="font-monospace fw-bold fs-5 px-3 py-1 rounded-3 bg-white bg-opacity-10 border border-light border-opacity-25">
                  SN: {{ data.equipo.serial }}
                </span>
                <app-estado-badge [estado]="data.equipo.estadoActual"></app-estado-badge>
                @if (data.equipo.activo === false) {
                  <span class="badge bg-danger">BAJA LÓGICA (INACTIVO)</span>
                }
              </div>

              <h3 class="font-display fw-bold mb-1">{{ data.equipo.tipo }}</h3>
              <p class="text-slate-300 mb-3">
                {{ data.equipo.caracteristicas || 'Sin especificaciones adicionales registradas' }}
              </p>

              <div class="p-3 rounded-3 bg-white bg-opacity-10 border border-light border-opacity-10">
                <div class="small text-emerald-light fw-bold text-uppercase mb-1">
                  <i class="bi bi-shield-check me-1"></i>Resumen Oficial del Ciclo de Vida
                </div>
                <div class="fw-semibold">{{ data.resumenCicloVida }}</div>
              </div>
            </div>

            <div class="col-lg-4">
              <div class="passport-seal p-3 rounded-4 text-center">
                <i class="bi bi-patch-check-fill display-5 text-emerald d-block mb-2"></i>
                <div class="fw-bold font-display">PASAPORTE VERIFICADO</div>
                <div class="small text-slate-300 mb-2">
                  {{ data.totalTransiciones }} {{ data.totalTransiciones === 1 ? 'transición registrada' : 'transiciones registradas' }}
                </div>
                <div class="border-top border-secondary border-opacity-50 pt-2 small text-slate-300">
                  <div>Ingreso: {{ data.equipo.fechaIngreso | date:'dd/MM/yyyy HH:mm' }}</div>
                  @if (data.equipo.fechaCierre) {
                    <div>Cierre: {{ data.equipo.fechaCierre | date:'dd/MM/yyyy HH:mm' }}</div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Datos de Cierre y Evidencia Documental -->
          <div class="col-lg-4">
            <div class="eco-card h-100">
              <h5 class="font-display fw-bold mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-file-earmark-medical-fill text-success"></i>
                <span>Certificación de Destino</span>
              </h5>

              <div class="mb-3">
                <div class="text-muted small">Estado de Cierre Circular</div>
                <div class="fw-bold mt-1">
                  @if (data.equipo.cerrado) {
                    <span class="text-success"><i class="bi bi-lock-fill me-1"></i>Ciclo Cerrado Formalmente</span>
                  } @else {
                    <span class="text-primary"><i class="bi bi-hourglass-split me-1"></i>En Proceso Operativo</span>
                  }
                </div>
              </div>

              <div class="mb-3 p-3 rounded-3 bg-light border">
                <div class="text-muted small fw-semibold mb-1">Destino Final / Entidad Beneficiaria</div>
                <div class="fw-bold text-dark">
                  {{ data.equipo.destinoFinal || 'Pendiente de asignación de cierre' }}
                </div>
              </div>

              <div class="mb-3 p-3 rounded-3 bg-light border">
                <div class="text-muted small fw-semibold mb-1">Evidencia Documental / Acta</div>
                @if (data.equipo.evidenciaDestino) {
                  <div class="fw-semibold text-success text-break">
                    <i class="bi bi-file-earmark-check me-1"></i>{{ data.equipo.evidenciaDestino }}
                  </div>
                } @else {
                  <div class="text-muted">Sin documento de cierre adjunto</div>
                }
              </div>

              <div class="small text-muted border-top pt-3 mt-auto">
                <div><strong>Fecha de Emisión Pasaporte:</strong></div>
                <div>{{ data.fechaGeneracion | date:'dd/MM/yyyy HH:mm:ss' }}</div>
              </div>
            </div>
          </div>

          <!-- Línea de Tiempo Auditable (Historial) -->
          <div class="col-lg-8">
            <div class="eco-card h-100">
              <div class="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h5 class="font-display fw-bold mb-0">Línea de Tiempo Auditable (Trazabilidad)</h5>
                  <p class="text-muted small mb-0">
                    Registro inmutable de transiciones de estado y operadores responsables
                  </p>
                </div>
                <span class="badge bg-dark rounded-pill px-3 py-2">
                  {{ data.historial.length }} eventos
                </span>
              </div>

              <div class="timeline-container ps-3">
                @for (evento of data.historial; track evento.id; let idx = $index) {
                  <div class="timeline-item pb-4 position-relative">
                    <div class="timeline-marker">
                      <span>{{ idx + 1 }}</span>
                    </div>

                    <div class="timeline-card p-3 rounded-4 border bg-light-subtle ms-3">
                      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                          @if (evento.estadoAnterior) {
                            <app-estado-badge [estado]="evento.estadoAnterior" [showFinalTag]="false"></app-estado-badge>
                            <i class="bi bi-arrow-right text-secondary"></i>
                          } @else {
                            <span class="badge bg-secondary-subtle text-secondary-emphasis">ALTA INICIAL</span>
                            <i class="bi bi-arrow-right text-secondary"></i>
                          }
                          <app-estado-badge [estado]="evento.estadoNuevo"></app-estado-badge>
                        </div>

                        <span class="text-muted small font-monospace">
                          <i class="bi bi-clock me-1"></i>{{ evento.fecha | date:'dd/MM/yyyy HH:mm:ss' }}
                        </span>
                      </div>

                      <p class="mb-2 text-dark fw-medium">{{ evento.motivo }}</p>

                      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top small text-secondary">
                        <div>
                          <i class="bi bi-person-check-fill text-success me-1"></i>
                          <strong>{{ evento.usuarioNombre }}</strong>
                          <span class="text-muted">(&#64;{{ evento.usuarioUsername }})</span>
                        </div>
                        <span class="badge bg-white text-dark border">
                          Rol: {{ evento.usuarioRol }}
                        </span>
                      </div>
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
    .passport-hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 65%, #064e3b 100%);
    }

    .bg-emerald { background-color: #10b981; }
    .text-emerald { color: #10b981; }
    .text-emerald-light { color: #6ee7b7; }
    .text-slate-300 { color: #cbd5e1; }

    .passport-seal {
      background: rgba(255, 255, 255, 0.06);
      border: 1px dashed rgba(16, 185, 129, 0.5);
    }

    .timeline-container {
      border-left: 2px solid #cbd5e1;
      margin-left: 1rem;
    }

    .timeline-marker {
      position: absolute;
      left: -31px;
      top: 10px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #10b981;
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 0 4px #ffffff;
    }

    .timeline-card {
      background: #f8fafc;
      transition: transform 0.15s ease;

      &:hover {
        transform: translateX(3px);
        border-color: #10b981 !important;
      }
    }
  `]
})
export class PasaporteDigitalComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly equipoService = inject(EquipoService);

  readonly pasaporte = signal<PasaporteDigitalResponseDTO | null>(null);
  readonly loading = signal(false);
  readonly error = signal<ApiErrorResponse | null>(null);
  readonly rolesMeta = ROLES_METADATA;

  ngOnInit(): void {
    const idParam = Number(this.route.snapshot.paramMap.get('id'));
    if (idParam) {
      this.cargarPasaporte(idParam);
    }
  }

  cargarPasaporte(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.equipoService.obtenerPasaporteDigital(id).subscribe({
      next: (res) => {
        this.pasaporte.set(res);
        this.loading.set(false);
      },
      error: (err: ApiErrorResponse) => {
        this.error.set(err);
        this.loading.set(false);
      }
    });
  }

  imprimirPasaporte(): void {
    window.print();
  }
}

