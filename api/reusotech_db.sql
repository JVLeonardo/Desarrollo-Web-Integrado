-- =======================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS: REUSOTECH CIRCULAR
-- =======================================================

CREATE DATABASE IF NOT EXISTS reusotech_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE reusotech_db;

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(120) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    rol VARCHAR(30) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: equipos
CREATE TABLE IF NOT EXISTS equipos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    serial VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(80) NOT NULL,
    caracteristicas TEXT,
    estado_actual VARCHAR(40) NOT NULL DEFAULT 'RECEPCIONADO',
    destino_final VARCHAR(200),
    evidencia_destino TEXT,
    fecha_ingreso DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATETIME NULL,
    fecha_actualizacion DATETIME NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: historial_equipos (Pasaporte Digital)
CREATE TABLE IF NOT EXISTS historial_equipos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_equipo BIGINT NOT NULL,
    id_usuario BIGINT NOT NULL,
    estado_anterior VARCHAR(40) NULL,
    estado_nuevo VARCHAR(40) NOT NULL,
    motivo TEXT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_equipo FOREIGN KEY (id_equipo) REFERENCES equipos(id) ON DELETE CASCADE,
    CONSTRAINT fk_historial_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices recomendados para optimización de consultas
CREATE INDEX idx_equipos_estado ON equipos(estado_actual);
CREATE INDEX idx_historial_equipo ON historial_equipos(id_equipo);
