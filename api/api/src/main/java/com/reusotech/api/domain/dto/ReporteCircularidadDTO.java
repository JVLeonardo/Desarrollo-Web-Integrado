package com.reusotech.api.domain.dto;

import java.util.Map;

public class ReporteCircularidadDTO {

    private long totalEquiposRecibidos;
    private long totalEquiposReutilizados;
    private long totalEquiposReparados;
    private long totalEquiposReciclados;
    private long totalEquiposDesmantelados;
    private long totalEquiposDisposicionFinal;
    private long totalEquiposEnProceso;
    private long totalEquiposCerrados;
    private long totalCerradosConEvidencia;

    // Indicadores clave del Capítulo 1
    private double indiceCircularidadPct;
    private double tasaExactitudRegistrosPct;
    private double tasaDuplicidadDetectadaPct;
    private double completitudTrazabilidadPct;

    private Map<String, Long> distribucionPorEstado;

    public ReporteCircularidadDTO() {
    }

    public long getTotalEquiposRecibidos() {
        return totalEquiposRecibidos;
    }

    public void setTotalEquiposRecibidos(long totalEquiposRecibidos) {
        this.totalEquiposRecibidos = totalEquiposRecibidos;
    }

    public long getTotalEquiposReutilizados() {
        return totalEquiposReutilizados;
    }

    public void setTotalEquiposReutilizados(long totalEquiposReutilizados) {
        this.totalEquiposReutilizados = totalEquiposReutilizados;
    }

    public long getTotalEquiposReparados() {
        return totalEquiposReparados;
    }

    public void setTotalEquiposReparados(long totalEquiposReparados) {
        this.totalEquiposReparados = totalEquiposReparados;
    }

    public long getTotalEquiposReciclados() {
        return totalEquiposReciclados;
    }

    public void setTotalEquiposReciclados(long totalEquiposReciclados) {
        this.totalEquiposReciclados = totalEquiposReciclados;
    }

    public long getTotalEquiposDesmantelados() {
        return totalEquiposDesmantelados;
    }

    public void setTotalEquiposDesmantelados(long totalEquiposDesmantelados) {
        this.totalEquiposDesmantelados = totalEquiposDesmantelados;
    }

    public long getTotalEquiposDisposicionFinal() {
        return totalEquiposDisposicionFinal;
    }

    public void setTotalEquiposDisposicionFinal(long totalEquiposDisposicionFinal) {
        this.totalEquiposDisposicionFinal = totalEquiposDisposicionFinal;
    }

    public long getTotalEquiposEnProceso() {
        return totalEquiposEnProceso;
    }

    public void setTotalEquiposEnProceso(long totalEquiposEnProceso) {
        this.totalEquiposEnProceso = totalEquiposEnProceso;
    }

    public long getTotalEquiposCerrados() {
        return totalEquiposCerrados;
    }

    public void setTotalEquiposCerrados(long totalEquiposCerrados) {
        this.totalEquiposCerrados = totalEquiposCerrados;
    }

    public long getTotalCerradosConEvidencia() {
        return totalCerradosConEvidencia;
    }

    public void setTotalCerradosConEvidencia(long totalCerradosConEvidencia) {
        this.totalCerradosConEvidencia = totalCerradosConEvidencia;
    }

    public double getIndiceCircularidadPct() {
        return indiceCircularidadPct;
    }

    public void setIndiceCircularidadPct(double indiceCircularidadPct) {
        this.indiceCircularidadPct = indiceCircularidadPct;
    }

    public double getTasaExactitudRegistrosPct() {
        return tasaExactitudRegistrosPct;
    }

    public void setTasaExactitudRegistrosPct(double tasaExactitudRegistrosPct) {
        this.tasaExactitudRegistrosPct = tasaExactitudRegistrosPct;
    }

    public double getTasaDuplicidadDetectadaPct() {
        return tasaDuplicidadDetectadaPct;
    }

    public void setTasaDuplicidadDetectadaPct(double tasaDuplicidadDetectadaPct) {
        this.tasaDuplicidadDetectadaPct = tasaDuplicidadDetectadaPct;
    }

    public double getCompletitudTrazabilidadPct() {
        return completitudTrazabilidadPct;
    }

    public void setCompletitudTrazabilidadPct(double completitudTrazabilidadPct) {
        this.completitudTrazabilidadPct = completitudTrazabilidadPct;
    }

    public Map<String, Long> getDistribucionPorEstado() {
        return distribucionPorEstado;
    }

    public void setDistribucionPorEstado(Map<String, Long> distribucionPorEstado) {
        this.distribucionPorEstado = distribucionPorEstado;
    }
}
