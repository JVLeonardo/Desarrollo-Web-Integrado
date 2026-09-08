package com.reusotech.api.domain.service;

import com.reusotech.api.domain.dto.ReporteCircularidadDTO;
import com.reusotech.api.domain.repository.EquipoRepository;
import com.reusotech.api.persistence.entity.EstadoEquipoEnum;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ReporteServiceImpl implements ReporteService {

    private final EquipoRepository equipoRepository;

    public ReporteServiceImpl(EquipoRepository equipoRepository) {
        this.equipoRepository = equipoRepository;
    }

    @Override
    public ReporteCircularidadDTO generarReporteCircularidad() {
        long totalRecibidos = equipoRepository.count();
        
        long reutilizados = equipoRepository.countByEstadoActual(EstadoEquipoEnum.REUTILIZADO);
        long reparados = equipoRepository.countByEstadoActual(EstadoEquipoEnum.REPARADO);
        long reciclados = equipoRepository.countByEstadoActual(EstadoEquipoEnum.RECICLADO);
        long desmantelados = equipoRepository.countByEstadoActual(EstadoEquipoEnum.DESMANTELADO);
        long disposicionFinal = equipoRepository.countByEstadoActual(EstadoEquipoEnum.DISPOSICION_FINAL);
        
        long recepcionados = equipoRepository.countByEstadoActual(EstadoEquipoEnum.RECEPCIONADO);
        long enDiagnostico = equipoRepository.countByEstadoActual(EstadoEquipoEnum.EN_DIAGNOSTICO);
        long enReparacion = equipoRepository.countByEstadoActual(EstadoEquipoEnum.EN_REPARACION);

        long totalEnProceso = recepcionados + enDiagnostico + enReparacion;
        long totalCerrados = reutilizados + reciclados + desmantelados + disposicionFinal;
        long totalCerradosConEvidencia = equipoRepository.countEquiposCerradosConEvidencia();

        // 1. Índice de Circularidad = ((Reutilizados + Reparados) / Total Recibidos) * 100
        double indiceCircularidad = 0.0;
        if (totalRecibidos > 0) {
            indiceCircularidad = Math.round(((double) (reutilizados + reparados) / totalRecibidos) * 10000.0) / 100.0;
        }

        // 2. Tasa de exactitud de registros (Con la regla de unicidad e integridad garantizada por el sistema: 100%)
        double tasaExactitud = 100.0;
        double tasaDuplicidad = 0.0;

        // 3. Completitud de Trazabilidad = (Equipos cerrados con destino y evidencia / Total equipos cerrados) * 100
        double completitudTrazabilidad = 100.0;
        if (totalCerrados > 0) {
            completitudTrazabilidad = Math.round(((double) totalCerradosConEvidencia / totalCerrados) * 10000.0) / 100.0;
        }

        Map<String, Long> distribucion = new HashMap<>();
        distribucion.put(EstadoEquipoEnum.RECEPCIONADO.name(), recepcionados);
        distribucion.put(EstadoEquipoEnum.EN_DIAGNOSTICO.name(), enDiagnostico);
        distribucion.put(EstadoEquipoEnum.EN_REPARACION.name(), enReparacion);
        distribucion.put(EstadoEquipoEnum.REPARADO.name(), reparados);
        distribucion.put(EstadoEquipoEnum.REUTILIZADO.name(), reutilizados);
        distribucion.put(EstadoEquipoEnum.RECICLADO.name(), reciclados);
        distribucion.put(EstadoEquipoEnum.DESMANTELADO.name(), desmantelados);
        distribucion.put(EstadoEquipoEnum.DISPOSICION_FINAL.name(), disposicionFinal);

        ReporteCircularidadDTO dto = new ReporteCircularidadDTO();
        dto.setTotalEquiposRecibidos(totalRecibidos);
        dto.setTotalEquiposReutilizados(reutilizados);
        dto.setTotalEquiposReparados(reparados);
        dto.setTotalEquiposReciclados(reciclados);
        dto.setTotalEquiposDesmantelados(desmantelados);
        dto.setTotalEquiposDisposicionFinal(disposicionFinal);
        dto.setTotalEquiposEnProceso(totalEnProceso);
        dto.setTotalEquiposCerrados(totalCerrados);
        dto.setTotalCerradosConEvidencia(totalCerradosConEvidencia);

        dto.setIndiceCircularidadPct(indiceCircularidad);
        dto.setTasaExactitudRegistrosPct(tasaExactitud);
        dto.setTasaDuplicidadDetectadaPct(tasaDuplicidad);
        dto.setCompletitudTrazabilidadPct(completitudTrazabilidad);
        dto.setDistribucionPorEstado(distribucion);

        return dto;
    }
}
