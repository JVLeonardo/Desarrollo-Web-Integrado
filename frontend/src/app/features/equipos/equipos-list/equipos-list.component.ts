import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EquipoService } from '../../../core/services/equipo.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  ApiErrorResponse,
  EquipoResponseDTO,
  EstadoEquipoEnum,
  LISTA_ESTADOS_EQUIPO
} from '../../../core/models';
import { EstadoBadgeComponent } from '../../../shared/components/estado-badge/estado-badge.component';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';
import { EquipoFormComponent } from '../equipo-form/equipo-form.component';
import { CambioEstadoModalComponent } from '../cambio-estado-modal/cambio-estado-modal.component';

@Component({
  selector: 'app-equipos-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    EstadoBadgeComponent,
    AlertBannerComponent,
    EquipoFormComponent,
    CambioEstadoModalComponent
  ],
  template: `
    <div class="container-fluid py-4 px-3 px-lg-4">
      <!-- Page Header -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle">
              <i class="bi bi-lightning-charge-fill me-1"></i>Consulta Optimizada Top 100 (20K Neon DB)
            </span>
            <span class="badge bg-light text-secondary border">
              Mostrando {{ equiposFiltrados().length }} registros activos
            </span>
          </div>
          <h2 class="font-display fw-bold h3 mb-0">Inventario y Trazabilidad de Equipos RAEE</h2>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-eco-outline d-flex align-items-center gap-2"
            (click)="cargarEquipos()"
            [disabled]="loading()"
          >
            <i class="bi bi-arrow-clockwise"></i>
            <span>Refrescar</span>
          </button>

          @if (authService.canCreateOrEditEquipo()) {
            <button
              type="button"
              class="btn btn-eco-primary d-flex align-items-center gap-2"
              (click)="abrirModalCrear()"
            >
              <i class="bi bi-plus-lg"></i>
              <span>Recepcionar Equipo</span>
            </button>
          }
        </div>
      </div>

      <!-- Feedback Banners -->
      <app-alert-banner
        [apiError]="error()"
        [successMessage]="successMessage()"
        (closed)="error.set(null); successMessage.set(null)"
      ></app-alert-banner>

      <!-- Search & Filter Bar -->
      <div class="eco-card mb-4 p-3">
        <form class="row g-3 align-items-end" (ngSubmit)="buscarEnServidor()">
          <div class="col-md-5">
            <label class="form-label" for="filtroSerial">
              <i class="bi bi-upc-scan me-1"></i>Buscar por Serial o Tipo
            </label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-secondary">
                <i class="bi bi-search"></i>
              </span>
              <input
                id="filtroSerial"
                name="filtroSerial"
                type="text"
                class="form-control border-start-0"
                placeholder="Ej. DEMO-LAP, SN-PC, Laptop..."
                [ngModel]="filtroTexto()"
                (ngModelChange)="filtroTexto.set($event)"
              />
            </div>
          </div>

          <div class="col-md-4">
            <label class="form-label" for="filtroEstado">
              <i class="bi bi-funnel me-1"></i>Filtrar por Estado del Ciclo
            </label>
            <select
              id="filtroEstado"
              name="filtroEstado"
              class="form-select"
              [ngModel]="filtroEstado()"
              (ngModelChange)="onEstadoFilterChange($event)"
            >
              <option value="">Todos los estados (Últimos 100)</option>
              @for (est of estadosLista; track est.codigo) {
                <option [value]="est.codigo">{{ est.etiqueta }}</option>
              }
            </select>
          </div>

          <div class="col-md-3 d-flex gap-2">
            <button type="submit" class="btn btn-eco-primary flex-grow-1">
              <i class="bi bi-cloud-arrow-down me-1"></i>Consultar DB
            </button>
            @if (filtroTexto() || filtroEstado()) {
              <button
                type="button"
                class="btn btn-eco-outline"
                (click)="limpiarFiltros()"
                title="Limpiar filtros"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            }
          </div>
        </form>
      </div>

      <!-- Data Table -->
      <div class="eco-card p-0 overflow-hidden">
        @if (loading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-success mb-3" role="status"></div>
            <h6 class="font-display fw-bold mb-1">Consultando padrón de equipos en Neon Cloud...</h6>
            <p class="text-muted small mb-0">Recuperando lote optimizado de registros activos.</p>
          </div>
        } @else if (equiposFiltrados().length === 0) {
          <div class="text-center py-5 px-3">
            <i class="bi bi-inbox display-4 text-secondary opacity-50 d-block mb-2"></i>
            <h5 class="font-display fw-bold">No se encontraron equipos con los criterios actuales</h5>
            <p class="text-muted small mb-3">
              Pruebe limpiando los filtros o realice una búsqueda directa en la base de datos.
            </p>
            <button type="button" class="btn btn-sm btn-eco-outline" (click)="limpiarFiltros()">
              Restablecer listado
            </button>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table table-eco align-middle">
              <thead>
                <tr>
                  <th>ID / Serial</th>
                  <th>Tipo y Especificaciones</th>
                  <th>Estado Actual</th>
                  <th>Destino / Evidencia</th>
                  <th>Ingreso</th>
                  <th class="text-end">Acciones RBAC</th>
                </tr>
              </thead>
              <tbody>
                @for (eq of equiposPaginados(); track eq.id) {
                  <tr>
                    <td>
                      <div class="fw-bold font-monospace text-dark">{{ eq.serial }}</div>
                      <span class="text-muted" style="font-size: 0.74rem;">ID #{{ eq.id }}</span>
                    </td>

                    <td style="max-width: 290px;">
                      <div class="fw-semibold text-dark">{{ eq.tipo }}</div>
                      <div class="text-muted small text-truncate" [title]="eq.caracteristicas || ''">
                        {{ eq.caracteristicas || 'Sin especificaciones' }}
                      </div>
                    </td>

                    <td>
                      <app-estado-badge [estado]="eq.estadoActual"></app-estado-badge>
                    </td>

                    <td style="max-width: 240px;">
                      @if (eq.destinoFinal) {
                        <div class="small fw-semibold text-dark text-truncate" [title]="eq.destinoFinal">
                          <i class="bi bi-geo-alt-fill text-success me-1"></i>{{ eq.destinoFinal }}
                        </div>
                        @if (eq.evidenciaDestino) {
                          <div class="text-muted text-truncate" style="font-size: 0.75rem;" [title]="eq.evidenciaDestino">
                            <i class="bi bi-file-earmark-check me-1"></i>{{ eq.evidenciaDestino }}
                          </div>
                        }
                      } @else {
                        <span class="text-muted small fst-italic">En flujo operativo</span>
                      }
                    </td>

                    <td>
                      <div class="small text-secondary">{{ eq.fechaIngreso | date:'dd/MM/yyyy' }}</div>
                      <div class="text-muted" style="font-size: 0.72rem;">{{ eq.fechaIngreso | date:'HH:mm' }} hrs</div>
                    </td>

                    <td class="text-end">
                      <div class="d-inline-flex align-items-center gap-1">
                        <!-- Pasaporte Digital (Todos los roles) -->
                        <a
                          [routerLink]="['/equipos', eq.id, 'pasaporte']"
                          class="btn btn-sm btn-outline-success rounded-3 d-inline-flex align-items-center gap-1"
                          title="Ver Pasaporte Digital e Historial"
                        >
                          <i class="bi bi-qr-code"></i>
                          <span class="d-none d-xl-inline">Pasaporte</span>
                        </a>

                        <!-- Cambiar Estado (TECNICO, SUPERVISOR) -->
                        @if (authService.canChangeEstado()) {
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-warning rounded-3 text-dark-emphasis"
                            (click)="abrirModalEstado(eq)"
                            title="Cambiar estado del ciclo de vida (PATCH)"
                          >
                            <i class="bi bi-arrow-left-right"></i>
                          </button>
                        }

                        <!-- Editar Datos (RECEPCION, SUPERVISOR) -->
                        @if (authService.canCreateOrEditEquipo()) {
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-primary rounded-3"
                            (click)="abrirModalEditar(eq)"
                            title="Editar datos del equipo (PUT)"
                          >
                            <i class="bi bi-pencil"></i>
                          </button>
                        }

                        <!-- Baja Lógica (Solo SUPERVISOR) -->
                        @if (authService.canDeleteEquipo()) {
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-danger rounded-3"
                            (click)="confirmarBajaLogica(eq)"
                            title="Baja lógica del equipo (DELETE)"
                          >
                            <i class="bi bi-trash3"></i>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 px-4 py-3 bg-light border-top">
            <div class="small text-muted">
              Mostrando página <strong>{{ paginaActual() }}</strong> de <strong>{{ totalPaginas() }}</strong>
              ({{ equiposFiltrados().length }} equipos activos en vista)
            </div>
            <div class="btn-group btn-group-sm">
              <button
                type="button"
                class="btn btn-outline-secondary"
                [disabled]="paginaActual() <= 1"
                (click)="paginaActual.set(paginaActual() - 1)"
              >
                <i class="bi bi-chevron-left"></i> Anterior
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary"
                [disabled]="paginaActual() >= totalPaginas()"
                (click)="paginaActual.set(paginaActual() + 1)"
              >
                Siguiente <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Modal Crear / Editar Equipo -->
    @if (mostrarModalForm()) {
      <app-equipo-form
        [equipoEditar]="equipoSeleccionadoForm()"
        (saved)="onEquipoGuardado($event)"
        (cancelled)="mostrarModalForm.set(false)"
      ></app-equipo-form>
    }

    <!-- Modal Cambiar Estado -->
    @if (equipoSeleccionadoEstado(); as eqEstado) {
      <app-cambio-estado-modal
        [equipo]="eqEstado"
        (updated)="onEstadoActualizado($event)"
        (cancelled)="equipoSeleccionadoEstado.set(null)"
      ></app-cambio-estado-modal>
    }
  `
})
export class EquiposListComponent implements OnInit {
  private readonly equipoService = inject(EquipoService);
  readonly authService = inject(AuthService);

  readonly estadosLista = LISTA_ESTADOS_EQUIPO;
  readonly equipos = signal<EquipoResponseDTO[]>([]);
  readonly loading = signal(false);
  readonly error = signal<ApiErrorResponse | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly filtroTexto = signal('');
  readonly filtroEstado = signal<EstadoEquipoEnum | ''>('');
  readonly paginaActual = signal(1);
  readonly itemsPorPagina = 15;

  // Modals state
  readonly mostrarModalForm = signal(false);
  readonly equipoSeleccionadoForm = signal<EquipoResponseDTO | null>(null);
  readonly equipoSeleccionadoEstado = signal<EquipoResponseDTO | null>(null);

  readonly equiposFiltrados = computed(() => {
    const texto = this.filtroTexto().trim().toLowerCase();
    const estado = this.filtroEstado();

    return this.equipos().filter((e) => {
      const coincideEstado = !estado || e.estadoActual === estado;
      const coincideTexto =
        !texto ||
        e.serial.toLowerCase().includes(texto) ||
        e.tipo.toLowerCase().includes(texto) ||
        (e.caracteristicas ?? '').toLowerCase().includes(texto) ||
        (e.destinoFinal ?? '').toLowerCase().includes(texto);
      return coincideEstado && coincideTexto;
    });
  });

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.equiposFiltrados().length / this.itemsPorPagina))
  );

  readonly equiposPaginados = computed(() => {
    const pagina = Math.min(this.paginaActual(), this.totalPaginas());
    const inicio = (pagina - 1) * this.itemsPorPagina;
    return this.equiposFiltrados().slice(inicio, inicio + this.itemsPorPagina);
  });

  ngOnInit(): void {
    this.cargarEquipos();
  }

  cargarEquipos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.equipoService
      .listarTodos(this.filtroTexto(), this.filtroEstado())
      .subscribe({
        next: (lista) => {
          this.equipos.set(lista);
          this.paginaActual.set(1);
          this.loading.set(false);
        },
        error: (err: ApiErrorResponse) => {
          this.error.set(err);
          this.loading.set(false);
        }
      });
  }

  buscarEnServidor(): void {
    this.cargarEquipos();
  }

  onEstadoFilterChange(nuevoEstado: EstadoEquipoEnum | ''): void {
    this.filtroEstado.set(nuevoEstado);
    this.paginaActual.set(1);
    this.cargarEquipos();
  }

  limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.filtroEstado.set('');
    this.paginaActual.set(1);
    this.cargarEquipos();
  }

  abrirModalCrear(): void {
    this.equipoSeleccionadoForm.set(null);
    this.mostrarModalForm.set(true);
  }

  abrirModalEditar(equipo: EquipoResponseDTO): void {
    this.equipoSeleccionadoForm.set(equipo);
    this.mostrarModalForm.set(true);
  }

  abrirModalEstado(equipo: EquipoResponseDTO): void {
    this.equipoSeleccionadoEstado.set(equipo);
  }

  onEquipoGuardado(equipo: EquipoResponseDTO): void {
    const eraEdicion = !!this.equipoSeleccionadoForm();
    this.mostrarModalForm.set(false);
    this.equipoSeleccionadoForm.set(null);
    this.successMessage.set(
      eraEdicion
        ? `Equipo ${equipo.serial} actualizado correctamente.`
        : `Equipo ${equipo.serial} recepcionado y Pasaporte Digital generado.`
    );
    this.cargarEquipos();
  }

  onEstadoActualizado(equipo: EquipoResponseDTO): void {
    this.equipoSeleccionadoEstado.set(null);
    this.successMessage.set(
      `Transición completada: ${equipo.serial} pasó al estado ${equipo.estadoActual}.`
    );
    this.cargarEquipos();
  }

  confirmarBajaLogica(equipo: EquipoResponseDTO): void {
    const confirmar = window.confirm(
      `¿Confirmar baja lógica del equipo "${equipo.serial}" (${equipo.tipo})?\nEl registro y su Pasaporte Digital se conservarán para auditoría con activo = false.`
    );
    if (!confirmar) return;

    this.error.set(null);
    this.equipoService.desactivarEquipo(equipo.id).subscribe({
      next: () => {
        this.successMessage.set(
          `Baja lógica aplicada al equipo ${equipo.serial}. Su Pasaporte Digital permanece íntegro para auditoría.`
        );
        this.cargarEquipos();
      },
      error: (err: ApiErrorResponse) => {
        this.error.set(err);
      }
    });
  }
}

