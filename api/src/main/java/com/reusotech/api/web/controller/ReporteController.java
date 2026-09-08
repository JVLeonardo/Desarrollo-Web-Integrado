package com.reusotech.api.web.controller;

import com.reusotech.api.domain.dto.ReporteCircularidadDTO;
import com.reusotech.api.domain.service.ReporteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @GetMapping("/circularidad")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'AUDITOR')")
    public ResponseEntity<ReporteCircularidadDTO> obtenerReporteCircularidad() {
        ReporteCircularidadDTO reporte = reporteService.generarReporteCircularidad();
        return ResponseEntity.ok(reporte);
    }
}
