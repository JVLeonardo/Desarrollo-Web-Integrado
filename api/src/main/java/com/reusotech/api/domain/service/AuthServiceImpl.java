package com.reusotech.api.domain.service;

import com.reusotech.api.domain.dto.AuthResponseDTO;
import com.reusotech.api.domain.dto.LoginRequestDTO;
import com.reusotech.api.domain.dto.RegisterRequestDTO;
import com.reusotech.api.domain.dto.UsuarioResponseDTO;
import com.reusotech.api.domain.exception.BusinessRuleException;
import com.reusotech.api.domain.repository.UsuarioRepository;
import com.reusotech.api.persistence.entity.Usuario;
import com.reusotech.api.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessRuleException("Credenciales inválidas"));

        String token = jwtService.generateToken(usuario);

        return new AuthResponseDTO(
                token,
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNombreCompleto(),
                usuario.getEmail(),
                usuario.getRol()
        );
    }

    @Override
    public UsuarioResponseDTO register(RegisterRequestDTO request) {
        if (usuarioRepository.existsByUsername(request.getUsername().trim())) {
            throw new BusinessRuleException("El nombre de usuario ya está registrado");
        }
        if (usuarioRepository.existsByEmail(request.getEmail().trim())) {
            throw new BusinessRuleException("El correo electrónico ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername().trim());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setNombreCompleto(request.getNombreCompleto().trim());
        usuario.setEmail(request.getEmail().trim());
        usuario.setRol(request.getRol());
        usuario.setActivo(true);

        Usuario guardado = usuarioRepository.save(usuario);
        return UsuarioResponseDTO.fromEntity(guardado);
    }
}
