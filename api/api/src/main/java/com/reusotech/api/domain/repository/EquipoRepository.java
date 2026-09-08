package com.reusotech.api.domain.repository;

import com.reusotech.api.persistence.entity.Equipo;
import com.reusotech.api.persistence.entity.EstadoEquipoEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipoRepository extends JpaRepository<Equipo, Long> {

    Optional<Equipo> findBySerialIgnoreCase(String serial);

    boolean existsBySerialIgnoreCase(String serial);

    List<Equipo> findByEstadoActual(EstadoEquipoEnum estadoActual);

    long countByEstadoActual(EstadoEquipoEnum estadoActual);

    @Query("SELECT COUNT(e) FROM Equipo e WHERE e.estadoActual IN ('REUTILIZADO', 'RECICLADO', 'DESMANTELADO', 'DISPOSICION_FINAL')")
    long countEquiposCerrados();

    @Query("SELECT COUNT(e) FROM Equipo e WHERE e.estadoActual IN ('REUTILIZADO', 'RECICLADO', 'DESMANTELADO', 'DISPOSICION_FINAL') AND e.destinoFinal IS NOT NULL AND e.evidenciaDestino IS NOT NULL AND TRIM(e.destinoFinal) <> '' AND TRIM(e.evidenciaDestino) <> ''")
    long countEquiposCerradosConEvidencia();

    @Query("SELECT COUNT(e) FROM Equipo e WHERE e.estadoActual IN ('REUTILIZADO', 'REPARADO')")
    long countEquiposReutilizadosOReparados();
}
