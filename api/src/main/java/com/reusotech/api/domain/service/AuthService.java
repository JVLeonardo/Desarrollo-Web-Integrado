package com.reusotech.api.domain.service;

import com.reusotech.api.domain.dto.AuthResponseDTO;
import com.reusotech.api.domain.dto.LoginRequestDTO;
import com.reusotech.api.domain.dto.RegisterRequestDTO;
import com.reusotech.api.domain.dto.UsuarioResponseDTO;

public interface AuthService {
    AuthResponseDTO login(LoginRequestDTO request);
    UsuarioResponseDTO register(RegisterRequestDTO request);
}
