package com.reusotech.api;

import com.reusotech.api.domain.dto.CambioEstadoRequestDTO;
import com.reusotech.api.domain.dto.EquipoRequestDTO;
import com.reusotech.api.domain.dto.EquipoResponseDTO;
import com.reusotech.api.domain.dto.PasaporteDigitalResponseDTO;
import com.reusotech.api.domain.exception.AuditorReadOnlyException;
import com.reusotech.api.domain.exception.DuplicateSerialException;
import com.reusotech.api.domain.exception.IncompleteEvidenceException;
import com.reusotech.api.domain.repository.EquipoRepository;
import com.reusotech.api.domain.repository.HistorialRepository;
import com.reusotech.api.domain.repository.UsuarioRepository;
import com.reusotech.api.domain.service.EquipoService;
import com.reusotech.api.domain.service.EquipoServiceImpl;
import com.reusotech.api.persistence.entity.Equipo;
import com.reusotech.api.persistence.entity.EstadoEquipoEnum;
import com.reusotech.api.persistence.entity.Historial;
import com.reusotech.api.persistence.entity.RolEnum;
import com.reusotech.api.persistence.entity.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EquipoServiceTest {

    @Mock
    private EquipoRepository equipoRepository;

    @Mock
    private HistorialRepository historialRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private EquipoServiceImpl equipoService;

    private Usuario usuarioRecepcion;
    private Usuario usuarioTecnico;
    private Usuario usuarioAuditor;
    private Equipo equipoLaptop;

    @BeforeEach
    void setUp() {
        usuarioRecepcion = new Usuario(1L, "recepcion", "pass", "Operador Recepcion", "rec@reuso.com",
                RolEnum.RECEPCION, true);
        usuarioTecnico = new Usuario(2L, "tecnico", "pass", "Tecnico Experto", "tec@reuso.com", RolEnum.TECNICO, true);
        usuarioAuditor = new Usuario(3L, "auditor", "pass", "Auditor Calidad", "aud@reuso.com", RolEnum.AUDITOR, true);

        equipoLaptop = new Equipo(10L, "SN-LAPTOP-2026", "Laptop", "Core i5 16GB RAM", EstadoEquipoEnum.RECEPCIONADO);
        equipoLaptop.setFechaIngreso(LocalDateTime.now());
    }

    @Test
    @DisplayName("TDD Regla 1: Registrar equipo con serial nuevo debe ser exitoso y crear historial inicial")
    void testRegistrarEquipoExitoso() {
        // Arrange
        EquipoRequestDTO request = new EquipoRequestDTO("SN-LAPTOP-2026", "Laptop", "Core i5 16GB RAM",
                EstadoEquipoEnum.RECEPCIONADO);
        when(equipoRepository.existsBySerialIgnoreCase("SN-LAPTOP-2026")).thenReturn(false);
        when(usuarioRepository.findByUsername("recepcion")).thenReturn(Optional.of(usuarioRecepcion));
        when(equipoRepository.save(any(Equipo.class))).thenAnswer(invocation -> {
            Equipo e = invocation.getArgument(0);
            e.setId(10L);
            return e;
        });

        // Act
        EquipoResponseDTO response = equipoService.registrarEquipo(request, "recepcion");

        // Assert
        assertNotNull(response);
        assertEquals("SN-LAPTOP-2026", response.getSerial());
        assertEquals(EstadoEquipoEnum.RECEPCIONADO, response.getEstadoActual());
        verify(historialRepository, times(1)).save(any(Historial.class));
    }

    @Test
    @DisplayName("TDD Regla 2: Intentar registrar serial duplicado debe lanzar DuplicateSerialException")
    void testRegistrarEquipoSerialDuplicadoFalla() {
        // Arrange
        EquipoRequestDTO request = new EquipoRequestDTO("SN-LAPTOP-2026", "Laptop", "Core i5",
                EstadoEquipoEnum.RECEPCIONADO);
        when(equipoRepository.existsBySerialIgnoreCase("SN-LAPTOP-2026")).thenReturn(true);

        // Act & Assert
        DuplicateSerialException exception = assertThrows(DuplicateSerialException.class, () -> {
            equipoService.registrarEquipo(request, "recepcion");
        });

        assertTrue(exception.getMessage().contains("SN-LAPTOP-2026"));
        verify(equipoRepository, never()).save(any(Equipo.class));
        verify(historialRepository, never()).save(any(Historial.class));
    }

    @Test
    @DisplayName("TDD Regla 3: Cerrar equipo a estado final sin destino ni evidencia debe lanzar IncompleteEvidenceException")
    void testCerrarEquipoSinEvidenciaFalla() {
        // Arrange
        CambioEstadoRequestDTO request = new CambioEstadoRequestDTO(EstadoEquipoEnum.REUTILIZADO, "Pase a donación");
        when(usuarioRepository.findByUsername("tecnico")).thenReturn(Optional.of(usuarioTecnico));
        when(equipoRepository.findById(10L)).thenReturn(Optional.of(equipoLaptop));

        // Act & Assert
        IncompleteEvidenceException exception = assertThrows(IncompleteEvidenceException.class, () -> {
            equipoService.cambiarEstado(10L, request, "tecnico");
        });

        assertTrue(exception.getMessage().contains("sin registrar un destino final y una evidencia documental"));
        verify(historialRepository, never()).save(any(Historial.class));
    }

    @Test
    @DisplayName("TDD Regla 4: Cerrar equipo a estado final con destino y evidencia debe ser exitoso")
    void testCerrarEquipoConEvidenciaExitoso() {
        // Arrange
        CambioEstadoRequestDTO request = new CambioEstadoRequestDTO(
                EstadoEquipoEnum.REUTILIZADO,
                "Donación a escuela técnica comunitaria",
                "I.E. República de Perú",
                "https://storage.reusotech.com/actas/acta-2026-001.pdf");
        when(usuarioRepository.findByUsername("tecnico")).thenReturn(Optional.of(usuarioTecnico));
        when(equipoRepository.findById(10L)).thenReturn(Optional.of(equipoLaptop));
        when(equipoRepository.save(any(Equipo.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        EquipoResponseDTO response = equipoService.cambiarEstado(10L, request, "tecnico");

        // Assert
        assertNotNull(response);
        assertEquals(EstadoEquipoEnum.REUTILIZADO, response.getEstadoActual());
        assertEquals("I.E. República de Perú", response.getDestinoFinal());
        assertEquals("https://storage.reusotech.com/actas/acta-2026-001.pdf", response.getEvidenciaDestino());
        assertTrue(response.isCerrado());
        assertNotNull(response.getFechaCierre());
        verify(historialRepository, times(1)).save(any(Historial.class));
    }

    @Test
    @DisplayName("TDD Regla 5: Rol Auditor no puede modificar ciclo del equipo (solo lectura)")
    void testRolAuditorNoPuedeModificarCiclo() {
        // Arrange
        CambioEstadoRequestDTO request = new CambioEstadoRequestDTO(EstadoEquipoEnum.EN_DIAGNOSTICO, "Revision visual");
        when(usuarioRepository.findByUsername("auditor")).thenReturn(Optional.of(usuarioAuditor));

        // Act & Assert
        AuditorReadOnlyException exception = assertThrows(AuditorReadOnlyException.class, () -> {
            equipoService.cambiarEstado(10L, request, "auditor");
        });

        assertTrue(exception.getMessage().contains("AUDITOR tiene permisos exclusivamente de solo lectura"));
        verify(equipoRepository, never()).save(any(Equipo.class));
    }

    @Test
    @DisplayName("TDD Regla 6: Obtener Pasaporte Digital debe retornar equipo con todo su historial cronológico")
    void testObtenerPasaporteDigital() {
        // Arrange
        Historial h1 = new Historial(equipoLaptop, usuarioRecepcion, null, EstadoEquipoEnum.RECEPCIONADO,
                "Recepción inicial");
        h1.setId(1L);
        when(equipoRepository.findById(10L)).thenReturn(Optional.of(equipoLaptop));
        when(historialRepository.findByEquipoIdWithUsuarioOrdered(10L)).thenReturn(List.of(h1));

        // Act
        PasaporteDigitalResponseDTO pasaporte = equipoService.obtenerPasaporteDigital(10L);

        // Assert
        assertNotNull(pasaporte);
        assertEquals("SN-LAPTOP-2026", pasaporte.getEquipo().getSerial());
        assertEquals(1, pasaporte.getTotalTransiciones());
        assertEquals(1, pasaporte.getHistorial().size());
        assertEquals("Operador Recepcion", pasaporte.getHistorial().get(0).getUsuarioNombre());
    }
}
