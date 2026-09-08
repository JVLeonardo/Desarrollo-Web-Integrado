package com.reusotech.api.domain.dto;

import com.reusotech.api.persistence.entity.RolEnum;

public class AuthResponseDTO {

    private String token;
    private String tipo = "Bearer";
    private Long id;
    private String username;
    private String nombreCompleto;
    private String email;
    private RolEnum rol;

    public AuthResponseDTO() {
    }

    public AuthResponseDTO(String token, Long id, String username, String nombreCompleto, String email, RolEnum rol) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.nombreCompleto = nombreCompleto;
        this.email = email;
        this.rol = rol;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public RolEnum getRol() {
        return rol;
    }

    public void setRol(RolEnum rol) {
        this.rol = rol;
    }
}
