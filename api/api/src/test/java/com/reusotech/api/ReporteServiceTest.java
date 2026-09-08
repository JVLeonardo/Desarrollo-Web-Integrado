package com.reusotech.api;

import com.reusotech.api.domain.dto.ReporteCircularidadDTO;
import com.reusotech.api.domain.repository.EquipoRepository;
import com.reusotech.api.domain.service.ReporteServiceImpl;
import com.reusotech.api.persistence.entity.EstadoEquipoEnum;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReporteServiceTest {

    @Mock
    private EquipoRepository equipoRepository;

    @InjectMocks
    private ReporteServiceImpl reporteService;

    @Test
    @DisplayName("TDD Matriz: Calcular Índice de Circularidad y Trazabilidad correctamente")
    void testGenerarReporteCircularidad() {
        // Arrange
        // Total recibidos: 10 equipos
        // 4 Reutilizados, 2 Reparados, 1 Reciclado, 1 Disposicion Final, 2 En Proceso
        when(equipoRepository.count()).thenReturn(10L);
        when(equipoRepository.countByEstadoActual(EstadoEquipoEnum.REUTILIZADO)).thenReturn(4L);
        when(equipoRepository.countByEstadoActual(EstadoEquipoEnum.REPARADO)).thenReturn(2L);
        when(equipoRepository.countByEstadoActual(EstadoEquipoEnum.RECICLADO)).thenReturn(1L);
        when(equipoRepository.countByEstadoActual(EstadoEquipoEnum.DESMANTELADO)).thenReturn(0L);
        when(equipoRepository.countByEstadoActual(EstadoEquipoEnum.DISPOSICION_FINAL)).thenReturn(1L);
        when(equipoRepository.countByEstadoActual(EstadoEquipoEnum.RECEPCIONADO)).thenReturn(1L);
        when(equipoRepository.countByEstadoActual(EstadoEquipoEnum.EN_DIAGNOSTICO)).thenReturn(1L);
        when(equipoRepository.countByEstadoActual(EstadoEquipoEnum.EN_REPARACION)).thenReturn(0L);

        // Equipos cerrados = 4 + 1 + 0 + 1 = 6
        // Supongamos que los 6 cerrados tienen evidencia completa
        when(equipoRepository.countEquiposCerradosConEvidencia()).thenReturn(6L);

        // Act
        ReporteCircularidadDTO reporte = reporteService.generarReporteCircularidad();

        // Assert
        assertNotNull(reporte);
        assertEquals(10L, reporte.getTotalEquiposRecibidos());
        assertEquals(4L, reporte.getTotalEquiposReutilizados());
        assertEquals(2L, reporte.getTotalEquiposReparados());
        assertEquals(6L, reporte.getTotalEquiposCerrados());
        assertEquals(6L, reporte.getTotalCerradosConEvidencia());

        // Indice de circularidad = ((4 + 2) / 10) * 100 = 60.0%
        assertEquals(60.0, reporte.getIndiceCircularidadPct());

        // Completitud de trazabilidad = (6 / 6) * 100 = 100.0%
        assertEquals(100.0, reporte.getCompletitudTrazabilidadPct());

        // Exactitud de registros = 100.0%
        assertEquals(100.0, reporte.getTasaExactitudRegistrosPct());
    }
}
