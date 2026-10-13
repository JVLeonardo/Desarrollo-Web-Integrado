package com.reusotech.api.web.controller;

import com.reusotech.api.domain.dto.CambioEstadoRequestDTO;
import com.reusotech.api.domain.dto.EquipoRequestDTO;
import com.reusotech.api.domain.dto.EquipoResponseDTO;
import com.reusotech.api.domain.dto.PasaporteDigitalResponseDTO;
import com.reusotech.api.domain.service.EquipoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    private final EquipoService equipoService;

    public EquipoController(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPCION', 'SUPERVISOR')")
    public ResponseEntity<EquipoResponseDTO> registrarEquipo(
            @Valid @RequestBody EquipoRequestDTO requestDTO,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "SISTEMA";
        EquipoResponseDTO response = equipoService.registrarEquipo(requestDTO, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPCION', 'SUPERVISOR')")
    public ResponseEntity<EquipoResponseDTO> actualizarEquipo(
            @PathVariable Long id,
            @Valid @RequestBody EquipoRequestDTO requestDTO,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "SISTEMA";
        return ResponseEntity.ok(equipoService.actualizarEquipo(id, requestDTO, username));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<Void> desactivarEquipo(@PathVariable Long id, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SISTEMA";
        equipoService.desactivarEquipo(id, username);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('TECNICO', 'SUPERVISOR')")
    public ResponseEntity<EquipoResponseDTO> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambioEstadoRequestDTO requestDTO,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "SISTEMA";
        EquipoResponseDTO response = equipoService.cambiarEstado(id, requestDTO, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/pasaporte")
    public ResponseEntity<PasaporteDigitalResponseDTO> obtenerPasaporteDigital(@PathVariable Long id) {
        PasaporteDigitalResponseDTO pasaporte = equipoService.obtenerPasaporteDigital(id);
        return ResponseEntity.ok(pasaporte);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipoResponseDTO> obtenerPorId(@PathVariable Long id) {
        EquipoResponseDTO equipo = equipoService.obtenerPorId(id);
        return ResponseEntity.ok(equipo);
    }

    @GetMapping
    public ResponseEntity<List<EquipoResponseDTO>> listarTodos() {
        List<EquipoResponseDTO> lista = equipoService.listarTodos();
        return ResponseEntity.ok(lista);
    }
}
