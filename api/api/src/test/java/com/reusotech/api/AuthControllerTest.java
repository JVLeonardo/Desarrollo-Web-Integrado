package com.reusotech.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reusotech.api.domain.dto.LoginRequestDTO;
import com.reusotech.api.domain.dto.RegisterRequestDTO;
import com.reusotech.api.persistence.entity.RolEnum;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Auth: Registro y Login de nuevo usuario")
    void testRegistroYLoginUsuario() throws Exception {
        RegisterRequestDTO register = new RegisterRequestDTO(
                "tecnico_junior",
                "claveSegura123",
                "Tecnico Junior Uno",
                "tec_jr@reusotech.com",
                RolEnum.TECNICO
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("tecnico_junior"))
                .andExpect(jsonPath("$.rol").value("TECNICO"));

        LoginRequestDTO login = new LoginRequestDTO("tecnico_junior", "claveSegura123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.username").value("tecnico_junior"))
                .andExpect(jsonPath("$.rol").value("TECNICO"));
    }

    @Test
    @DisplayName("Auth: Login con credenciales incorrectas debe retornar 401")
    void testLoginInvalido() throws Exception {
        LoginRequestDTO login = new LoginRequestDTO("recepcion", "clave_erronea");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("CREDENCIALES_INVALIDAS"));
    }
}
