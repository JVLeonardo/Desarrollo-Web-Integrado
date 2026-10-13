package com.reusotech.api.domain.service;

import com.reusotech.api.domain.dto.CambioEstadoRequestDTO;
import com.reusotech.api.domain.dto.EquipoRequestDTO;
import com.reusotech.api.domain.dto.EquipoResponseDTO;
import com.reusotech.api.domain.dto.HistorialResponseDTO;
import com.reusotech.api.domain.dto.PasaporteDigitalResponseDTO;
import com.reusotech.api.domain.exception.AuditorReadOnlyException;
import com.reusotech.api.domain.exception.DuplicateSerialException;
import com.reusotech.api.domain.exception.IncompleteEvidenceException;
import com.reusotech.api.domain.exception.ResourceNotFoundException;
import com.reusotech.api.domain.repository.EquipoRepository;
import com.reusotech.api.domain.repository.HistorialRepository;
import com.reusotech.api.domain.repository.UsuarioRepository;
import com.reusotech.api.persistence.entity.Equipo;
import com.reusotech.api.persistence.entity.EstadoEquipoEnum;
import com.reusotech.api.persistence.entity.Historial;
import com.reusotech.api.persistence.entity.RolEnum;
import com.reusotech.api.persistence.entity.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EquipoServiceImpl implements EquipoService {

    private final EquipoRepository equipoRepository;
    private final HistorialRepository historialRepository;
    private final UsuarioRepository usuarioRepository;

    public EquipoServiceImpl(EquipoRepository equipoRepository,
                             HistorialRepository historialRepository,
                             UsuarioRepository usuarioRepository) {
        this.equipoRepository = equipoRepository;
        this.historialRepository = historialRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public EquipoResponseDTO registrarEquipo(EquipoRequestDTO requestDTO, String usernameResponsable) {
        // 1. Validar regla de serial único
        String serialLimpio = requestDTO.getSerial().trim();
        if (equipoRepository.existsBySerialIgnoreCase(serialLimpio)) {
            throw new DuplicateSerialException("Ya existe un equipo registrado con el serial: " + serialLimpio);
        }

        // 2. Obtener usuario responsable
        Usuario usuario = obtenerUsuarioPorUsername(usernameResponsable);
        validarNoAuditor(usuario);

        // 3. Crear equipo
        EstadoEquipoEnum estadoInicial = requestDTO.getEstadoInicial() != null 
                ? requestDTO.getEstadoInicial() 
                : EstadoEquipoEnum.RECEPCIONADO;

        Equipo equipo = new Equipo();
        equipo.setSerial(serialLimpio);
        equipo.setTipo(requestDTO.getTipo().trim());
        equipo.setCaracteristicas(requestDTO.getCaracteristicas());
        equipo.setEstadoActual(estadoInicial);
        equipo.setFechaIngreso(LocalDateTime.now());
        equipo.setActivo(true);

        Equipo equipoGuardado = equipoRepository.save(equipo);

        // 4. Registrar evento inicial en Pasaporte Digital (Historial)
        Historial historialInicial = new Historial(
                equipoGuardado,
                usuario,
                null,
                estadoInicial,
                "Recepción inicial y registro del equipo en el sistema"
        );
        historialRepository.save(historialInicial);

        return EquipoResponseDTO.fromEntity(equipoGuardado);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public EquipoResponseDTO cambiarEstado(Long id, CambioEstadoRequestDTO requestDTO, String usernameResponsable) {
        Usuario usuario = obtenerUsuarioPorUsername(usernameResponsable);
        
        // Regla: Auditor es de solo lectura
        validarNoAuditor(usuario);

        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con ID: " + id));

        EstadoEquipoEnum estadoAnterior = equipo.getEstadoActual();
        EstadoEquipoEnum estadoNuevo = requestDTO.getNuevoEstado();

        // Regla: Si el estado es final, validar obligatoriamente destino y evidencia
        if (estadoNuevo.isEstadoFinal()) {
            boolean sinDestino = (requestDTO.getDestinoFinal() == null || requestDTO.getDestinoFinal().trim().isEmpty())
                    && (equipo.getDestinoFinal() == null || equipo.getDestinoFinal().trim().isEmpty());
            boolean sinEvidencia = (requestDTO.getEvidenciaDestino() == null || requestDTO.getEvidenciaDestino().trim().isEmpty())
                    && (equipo.getEvidenciaDestino() == null || equipo.getEvidenciaDestino().trim().isEmpty());

            if (sinDestino || sinEvidencia) {
                throw new IncompleteEvidenceException(
                        "Un equipo no puede cerrarse (estado: " + estadoNuevo + ") sin registrar un destino final y una evidencia documental"
                );
            }

            if (requestDTO.getDestinoFinal() != null && !requestDTO.getDestinoFinal().trim().isEmpty()) {
                equipo.setDestinoFinal(requestDTO.getDestinoFinal().trim());
            }
            if (requestDTO.getEvidenciaDestino() != null && !requestDTO.getEvidenciaDestino().trim().isEmpty()) {
                equipo.setEvidenciaDestino(requestDTO.getEvidenciaDestino().trim());
            }
            equipo.setFechaCierre(LocalDateTime.now());
        } else {
            // Si no es estado final pero enviaron datos de destino/evidencia opcionales
            if (requestDTO.getDestinoFinal() != null) {
                equipo.setDestinoFinal(requestDTO.getDestinoFinal().trim());
            }
            if (requestDTO.getEvidenciaDestino() != null) {
                equipo.setEvidenciaDestino(requestDTO.getEvidenciaDestino().trim());
            }
        }

        // Actualizar estado actual
        equipo.setEstadoActual(estadoNuevo);
        Equipo equipoActualizado = equipoRepository.save(equipo);

        // Registrar en Historial (Pasaporte Digital)
        Historial historial = new Historial(
                equipoActualizado,
                usuario,
                estadoAnterior,
                estadoNuevo,
                requestDTO.getMotivo().trim()
        );
        historialRepository.save(historial);

        return EquipoResponseDTO.fromEntity(equipoActualizado);
    }

    @Override
    @Transactional(readOnly = true)
    public PasaporteDigitalResponseDTO obtenerPasaporteDigital(Long id) {
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con ID: " + id));

        List<Historial> historialList = historialRepository.findByEquipoIdWithUsuarioOrdered(id);
        List<HistorialResponseDTO> historialDTOs = historialList.stream()
                .map(HistorialResponseDTO::fromEntity)
                .collect(Collectors.toList());

        EquipoResponseDTO equipoDTO = EquipoResponseDTO.fromEntity(equipo);
        return new PasaporteDigitalResponseDTO(equipoDTO, historialDTOs);
    }

    @Override
    @Transactional(readOnly = true)
    public EquipoResponseDTO obtenerPorId(Long id) {
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con ID: " + id));
        return EquipoResponseDTO.fromEntity(equipo);
    }

    @Override
    @Transactional(readOnly = true)
    public EquipoResponseDTO obtenerPorSerial(String serial) {
        Equipo equipo = equipoRepository.findBySerialIgnoreCase(serial.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con serial: " + serial));
        return EquipoResponseDTO.fromEntity(equipo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipoResponseDTO> listarTodos() {
        return equipoRepository.findAll().stream()
                .filter(e -> !Boolean.FALSE.equals(e.getActivo()))
                .map(EquipoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public EquipoResponseDTO actualizarEquipo(Long id, EquipoRequestDTO requestDTO, String usernameResponsable) {
        Usuario usuario = obtenerUsuarioPorUsername(usernameResponsable);
        validarNoAuditor(usuario);

        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con ID: " + id));

        String serialLimpio = requestDTO.getSerial().trim();
        if (!equipo.getSerial().equalsIgnoreCase(serialLimpio)
                && equipoRepository.existsBySerialIgnoreCase(serialLimpio)) {
            throw new DuplicateSerialException("Ya existe un equipo registrado con el serial: " + serialLimpio);
        }

        equipo.setSerial(serialLimpio);
        equipo.setTipo(requestDTO.getTipo().trim());
        equipo.setCaracteristicas(requestDTO.getCaracteristicas());
        Equipo guardado = equipoRepository.save(equipo);

        historialRepository.save(new Historial(guardado, usuario, guardado.getEstadoActual(),
                guardado.getEstadoActual(), "Actualización de datos del equipo (serial, tipo o características)"));

        return EquipoResponseDTO.fromEntity(guardado);
    }

    @Override
    public void desactivarEquipo(Long id, String usernameResponsable) {
        Usuario usuario = obtenerUsuarioPorUsername(usernameResponsable);
        validarNoAuditor(usuario);

        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con ID: " + id));

        // Baja lógica: el equipo y su Pasaporte Digital se conservan por trazabilidad
        equipo.setActivo(false);
        Equipo guardado = equipoRepository.save(equipo);

        historialRepository.save(new Historial(guardado, usuario, guardado.getEstadoActual(),
                guardado.getEstadoActual(), "Baja lógica del equipo (activo = false)"));
    }

    private Usuario obtenerUsuarioPorUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new ResourceNotFoundException("No se especificó un usuario responsable");
        }
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));
    }

    private void validarNoAuditor(Usuario usuario) {
        if (usuario.getRol() == RolEnum.AUDITOR) {
            throw new AuditorReadOnlyException(
                    "El rol AUDITOR tiene permisos exclusivamente de solo lectura y no puede modificar el ciclo de vida de los equipos."
            );
        }
    }
}
