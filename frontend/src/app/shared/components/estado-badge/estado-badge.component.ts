import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ESTADOS_EQUIPO_META,
  EstadoEquipoEnum,
  EstadoEquipoMetadata
} from '../../../core/models';

@Component({
  selector: 'app-estado-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (meta) {
      <span class="estado-pill" [ngClass]="meta.colorClase" [title]="meta.descripcion">
        <i class="bi" [ngClass]="meta.icono"></i>
        <span>{{ meta.etiqueta }}</span>
        @if (meta.esEstadoFinal && showFinalTag) {
          <span class="final-dot" title="Estado de cierre circular"></span>
        }
      </span>
    }
  `,
  styles: [`
    .estado-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.32rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
      border: 1px solid transparent;
    }

    .final-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: currentColor;
      opacity: 0.75;
    }

    .estado-recepcionado {
      background-color: rgba(14, 165, 233, 0.12);
      color: #0369a1;
      border-color: rgba(14, 165, 233, 0.25);
    }

    .estado-diagnostico {
      background-color: rgba(99, 102, 241, 0.12);
      color: #4338ca;
      border-color: rgba(99, 102, 241, 0.25);
    }

    .estado-reparacion {
      background-color: rgba(245, 158, 11, 0.14);
      color: #b45309;
      border-color: rgba(245, 158, 11, 0.3);
    }

    .estado-reparado {
      background-color: rgba(13, 148, 136, 0.12);
      color: #0f766e;
      border-color: rgba(13, 148, 136, 0.28);
    }

    .estado-reutilizado {
      background-color: rgba(16, 185, 129, 0.14);
      color: #047857;
      border-color: rgba(16, 185, 129, 0.32);
    }

    .estado-reciclado {
      background-color: rgba(34, 197, 94, 0.12);
      color: #15803d;
      border-color: rgba(34, 197, 94, 0.28);
    }

    .estado-desmantelado {
      background-color: rgba(100, 116, 139, 0.14);
      color: #334155;
      border-color: rgba(100, 116, 139, 0.28);
    }

    .estado-disposicion {
      background-color: rgba(239, 68, 68, 0.12);
      color: #b91c1c;
      border-color: rgba(239, 68, 68, 0.26);
    }
  `]
})
export class EstadoBadgeComponent {
  @Input({ required: true }) estado!: EstadoEquipoEnum | null | undefined;
  @Input() showFinalTag = true;

  get meta(): EstadoEquipoMetadata | null {
    if (!this.estado) return null;
    return ESTADOS_EQUIPO_META[this.estado] ?? null;
  }
}

