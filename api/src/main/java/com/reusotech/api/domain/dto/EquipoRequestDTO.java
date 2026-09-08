package com.reusotech.api.domain.dto;

import com.reusotech.api.persistence.entity.EstadoEquipoEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EquipoRequestDTO {

    @NotBlank(message = "El serial del equipo es obligatorio")
    @Size(max = 100, message = "El serial no puede exceder 100 caracteres")
    private String serial;

    @NotBlank(message = "El tipo de equipo es obligatorio")
    @Size(max = 80, message = "El tipo no puede exceder 80 caracteres")
    private String tipo;

    private String caracteristicas;

    private EstadoEquipoEnum estadoInicial;

    public EquipoRequestDTO() {
    }

    public EquipoRequestDTO(String serial, String tipo, String caracteristicas, EstadoEquipoEnum estadoInicial) {
        this.serial = serial;
        this.tipo = tipo;
        this.caracteristicas = caracteristicas;
        this.estadoInicial = estadoInicial;
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

    public EstadoEquipoEnum getEstadoInicial() {
        return estadoInicial;
    }

    public void setEstadoInicial(EstadoEquipoEnum estadoInicial) {
        this.estadoInicial = estadoInicial;
    }
}
