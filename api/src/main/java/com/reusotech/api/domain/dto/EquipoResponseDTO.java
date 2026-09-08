package com.reusotech.api.domain.dto;

import com.reusotech.api.persistence.entity.Equipo;
import com.reusotech.api.persistence.entity.EstadoEquipoEnum;
import java.time.LocalDateTime;

public class EquipoResponseDTO {

    private Long id;
    private String serial;
    private String tipo;
    private String caracteristicas;
    private EstadoEquipoEnum estadoActual;
    private String destinoFinal;
    private String evidenciaDestino;
    private LocalDateTime fechaIngreso;
    private LocalDateTime fechaCierre;
    private LocalDateTime fechaActualizacion;
    private Boolean activo;
    private boolean cerrado;

    public EquipoResponseDTO() {
    }

    public static EquipoResponseDTO fromEntity(Equipo equipo) {
        if (equipo == null) return null;
        EquipoResponseDTO dto = new EquipoResponseDTO();
        dto.setId(equipo.getId());
        dto.setSerial(equipo.getSerial());
        dto.setTipo(equipo.getTipo());
        dto.setCaracteristicas(equipo.getCaracteristicas());
        dto.setEstadoActual(equipo.getEstadoActual());
        dto.setDestinoFinal(equipo.getDestinoFinal());
        dto.setEvidenciaDestino(equipo.getEvidenciaDestino());
        dto.setFechaIngreso(equipo.getFechaIngreso());
        dto.setFechaCierre(equipo.getFechaCierre());
        dto.setFechaActualizacion(equipo.getFechaActualizacion());
        dto.setActivo(equipo.getActivo());
        dto.setCerrado(equipo.getEstadoActual() != null && equipo.getEstadoActual().isEstadoFinal());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSerial() {
        return serial;
    }

    public void setSerial(String serial) {
        this.serial = serial;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getCaracteristicas() {
        return caracteristicas;
    }

    public void setCaracteristicas(String caracteristicas) {
        this.caracteristicas = caracteristicas;
    }

    public EstadoEquipoEnum getEstadoActual() {
        return estadoActual;
    }

    public void setEstadoActual(EstadoEquipoEnum estadoActual) {
        this.estadoActual = estadoActual;
    }

    public String getDestinoFinal() {
        return destinoFinal;
    }

    public void setDestinoFinal(String destinoFinal) {
        this.destinoFinal = destinoFinal;
    }

    public String getEvidenciaDestino() {
        return evidenciaDestino;
    }

    public void setEvidenciaDestino(String evidenciaDestino) {
        this.evidenciaDestino = evidenciaDestino;
    }

    public LocalDateTime getFechaIngreso() {
        return fechaIngreso;
    }

    public void setFechaIngreso(LocalDateTime fechaIngreso) {
        this.fechaIngreso = fechaIngreso;
    }

    public LocalDateTime getFechaCierre() {
        return fechaCierre;
    }

    public void setFechaCierre(LocalDateTime fechaCierre) {
        this.fechaCierre = fechaCierre;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public boolean isCerrado() {
        return cerrado;
    }

    public void setCerrado(boolean cerrado) {
        this.cerrado = cerrado;
    }
}
