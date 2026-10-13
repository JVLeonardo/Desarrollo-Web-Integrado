package com.reusotech.api.domain.service;

import com.reusotech.api.domain.dto.CambioEstadoRequestDTO;
import com.reusotech.api.domain.dto.EquipoRequestDTO;
import com.reusotech.api.domain.dto.EquipoResponseDTO;
import com.reusotech.api.domain.dto.PasaporteDigitalResponseDTO;

import java.util.List;

public interface EquipoService {
    EquipoResponseDTO registrarEquipo(EquipoRequestDTO requestDTO, String usernameResponsable);
    EquipoResponseDTO cambiarEstado(Long id, CambioEstadoRequestDTO requestDTO, String usernameResponsable);
    PasaporteDigitalResponseDTO obtenerPasaporteDigital(Long id);
    EquipoResponseDTO obtenerPorId(Long id);
    EquipoResponseDTO obtenerPorSerial(String serial);
    List<EquipoResponseDTO> listarTodos();
    EquipoResponseDTO actualizarEquipo(Long id, EquipoRequestDTO requestDTO, String usernameResponsable);
    void desactivarEquipo(Long id, String usernameResponsable);
}
