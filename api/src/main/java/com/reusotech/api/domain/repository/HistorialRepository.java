package com.reusotech.api.domain.repository;

import com.reusotech.api.persistence.entity.Historial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialRepository extends JpaRepository<Historial, Long> {

    @Query("SELECT h FROM Historial h JOIN FETCH h.usuario WHERE h.equipo.id = :equipoId ORDER BY h.fecha ASC, h.id ASC")
    List<Historial> findByEquipoIdWithUsuarioOrdered(@Param("equipoId") Long equipoId);

    List<Historial> findByEquipoIdOrderByFechaAsc(Long equipoId);
}
