package com.reusotech.api.persistence.entity;

public enum EstadoEquipoEnum {
    RECEPCIONADO(false),
    EN_DIAGNOSTICO(false),
    EN_REPARACION(false),
    REPARADO(false),
    REUTILIZADO(true),
    RECICLADO(true),
    DESMANTELADO(true),
    DISPOSICION_FINAL(true);

    private final boolean estadoFinal;

    EstadoEquipoEnum(boolean estadoFinal) {
        this.estadoFinal = estadoFinal;
    }

    public boolean isEstadoFinal() {
        return estadoFinal;
    }
}
