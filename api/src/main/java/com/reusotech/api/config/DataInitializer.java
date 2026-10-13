package com.reusotech.api.config;

import com.reusotech.api.domain.repository.EquipoRepository;
import com.reusotech.api.domain.repository.HistorialRepository;
import com.reusotech.api.domain.repository.UsuarioRepository;
import com.reusotech.api.persistence.entity.Equipo;
import com.reusotech.api.persistence.entity.EstadoEquipoEnum;
import com.reusotech.api.persistence.entity.Historial;
import com.reusotech.api.persistence.entity.RolEnum;
import com.reusotech.api.persistence.entity.Usuario;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final EquipoRepository equipoRepository;
    private final HistorialRepository historialRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           EquipoRepository equipoRepository,
                           HistorialRepository historialRepository,
                           PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.equipoRepository = equipoRepository;
        this.historialRepository = historialRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUsuario("recepcion", "recepcion123", "Operador Recepción", "recepcion@reusotech.com", RolEnum.RECEPCION);
        seedUsuario("tecnico", "tecnico123", "Técnico Especialista", "tecnico@reusotech.com", RolEnum.TECNICO);
        seedUsuario("supervisor", "supervisor123", "Supervisor Operativo", "supervisor@reusotech.com", RolEnum.SUPERVISOR);
        seedUsuario("auditor", "auditor123", "Auditor de Calidad", "auditor@reusotech.com", RolEnum.AUDITOR);
        seedUsuario("aportante", "aportante123", "Entidad Donante / Aportante", "aportante@reusotech.com", RolEnum.ENTIDAD_APORTANTE);

        seedEquipos();
    }

    private void seedUsuario(String username, String password, String nombreCompleto, String email, RolEnum rol) {
        if (!usuarioRepository.existsByUsername(username)) {
            Usuario u = new Usuario();
            u.setUsername(username);
            u.setPassword(passwordEncoder.encode(password));
            u.setNombreCompleto(nombreCompleto);
            u.setEmail(email);
            u.setRol(rol);
            u.setActivo(true);
            usuarioRepository.save(u);
        }
    }

    /** Datos de demostración: equipos en distintos estados con su Pasaporte Digital. Solo si la tabla está vacía. */
    private void seedEquipos() {
        if (equipoRepository.count() > 0) {
            return;
        }
        Usuario recepcion = usuarioRepository.findByUsername("recepcion").orElse(null);
        Usuario tecnico = usuarioRepository.findByUsername("tecnico").orElse(null);
        if (recepcion == null || tecnico == null) {
            return;
        }

        // En proceso
        seedEquipo("DEMO-LAP-0001", "Laptop", "Dell Latitude 5420, i5, 8GB RAM", recepcion, tecnico,
                EstadoEquipoEnum.RECEPCIONADO, null, null);
        seedEquipo("DEMO-PC-0002", "PC de escritorio", "HP ProDesk 400 G6, i3, 4GB RAM", recepcion, tecnico,
                EstadoEquipoEnum.EN_DIAGNOSTICO, null, null);
        seedEquipo("DEMO-MON-0003", "Monitor", "LG 24\" IPS, falla en retroiluminación", recepcion, tecnico,
                EstadoEquipoEnum.EN_REPARACION, null, null);
        seedEquipo("DEMO-LAP-0004", "Laptop", "Lenovo ThinkPad T480, reparada con SSD nuevo", recepcion, tecnico,
                EstadoEquipoEnum.REPARADO, null, null);
        // Cerrados con destino y evidencia
        seedEquipo("DEMO-LAP-0005", "Laptop", "Dell Latitude 7410, reacondicionada", recepcion, tecnico,
                EstadoEquipoEnum.REUTILIZADO, "Donación a I.E. San Martín", "Acta de donación N° 001-2026");
        seedEquipo("DEMO-PC-0006", "PC de escritorio", "Torre ensamblada obsoleta", recepcion, tecnico,
                EstadoEquipoEnum.RECICLADO, "Gestor autorizado EcoRAEE SAC", "Certificado de reciclaje CR-2026-114");
        seedEquipo("DEMO-IMP-0007", "Impresora", "Epson L355, sin reparación viable", recepcion, tecnico,
                EstadoEquipoEnum.DESMANTELADO, "Almacén de repuestos", "Acta de desmantelamiento AD-2026-021");
        seedEquipo("DEMO-TEL-0008", "Teléfono IP", "Cisco 7940, dañado", recepcion, tecnico,
                EstadoEquipoEnum.DISPOSICION_FINAL, "Relleno de seguridad autorizado", "Manifiesto de residuos MR-2026-309");
    }

    private void seedEquipo(String serial, String tipo, String caracteristicas, Usuario recepcion, Usuario tecnico,
                            EstadoEquipoEnum estadoFinal, String destino, String evidencia) {
        LocalDateTime ingreso = LocalDateTime.now().minusDays(20);

        Equipo e = new Equipo();
        e.setSerial(serial);
        e.setTipo(tipo);
        e.setCaracteristicas(caracteristicas);
        e.setEstadoActual(estadoFinal);
        e.setFechaIngreso(ingreso);
        e.setDestinoFinal(destino);
        e.setEvidenciaDestino(evidencia);
        if (estadoFinal.isEstadoFinal()) {
            e.setFechaCierre(ingreso.plusDays(15));
        }
        e = equipoRepository.save(e);

        // Historial: recepción inicial + (si aplica) transiciones hasta el estado actual
        guardarHistorial(e, recepcion, null, EstadoEquipoEnum.RECEPCIONADO,
                "Recepción inicial y registro del equipo en el sistema", ingreso);
        EstadoEquipoEnum previo = EstadoEquipoEnum.RECEPCIONADO;
        int dia = 1;
        for (EstadoEquipoEnum paso : ruta(estadoFinal)) {
            guardarHistorial(e, tecnico, previo, paso, "Cambio de estado a " + paso, ingreso.plusDays(dia++));
            previo = paso;
        }
    }

    private EstadoEquipoEnum[] ruta(EstadoEquipoEnum destino) {
        return switch (destino) {
            case RECEPCIONADO -> new EstadoEquipoEnum[]{};
            case EN_DIAGNOSTICO -> new EstadoEquipoEnum[]{EstadoEquipoEnum.EN_DIAGNOSTICO};
            case EN_REPARACION -> new EstadoEquipoEnum[]{EstadoEquipoEnum.EN_DIAGNOSTICO, EstadoEquipoEnum.EN_REPARACION};
            case REPARADO -> new EstadoEquipoEnum[]{EstadoEquipoEnum.EN_DIAGNOSTICO, EstadoEquipoEnum.EN_REPARACION, EstadoEquipoEnum.REPARADO};
            case REUTILIZADO -> new EstadoEquipoEnum[]{EstadoEquipoEnum.EN_DIAGNOSTICO, EstadoEquipoEnum.EN_REPARACION, EstadoEquipoEnum.REPARADO, EstadoEquipoEnum.REUTILIZADO};
            default -> new EstadoEquipoEnum[]{EstadoEquipoEnum.EN_DIAGNOSTICO, destino};
        };
    }

    private void guardarHistorial(Equipo e, Usuario u, EstadoEquipoEnum anterior, EstadoEquipoEnum nuevo,
                                  String motivo, LocalDateTime fecha) {
        Historial h = new Historial(e, u, anterior, nuevo, motivo);
        h.setFecha(fecha);
        historialRepository.save(h);
    }
}
