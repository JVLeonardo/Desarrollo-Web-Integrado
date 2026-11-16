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
      <span class="pill" [ngClass]="meta.colorClase" [title]="meta.descripcion">
        <span class="dot"></span>{{ meta.etiqueta }}
      </span>
    }
  `,
  styles: [`
    .pill {
      --c: var(--rt-muted);
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.15rem 0.55rem 0.15rem 0.45rem;
      border-radius: 4px;
      font-size: 0.7188rem;
      font-weight: 500;
      white-space: nowrap;
      color: var(--c);
      background: color-mix(in srgb, var(--c) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--c) 28%, transparent);
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--c);
    }

    .estado-recepcionado { --c: #7d93ad; }
    .estado-diagnostico  { --c: #8a8fc7; }
    .estado-reparacion   { --c: #d2a24a; }
    .estado-reparado     { --c: #4aa3a0; }
    .estado-reutilizado  { --c: #3aa57c; }
    .estado-reciclado    { --c: #6fb26a; }
    .estado-desmantelado { --c: #8793a3; }
    .estado-disposicion  { --c: #d9645a; }
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
