package com.reusotech.api.persistence.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipos")
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String serial;

    @Column(nullable = false, length = 80)
    private String tipo;

    @Column(columnDefinition = "TEXT")
    private String caracteristicas;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_actual", nullable = false, length = 40)
    private EstadoEquipoEnum estadoActual = EstadoEquipoEnum.RECEPCIONADO;

    @Column(name = "destino_final", length = 200)
    private String destinoFinal;

    @Column(name = "evidencia_destino", columnDefinition = "TEXT")
    private String evidenciaDestino;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDateTime fechaIngreso;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(nullable = false)
    private Boolean activo = true;

    public Equipo() {
    }

    public Equipo(Long id, String serial, String tipo, String caracteristicas, EstadoEquipoEnum estadoActual) {
        this.id = id;
        this.serial = serial;
        this.tipo = tipo;
        this.caracteristicas = caracteristicas;
        this.estadoActual = estadoActual != null ? estadoActual : EstadoEquipoEnum.RECEPCIONADO;
    }

    @PrePersist
    public void prePersist() {
        if (this.fechaIngreso == null) {
            this.fechaIngreso = LocalDateTime.now();
        }
        if (this.fechaActualizacion == null) {
            this.fechaActualizacion = LocalDateTime.now();
        }
        if (this.estadoActual == null) {
            this.estadoActual = EstadoEquipoEnum.RECEPCIONADO;
        }
        if (this.activo == null) {
            this.activo = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
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
}
