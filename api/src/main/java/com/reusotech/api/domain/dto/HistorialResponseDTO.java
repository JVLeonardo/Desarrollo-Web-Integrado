package com.reusotech.api.domain.dto;

import com.reusotech.api.persistence.entity.EstadoEquipoEnum;
import com.reusotech.api.persistence.entity.Historial;
import com.reusotech.api.persistence.entity.RolEnum;
import java.time.LocalDateTime;

public class HistorialResponseDTO {

    private Long id;
    private Long equipoId;
    private String equipoSerial;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioUsername;
    private RolEnum usuarioRol;
    private EstadoEquipoEnum estadoAnterior;
    private EstadoEquipoEnum estadoNuevo;
    private String motivo;
    private LocalDateTime fecha;

    public HistorialResponseDTO() {
    }

    public static HistorialResponseDTO fromEntity(Historial historial) {
        if (historial == null) return null;
        HistorialResponseDTO dto = new HistorialResponseDTO();
        dto.setId(historial.getId());
        if (historial.getEquipo() != null) {
            dto.setEquipoId(historial.getEquipo().getId());
            dto.setEquipoSerial(historial.getEquipo().getSerial());
        }
        if (historial.getUsuario() != null) {
            dto.setUsuarioId(historial.getUsuario().getId());
            dto.setUsuarioNombre(historial.getUsuario().getNombreCompleto());
            dto.setUsuarioUsername(historial.getUsuario().getUsername());
            dto.setUsuarioRol(historial.getUsuario().getRol());
        }
        dto.setEstadoAnterior(historial.getEstadoAnterior());
        dto.setEstadoNuevo(historial.getEstadoNuevo());
        dto.setMotivo(historial.getMotivo());
        dto.setFecha(historial.getFecha());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public void setEquipoId(Long equipoId) {
        this.equipoId = equipoId;
    }

    public String getEquipoSerial() {
        return equipoSerial;
    }

    public void setEquipoSerial(String equipoSerial) {
        this.equipoSerial = equipoSerial;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public String getUsuarioUsername() {
        return usuarioUsername;
    }

    public void setUsuarioUsername(String usuarioUsername) {
        this.usuarioUsername = usuarioUsername;
    }

    public RolEnum getUsuarioRol() {
        return usuarioRol;
    }

    public void setUsuarioRol(RolEnum usuarioRol) {
        this.usuarioRol = usuarioRol;
    }

    public EstadoEquipoEnum getEstadoAnterior() {
        return estadoAnterior;
    }

    public void setEstadoAnterior(EstadoEquipoEnum estadoAnterior) {
        this.estadoAnterior = estadoAnterior;
    }

    public EstadoEquipoEnum getEstadoNuevo() {
        return estadoNuevo;
    }

    public void setEstadoNuevo(EstadoEquipoEnum estadoNuevo) {
        this.estadoNuevo = estadoNuevo;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
