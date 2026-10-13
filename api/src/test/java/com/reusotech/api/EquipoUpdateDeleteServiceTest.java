package com.reusotech.api;

import com.reusotech.api.domain.dto.EquipoRequestDTO;
import com.reusotech.api.domain.dto.EquipoResponseDTO;
import com.reusotech.api.domain.exception.AuditorReadOnlyException;
import com.reusotech.api.domain.exception.DuplicateSerialException;
import com.reusotech.api.domain.exception.ResourceNotFoundException;
import com.reusotech.api.domain.repository.EquipoRepository;
import com.reusotech.api.domain.repository.HistorialRepository;
import com.reusotech.api.domain.repository.UsuarioRepository;
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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EquipoUpdateDeleteServiceTest {

    @Mock
    private EquipoRepository equipoRepository;
    @Mock
    private HistorialRepository historialRepository;
    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private EquipoServiceImpl equipoService;

    private Usuario recepcion;
    private Usuario supervisor;
    private Usuario auditor;
    private Equipo equipo;

    @BeforeEach
    void setUp() {
        recepcion = new Usuario(1L, "recepcion", "pass", "Operador", "rec@reuso.com", RolEnum.RECEPCION, true);
        supervisor = new Usuario(2L, "supervisor", "pass", "Supervisor", "sup@reuso.com", RolEnum.SUPERVISOR, true);
        auditor = new Usuario(3L, "auditor", "pass", "Auditor", "aud@reuso.com", RolEnum.AUDITOR, true);
        equipo = new Equipo(10L, "SN-ORIGINAL", "Laptop", "i5 8GB", EstadoEquipoEnum.EN_DIAGNOSTICO);
    }

    @Test
    @DisplayName("Actualizar: cambia datos, conserva el estado y registra el evento en el historial")
    void actualizarEquipoExitoso() {
        EquipoRequestDTO req = new EquipoRequestDTO("SN-NUEVO", "Laptop gamer", "i7 16GB", null);
        when(usuarioRepository.findByUsername("recepcion")).thenReturn(Optional.of(recepcion));
        when(equipoRepository.findById(10L)).thenReturn(Optional.of(equipo));
        when(equipoRepository.existsBySerialIgnoreCase("SN-NUEVO")).thenReturn(false);
        when(equipoRepository.save(any(Equipo.class))).thenAnswer(i -> i.getArgument(0));

        EquipoResponseDTO res = equipoService.actualizarEquipo(10L, req, "recepcion");

        assertEquals("SN-NUEVO", res.getSerial());
        assertEquals("Laptop gamer", res.getTipo());
        assertEquals("i7 16GB", res.getCaracteristicas());
        assertEquals(EstadoEquipoEnum.EN_DIAGNOSTICO, res.getEstadoActual());

        ArgumentCaptor<Historial> captor = ArgumentCaptor.forClass(Historial.class);
        verify(historialRepository).save(captor.capture());
        assertEquals(EstadoEquipoEnum.EN_DIAGNOSTICO, captor.getValue().getEstadoAnterior());
        assertEquals(EstadoEquipoEnum.EN_DIAGNOSTICO, captor.getValue().getEstadoNuevo());
    }

    @Test
    @DisplayName("Actualizar: mantener el mismo serial no dispara validación de duplicado")
    void actualizarConMismoSerialPermitido() {
        EquipoRequestDTO req = new EquipoRequestDTO("sn-original", "Laptop", "i5 16GB", null);
        when(usuarioRepository.findByUsername("recepcion")).thenReturn(Optional.of(recepcion));
        when(equipoRepository.findById(10L)).thenReturn(Optional.of(equipo));
        when(equipoRepository.save(any(Equipo.class))).thenAnswer(i -> i.getArgument(0));

        assertDoesNotThrow(() -> equipoService.actualizarEquipo(10L, req, "recepcion"));
        verify(equipoRepository, never()).existsBySerialIgnoreCase(anyString());
    }

    @Test
    @DisplayName("Actualizar: serial que ya pertenece a otro equipo lanza DuplicateSerialException")
    void actualizarConSerialDeOtroEquipoFalla() {
        EquipoRequestDTO req = new EquipoRequestDTO("SN-OTRO", "Laptop", "i5", null);
        when(usuarioRepository.findByUsername("recepcion")).thenReturn(Optional.of(recepcion));
        when(equipoRepository.findById(10L)).thenReturn(Optional.of(equipo));
        when(equipoRepository.existsBySerialIgnoreCase("SN-OTRO")).thenReturn(true);

        assertThrows(DuplicateSerialException.class, () -> equipoService.actualizarEquipo(10L, req, "recepcion"));
        verify(equipoRepository, never()).save(any(Equipo.class));
        verify(historialRepository, never()).save(any(Historial.class));
    }

    @Test
    @DisplayName("Actualizar: equipo inexistente lanza ResourceNotFoundException")
    void actualizarEquipoInexistenteFalla() {
        EquipoRequestDTO req = new EquipoRequestDTO("SN-X", "Laptop", "i5", null);
        when(usuarioRepository.findByUsername("recepcion")).thenReturn(Optional.of(recepcion));
        when(equipoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> equipoService.actualizarEquipo(99L, req, "recepcion"));
    }

    @Test
    @DisplayName("Actualizar: el AUDITOR no puede modificar equipos")
    void actualizarComoAuditorFalla() {
        EquipoRequestDTO req = new EquipoRequestDTO("SN-X", "Laptop", "i5", null);
        when(usuarioRepository.findByUsername("auditor")).thenReturn(Optional.of(auditor));

        assertThrows(AuditorReadOnlyException.class, () -> equipoService.actualizarEquipo(10L, req, "auditor"));
        verify(equipoRepository, never()).save(any(Equipo.class));
    }

    @Test
    @DisplayName("Desactivar: baja lógica pone activo=false y registra el evento (no borra)")
    void desactivarEquipoExitoso() {
        when(usuarioRepository.findByUsername("supervisor")).thenReturn(Optional.of(supervisor));
        when(equipoRepository.findById(10L)).thenReturn(Optional.of(equipo));
        when(equipoRepository.save(any(Equipo.class))).thenAnswer(i -> i.getArgument(0));

        equipoService.desactivarEquipo(10L, "supervisor");

        assertFalse(equipo.getActivo());
        verify(equipoRepository, never()).delete(any(Equipo.class));
        verify(equipoRepository, never()).deleteById(anyLong());
        verify(historialRepository, times(1)).save(any(Historial.class));
    }

    @Test
    @DisplayName("Desactivar: equipo inexistente lanza ResourceNotFoundException")
    void desactivarEquipoInexistenteFalla() {
        when(usuarioRepository.findByUsername("supervisor")).thenReturn(Optional.of(supervisor));
        when(equipoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> equipoService.desactivarEquipo(99L, "supervisor"));
    }

    @Test
    @DisplayName("Desactivar: el AUDITOR no puede dar de baja equipos")
    void desactivarComoAuditorFalla() {
        when(usuarioRepository.findByUsername("auditor")).thenReturn(Optional.of(auditor));

        assertThrows(AuditorReadOnlyException.class, () -> equipoService.desactivarEquipo(10L, "auditor"));
        verify(equipoRepository, never()).save(any(Equipo.class));
    }

    @Test
    @DisplayName("Listar: los equipos dados de baja no aparecen en el listado")
    void listarExcluyeInactivos() {
        Equipo inactivo = new Equipo(11L, "SN-BAJA", "Monitor", "24in", EstadoEquipoEnum.RECEPCIONADO);
        inactivo.setActivo(false);
        when(equipoRepository.findAll()).thenReturn(List.of(equipo, inactivo));

        List<EquipoResponseDTO> lista = equipoService.listarTodos();

        assertEquals(1, lista.size());
        assertEquals("SN-ORIGINAL", lista.get(0).getSerial());
    }
}
