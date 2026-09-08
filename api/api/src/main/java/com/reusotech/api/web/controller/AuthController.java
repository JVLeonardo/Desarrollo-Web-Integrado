package com.reusotech.api.web.controller;

import com.reusotech.api.domain.dto.AuthResponseDTO;
import com.reusotech.api.domain.dto.LoginRequestDTO;
import com.reusotech.api.domain.dto.RegisterRequestDTO;
import com.reusotech.api.domain.dto.UsuarioResponseDTO;
import com.reusotech.api.domain.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        AuthResponseDTO authResponse = authService.login(loginRequest);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<UsuarioResponseDTO> register(@Valid @RequestBody RegisterRequestDTO registerRequest) {
        UsuarioResponseDTO usuario = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }
}
