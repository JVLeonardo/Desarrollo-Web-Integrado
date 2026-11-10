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
  EquipoRequestDTO,
  EquipoResponseDTO,
  LISTA_ESTADOS_EQUIPO
} from '../../../core/models';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';

@Component({
  selector: 'app-equipo-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertBannerComponent],
  template: `
    <div class="eco-modal-backdrop" (click)="onCancel()">
      <div class="eco-modal-dialog p-4" (click)="$event.stopPropagation()">
        <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="modal-icon">
              <i class="bi" [ngClass]="esEdicion ? 'bi-pencil-square' : 'bi-plus-circle-fill'"></i>
            </div>
            <div>
              <h5 class="font-display fw-bold mb-0">
                {{ esEdicion ? 'Actualizar Datos del Equipo' : 'Recepcionar Nuevo Equipo RAEE' }}
              </h5>
              <small class="text-muted">
                {{ esEdicion ? 'Modifica serial, tipo o características y registra evento en Pasaporte Digital' : 'Registra ingreso inicial y genera su Pasaporte Digital' }}
              </small>
            </div>
          </div>
          <button type="button" class="btn-close" (click)="onCancel()"></button>
        </div>

        <app-alert-banner
          [apiError]="error()"
          (closed)="error.set(null)"
        ></app-alert-banner>

        <form (ngSubmit)="onSubmit()" #eqForm="ngForm">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="serial">Número de Serie Único *</label>
              <input
                id="serial"
                name="serial"
                type="text"
                class="form-control"
                placeholder="Ej. DEMO-LAP-2026-01"
                [(ngModel)]="form.serial"
                required
                maxlength="100"
              />
              <div class="form-text small">Validación estricta anti-duplicados (HTTP 409).</div>
            </div>

            <div class="col-md-6">
              <label class="form-label" for="tipo">Tipo / Categoría de Equipo *</label>
              <input
                id="tipo"
                name="tipo"
                type="text"
                class="form-control"
                list="tiposSugeridos"
                placeholder="Ej. Laptop, PC de escritorio, Monitor"
                [(ngModel)]="form.tipo"
                required
                maxlength="80"
              />
              <datalist id="tiposSugeridos">
                <option value="Laptop"></option>
                <option value="PC de escritorio"></option>
                <option value="Monitor"></option>
                <option value="Impresora"></option>
                <option value="Servidor"></option>
                <option value="Teléfono IP"></option>
                <option value="Switch / Router"></option>
              </datalist>
            </div>

            @if (!esEdicion) {
              <div class="col-12">
                <label class="form-label" for="estadoInicial">Estado Inicial de Ingreso</label>
                <select
                  id="estadoInicial"
                  name="estadoInicial"
                  class="form-select"
                  [(ngModel)]="form.estadoInicial"
                >
                  @for (est of estadosIniciales; track est.codigo) {
                    <option [ngValue]="est.codigo">
                      {{ est.etiqueta }} — {{ est.descripcion }}
                    </option>
                  }
                </select>
              </div>
            }

            <div class="col-12">
              <label class="form-label" for="caracteristicas">Especificaciones Técnicas / Estado Físico</label>
              <textarea
                id="caracteristicas"
                name="caracteristicas"
                rows="3"
                class="form-control"
                placeholder="Ej. Dell Latitude 5420, Intel Core i5 11th Gen, 16GB RAM, SSD 512GB..."
                [(ngModel)]="form.caracteristicas"
              ></textarea>
            </div>
          </div>

          <div class="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 border-top">
            <button type="button" class="btn btn-eco-outline" (click)="onCancel()">
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-eco-primary d-flex align-items-center gap-2"
              [disabled]="loading() || !form.serial.trim() || !form.tipo.trim()"
            >
              @if (loading()) {
                <span class="spinner-border spinner-border-sm"></span>
                <span>Guardando...</span>
              } @else {
                <i class="bi bi-check2-circle"></i>
                <span>{{ esEdicion ? 'Guardar Cambios' : 'Registrar Equipo' }}</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(16, 185, 129, 0.14);
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
  `]
})
export class EquipoFormComponent implements OnChanges {
  private readonly equipoService = inject(EquipoService);

  @Input() equipoEditar: EquipoResponseDTO | null = null;
  @Output() saved = new EventEmitter<EquipoResponseDTO>();
  @Output() cancelled = new EventEmitter<void>();

  readonly estadosIniciales = LISTA_ESTADOS_EQUIPO.filter((e) => !e.esEstadoFinal);
  readonly loading = signal(false);
  readonly error = signal<ApiErrorResponse | null>(null);

  form: EquipoRequestDTO = {
    serial: '',
    tipo: '',
    caracteristicas: '',
    estadoInicial: 'RECEPCIONADO'
  };

  get esEdicion(): boolean {
    return !!this.equipoEditar;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['equipoEditar']) {
      if (this.equipoEditar) {
        this.form = {
          serial: this.equipoEditar.serial,
          tipo: this.equipoEditar.tipo,
          caracteristicas: this.equipoEditar.caracteristicas ?? '',
          estadoInicial: this.equipoEditar.estadoActual
        };
      } else {
        this.form = {
          serial: '',
          tipo: '',
          caracteristicas: '',
          estadoInicial: 'RECEPCIONADO'
        };
      }
      this.error.set(null);
    }
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    const payload: EquipoRequestDTO = {
      serial: this.form.serial.trim(),
      tipo: this.form.tipo.trim(),
      caracteristicas: this.form.caracteristicas?.trim() || null,
      estadoInicial: this.esEdicion ? null : this.form.estadoInicial
    };

    const request$ =
      this.esEdicion && this.equipoEditar
        ? this.equipoService.actualizarEquipo(this.equipoEditar.id, payload)
        : this.equipoService.registrarEquipo(payload);

    request$.subscribe({
      next: (resultado) => {
        this.loading.set(false);
        this.saved.emit(resultado);
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
}

