import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipoService } from '../../../core/services/equipo.service';
import {
  ApiErrorResponse,
  CambioEstadoRequestDTO,
  EquipoResponseDTO,
  LISTA_ESTADOS_EQUIPO,
  esEstadoFinalEquipo
} from '../../../core/models';
import { EstadoBadgeComponent } from '../../../shared/components/estado-badge/estado-badge.component';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';

@Component({
  selector: 'app-cambio-estado-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, EstadoBadgeComponent, AlertBannerComponent],
  template: `
    @if (equipo) {
      <div class="eco-modal-backdrop" (click)="onCancel()">
        <div class="eco-modal-dialog p-4" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
            <div class="d-flex align-items-center gap-3">
              <div class="modal-icon">
                <i class="bi bi-arrow-left-right"></i>
              </div>
              <div>
                <h5 class="font-display fw-bold mb-0">Transición de Estado del Ciclo de Vida</h5>
                <div class="d-flex align-items-center gap-2 mt-1">
                  <span class="badge bg-dark font-monospace">{{ equipo.serial }}</span>
                  <span class="text-muted small">{{ equipo.tipo }}</span>
                </div>
              </div>
            </div>
            <button type="button" class="btn-close" (click)="onCancel()"></button>
          </div>

          <app-alert-banner
            [apiError]="error()"
            (closed)="error.set(null)"
          ></app-alert-banner>

          <form (ngSubmit)="onSubmit()">
            <div class="p-3 rounded-3 bg-light border mb-3 d-flex align-items-center justify-content-between">
              <div>
                <div class="small text-muted">Estado Actual</div>
                <app-estado-badge [estado]="equipo.estadoActual"></app-estado-badge>
              </div>
              <i class="bi bi-arrow-right fs-4 text-secondary"></i>
              <div class="text-end">
                <div class="small text-muted">Nuevo Estado Seleccionado</div>
                <app-estado-badge [estado]="form.nuevoEstado"></app-estado-badge>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="nuevoEstado">Seleccionar Nuevo Estado *</label>
              <select
                id="nuevoEstado"
                name="nuevoEstado"
                class="form-select"
                [(ngModel)]="form.nuevoEstado"
                required
              >
                @for (est of estadosDisponibles; track est.codigo) {
                  <option [ngValue]="est.codigo">
                    {{ est.etiqueta }} {{ est.esEstadoFinal ? '🔒 (Estado Final - Requiere Evidencia)' : '' }}
                  </option>
                }
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label" for="motivo">Dictamen Técnico / Motivo de la Transición (5 - 500 caracteres) *</label>
              <textarea
                id="motivo"
                name="motivo"
                rows="2"
                class="form-control"
                placeholder="Describa las pruebas realizadas, repuestos instalados o razón del cambio de estado..."
                [(ngModel)]="form.motivo"
                required
                minlength="5"
                maxlength="500"
              ></textarea>
            </div>

            @if (requiereEvidencia) {
              <div class="p-3 rounded-4 evidence-box mb-3">
                <div class="d-flex align-items-center gap-2 mb-2 text-warning-emphasis fw-bold small">
                  <i class="bi bi-shield-exclamation fs-5"></i>
                  <span>Regla de Trazabilidad (HTTP 422): Cierre de Ciclo Obligatorio con Evidencia</span>
                </div>
                <p class="small text-muted mb-3">
                  Para pasar a <strong>{{ form.nuevoEstado }}</strong> es obligatorio registrar la entidad/destino final
                  y el documento o acta de respaldo para el Pasaporte Digital.
                </p>

                <div class="mb-3">
                  <label class="form-label" for="destinoFinal">Destino Final / Entidad Receptora *</label>
                  <input
                    id="destinoFinal"
                    name="destinoFinal"
                    type="text"
                    class="form-control"
                    placeholder="Ej. Donación a I.E. San Martín / Operador RAEE EcoRecicla SAC"
                    [(ngModel)]="form.destinoFinal"
                  />
                </div>

                <div>
                  <label class="form-label" for="evidenciaDestino">Evidencia Documental (Acta / Certificado / URL) *</label>
                  <input
                    id="evidenciaDestino"
                    name="evidenciaDestino"
                    type="text"
                    class="form-control"
                    placeholder="Ej. Acta de Donación N° 045-2026 o URL del certificado PDF"
                    [(ngModel)]="form.evidenciaDestino"
                  />
                </div>
              </div>
            }

            <div class="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 border-top">
              <button type="button" class="btn btn-eco-outline" (click)="onCancel()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-eco-primary d-flex align-items-center gap-2"
                [disabled]="loading() || !form.motivo || form.motivo.trim().length < 5"
              >
                @if (loading()) {
                  <span class="spinner-border spinner-border-sm"></span>
                  <span>Procesando transición...</span>
                } @else {
                  <i class="bi bi-check2-circle"></i>
                  <span>Registrar Transición en Pasaporte</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(245, 158, 11, 0.16);
      color: #d97706;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .evidence-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
    }
  `]
})
export class CambioEstadoModalComponent implements OnChanges {
  private readonly equipoService = inject(EquipoService);

  @Input({ required: true }) equipo!: EquipoResponseDTO | null;
  @Output() updated = new EventEmitter<EquipoResponseDTO>();
  @Output() cancelled = new EventEmitter<void>();

  readonly estadosDisponibles = LISTA_ESTADOS_EQUIPO;
  readonly loading = signal(false);
  readonly error = signal<ApiErrorResponse | null>(null);

  form: CambioEstadoRequestDTO = {
    nuevoEstado: 'EN_DIAGNOSTICO',
    motivo: '',
    destinoFinal: '',
    evidenciaDestino: ''
  };

  get requiereEvidencia(): boolean {
    return esEstadoFinalEquipo(this.form.nuevoEstado);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['equipo'] && this.equipo) {
      this.form = {
        nuevoEstado: this.sugerirSiguienteEstado(this.equipo.estadoActual),
        motivo: '',
        destinoFinal: this.equipo.destinoFinal ?? '',
        evidenciaDestino: this.equipo.evidenciaDestino ?? ''
      };
      this.error.set(null);
    }
  }

  onSubmit(): void {
    if (!this.equipo) return;

    this.loading.set(true);
    this.error.set(null);

    const payload: CambioEstadoRequestDTO = {
      nuevoEstado: this.form.nuevoEstado,
      motivo: this.form.motivo.trim(),
      destinoFinal: this.form.destinoFinal?.trim() || null,
      evidenciaDestino: this.form.evidenciaDestino?.trim() || null
    };

    this.equipoService.cambiarEstado(this.equipo.id, payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.updated.emit(res);
      },
      error: (err: ApiErrorResponse) => {
        this.loading.set(false);
        this.error.set(err);
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private sugerirSiguienteEstado(actual: EquipoResponseDTO['estadoActual']): EquipoResponseDTO['estadoActual'] {
    switch (actual) {
      case 'RECEPCIONADO':
        return 'EN_DIAGNOSTICO';
      case 'EN_DIAGNOSTICO':
        return 'EN_REPARACION';
      case 'EN_REPARACION':
        return 'REPARADO';
      case 'REPARADO':
        return 'REUTILIZADO';
      default:
        return actual;
    }
  }
}

