package com.reusotech.api.domain.dto;

import com.reusotech.api.persistence.entity.EstadoEquipoEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CambioEstadoRequestDTO {

    @NotNull(message = "El nuevo estado es obligatorio")
    private EstadoEquipoEnum nuevoEstado;

    @NotBlank(message = "El motivo del cambio de estado es obligatorio")
    @Size(min = 5, max = 500, message = "El motivo debe tener entre 5 y 500 caracteres")
    private String motivo;

    private String destinoFinal;

    private String evidenciaDestino;

    public CambioEstadoRequestDTO() {
    }

    public CambioEstadoRequestDTO(EstadoEquipoEnum nuevoEstado, String motivo) {
        this.nuevoEstado = nuevoEstado;
        this.motivo = motivo;
    }

    public CambioEstadoRequestDTO(EstadoEquipoEnum nuevoEstado, String motivo, String destinoFinal, String evidenciaDestino) {
        this.nuevoEstado = nuevoEstado;
        this.motivo = motivo;
        this.destinoFinal = destinoFinal;
        this.evidenciaDestino = evidenciaDestino;
    }

    public EstadoEquipoEnum getNuevoEstado() {
        return nuevoEstado;
    }

    public void setNuevoEstado(EstadoEquipoEnum nuevoEstado) {
        this.nuevoEstado = nuevoEstado;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
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
}
