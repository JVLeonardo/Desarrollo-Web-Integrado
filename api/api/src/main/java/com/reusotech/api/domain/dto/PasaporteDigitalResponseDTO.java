package com.reusotech.api.domain.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PasaporteDigitalResponseDTO {

    private EquipoResponseDTO equipo;
    private List<HistorialResponseDTO> historial;
    private int totalTransiciones;
    private String resumenCicloVida;
    private LocalDateTime fechaGeneracion;

    public PasaporteDigitalResponseDTO() {
        this.fechaGeneracion = LocalDateTime.now();
    }

    public PasaporteDigitalResponseDTO(EquipoResponseDTO equipo, List<HistorialResponseDTO> historial) {
        this.equipo = equipo;
        this.historial = historial;
        this.totalTransiciones = historial != null ? historial.size() : 0;
        this.fechaGeneracion = LocalDateTime.now();
        if (equipo != null) {
            this.resumenCicloVida = equipo.isCerrado() 
                ? "Ciclo cerrado con destino: " + (equipo.getDestinoFinal() != null ? equipo.getDestinoFinal() : "N/A") 
                : "En proceso operativo - Estado actual: " + equipo.getEstadoActual();
        }
    }

    public EquipoResponseDTO getEquipo() {
        return equipo;
    }

    public void setEquipo(EquipoResponseDTO equipo) {
        this.equipo = equipo;
    }

    public List<HistorialResponseDTO> getHistorial() {
        return historial;
    }

    public void setHistorial(List<HistorialResponseDTO> historial) {
        this.historial = historial;
        this.totalTransiciones = historial != null ? historial.size() : 0;
    }

    public int getTotalTransiciones() {
        return totalTransiciones;
    }

    public void setTotalTransiciones(int totalTransiciones) {
        this.totalTransiciones = totalTransiciones;
    }

    public String getResumenCicloVida() {
        return resumenCicloVida;
    }

    public void setResumenCicloVida(String resumenCicloVida) {
        this.resumenCicloVida = resumenCicloVida;
    }

    public LocalDateTime getFechaGeneracion() {
        return fechaGeneracion;
    }

    public void setFechaGeneracion(LocalDateTime fechaGeneracion) {
        this.fechaGeneracion = fechaGeneracion;
    }
}
