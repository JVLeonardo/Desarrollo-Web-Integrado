package com.reusotech.api.config;

import com.reusotech.api.domain.repository.UsuarioRepository;
import com.reusotech.api.persistence.entity.RolEnum;
import com.reusotech.api.persistence.entity.Usuario;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsuario("recepcion", "recepcion123", "Operador Recepción", "recepcion@reusotech.com", RolEnum.RECEPCION);
        seedUsuario("tecnico", "tecnico123", "Técnico Especialista", "tecnico@reusotech.com", RolEnum.TECNICO);
        seedUsuario("supervisor", "supervisor123", "Supervisor Operativo", "supervisor@reusotech.com", RolEnum.SUPERVISOR);
        seedUsuario("auditor", "auditor123", "Auditor de Calidad", "auditor@reusotech.com", RolEnum.AUDITOR);
        seedUsuario("aportante", "aportante123", "Entidad Donante / Aportante", "aportante@reusotech.com", RolEnum.ENTIDAD_APORTANTE);
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
}
