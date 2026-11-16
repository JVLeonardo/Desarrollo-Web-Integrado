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
      <div class="page-header">
        <div>
          <span class="eyebrow">Inventario</span>
          <h2>Equipos y trazabilidad</h2>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-eco-outline" (click)="cargarEquipos()" [disabled]="loading()">
            <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
          </button>

          @if (authService.canCreateOrEditEquipo()) {
            <button type="button" class="btn btn-eco-primary" (click)="abrirModalCrear()">
              <i class="bi bi-plus-lg me-1"></i>Recepcionar equipo
            </button>
          }
        </div>
      </div>

      <app-alert-banner
        [apiError]="error()"
        [successMessage]="successMessage()"
        (closed)="error.set(null); successMessage.set(null)"
      ></app-alert-banner>

      <!-- Filtros -->
      <form class="filters" (ngSubmit)="buscarEnServidor()">
        <div class="filter-search">
          <i class="bi bi-search"></i>
          <input
            id="filtroSerial"
            name="filtroSerial"
            type="text"
            class="form-control"
            placeholder="Buscar por serial…"
            [ngModel]="filtroTexto()"
            (ngModelChange)="filtroTexto.set($event)"
            aria-label="Buscar por serial"
          />
        </div>

        <select
          id="filtroEstado"
          name="filtroEstado"
          class="form-select filter-select"
          [ngModel]="filtroEstado()"
          (ngModelChange)="onEstadoFilterChange($event)"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          @for (est of estadosLista; track est.codigo) {
            <option [value]="est.codigo">{{ est.etiqueta }}</option>
          }
        </select>

        <button type="submit" class="btn btn-eco-outline">Buscar</button>
        @if (filtroTexto() || filtroEstado()) {
          <button type="button" class="btn btn-eco-outline" (click)="limpiarFiltros()" title="Limpiar filtros">
            <i class="bi bi-x-lg"></i>
          </button>
        }

        <span class="result-count mono">{{ equiposFiltrados().length }} resultados · máx. 100</span>
      </form>

      <!-- Tabla -->
      <div class="eco-card p-0 overflow-hidden">
        @if (loading()) {
          <div class="state-box">
            <div class="spinner-border spinner-border-sm text-success mb-2" role="status"></div>
            <div>Consultando inventario…</div>
          </div>
        } @else if (equiposFiltrados().length === 0) {
          <div class="state-box">
            <i class="bi bi-inbox"></i>
            <div class="fw-semibold">Sin resultados</div>
            <div class="state-hint">Ajusta los filtros o restablece el listado.</div>
            <button type="button" class="btn btn-eco-outline mt-3" (click)="limpiarFiltros()">Restablecer</button>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table table-eco align-middle">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Equipo</th>
                  <th>Estado</th>
                  <th>Destino</th>
                  <th>Ingreso</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (eq of equiposPaginados(); track eq.id) {
                  <tr>
                    <td>
                      <div class="serial mono">{{ eq.serial }}</div>
                      <div class="row-id mono">#{{ eq.id }}</div>
                    </td>

                    <td class="cell-wide">
                      <div class="fw-semibold">{{ eq.tipo }}</div>
                      <div class="cell-sub text-truncate" [title]="eq.caracteristicas || ''">
                        {{ eq.caracteristicas || '—' }}
                      </div>
                    </td>

                    <td><app-estado-badge [estado]="eq.estadoActual"></app-estado-badge></td>

                    <td class="cell-wide">
                      @if (eq.destinoFinal) {
                        <div class="text-truncate" [title]="eq.destinoFinal">{{ eq.destinoFinal }}</div>
                        @if (eq.evidenciaDestino) {
                          <div class="cell-sub text-truncate" [title]="eq.evidenciaDestino">
                            <i class="bi bi-paperclip"></i> {{ eq.evidenciaDestino }}
                          </div>
                        }
                      } @else {
                        <span class="cell-sub">En proceso</span>
                      }
                    </td>

                    <td>
                      <div>{{ eq.fechaIngreso | date: 'dd/MM/yyyy' }}</div>
                      <div class="cell-sub mono">{{ eq.fechaIngreso | date: 'HH:mm' }}</div>
                    </td>

                    <td class="text-end">
                      <div class="actions">
                        <a [routerLink]="['/equipos', eq.id, 'pasaporte']" class="act" title="Pasaporte digital">
                          <i class="bi bi-qr-code"></i>
                        </a>

                        @if (authService.canChangeEstado()) {
                          <button type="button" class="act" (click)="abrirModalEstado(eq)" title="Cambiar estado">
                            <i class="bi bi-arrow-left-right"></i>
                          </button>
                        }

                        @if (authService.canCreateOrEditEquipo()) {
                          <button type="button" class="act" (click)="abrirModalEditar(eq)" title="Editar">
                            <i class="bi bi-pencil"></i>
                          </button>
                        }

                        @if (authService.canDeleteEquipo()) {
                          <button type="button" class="act act-danger" (click)="confirmarBajaLogica(eq)" title="Dar de baja">
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

          <div class="pager">
            <span class="mono">Página {{ paginaActual() }} / {{ totalPaginas() }}</span>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-eco-outline btn-sm" [disabled]="paginaActual() <= 1"
                      (click)="paginaActual.set(paginaActual() - 1)">
                <i class="bi bi-chevron-left"></i> Anterior
              </button>
              <button type="button" class="btn btn-eco-outline btn-sm" [disabled]="paginaActual() >= totalPaginas()"
                      (click)="paginaActual.set(paginaActual() + 1)">
                Siguiente <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    @if (mostrarModalForm()) {
      <app-equipo-form
        [equipoEditar]="equipoSeleccionadoForm()"
        (saved)="onEquipoGuardado($event)"
        (cancelled)="mostrarModalForm.set(false)"
      ></app-equipo-form>
    }

    @if (equipoSeleccionadoEstado(); as eqEstado) {
      <app-cambio-estado-modal
        [equipo]="eqEstado"
        (updated)="onEstadoActualizado($event)"
        (cancelled)="equipoSeleccionadoEstado.set(null)"
      ></app-cambio-estado-modal>
    }
  `,
  styles: [`
    .filters {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .filter-search { position: relative; flex: 1 1 260px; max-width: 360px; }
    .filter-search i {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--rt-faint);
      font-size: 0.8rem;
    }
    .filter-search .form-control { padding-left: 2.1rem; }
    .filter-select { width: 200px; }

    .result-count { margin-left: auto; font-size: 0.7188rem; color: var(--rt-faint); }

    .serial { font-size: 0.8125rem; font-weight: 500; color: var(--rt-text); }
    .row-id { font-size: 0.6875rem; color: var(--rt-faint); }
    .cell-wide { max-width: 260px; }
    .cell-sub { font-size: 0.75rem; color: var(--rt-faint); }

    .actions { display: inline-flex; gap: 4px; }
    .act {
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid var(--rt-border);
      border-radius: 5px;
      color: var(--rt-muted);
      font-size: 0.8rem;
      text-decoration: none;
      transition: color 0.15s, border-color 0.15s, background 0.15s;
    }
    .act:hover { color: var(--rt-text); border-color: var(--rt-border-strong); background: var(--rt-surface-3); }
    .act-danger:hover { color: var(--rt-danger); border-color: color-mix(in srgb, var(--rt-danger) 45%, transparent); }

    .state-box {
      padding: 3rem 1rem;
      text-align: center;
      color: var(--rt-muted);
      font-size: 0.8125rem;
    }
    .state-box > i { font-size: 1.75rem; color: var(--rt-faint); display: block; margin-bottom: 0.5rem; }
    .state-hint { color: var(--rt-faint); font-size: 0.75rem; }

    .pager {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 1rem;
      border-top: 1px solid var(--rt-border);
      background: var(--rt-surface-2);
      font-size: 0.75rem;
      color: var(--rt-muted);
    }
  `]
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
        ? `Equipo ${equipo.serial} actualizado.`
        : `Equipo ${equipo.serial} recepcionado. Pasaporte digital generado.`
    );
    this.cargarEquipos();
  }

  onEstadoActualizado(equipo: EquipoResponseDTO): void {
    this.equipoSeleccionadoEstado.set(null);
    this.successMessage.set(`${equipo.serial} pasó a ${equipo.estadoActual}.`);
    this.cargarEquipos();
  }

  confirmarBajaLogica(equipo: EquipoResponseDTO): void {
    const confirmar = window.confirm(
      `¿Dar de baja "${equipo.serial}" (${equipo.tipo})?\nEl registro y su pasaporte digital se conservan para auditoría (activo = false).`
    );
    if (!confirmar) return;

    this.error.set(null);
    this.equipoService.desactivarEquipo(equipo.id).subscribe({
      next: () => {
        this.successMessage.set(`Baja lógica aplicada a ${equipo.serial}. Su pasaporte permanece íntegro.`);
        this.cargarEquipos();
      },
      error: (err: ApiErrorResponse) => {
        this.error.set(err);
      }
    });
  }
}
