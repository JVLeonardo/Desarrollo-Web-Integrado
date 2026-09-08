package com.reusotech.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reusotech.api.domain.dto.CambioEstadoRequestDTO;
import com.reusotech.api.domain.dto.EquipoRequestDTO;
import com.reusotech.api.domain.dto.LoginRequestDTO;
import com.reusotech.api.persistence.entity.EstadoEquipoEnum;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EquipoIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String obtenerToken(String username, String password) throws Exception {
        LoginRequestDTO login = new LoginRequestDTO(username, password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        return objectMapper.readTree(responseBody).get("token").asText();
    }

    @Test
    @DisplayName("Integración: Flujo completo de recepción, actualización con evidencia, pasaporte y reporte")
    void testFlujoCompletoCicloDeVidaEquipo() throws Exception {
        // 1. Obtener tokens para diferentes roles
        String tokenRecepcion = obtenerToken("recepcion", "recepcion123");
        String tokenTecnico = obtenerToken("tecnico", "tecnico123");
        String tokenSupervisor = obtenerToken("supervisor", "supervisor123");
        String tokenAuditor = obtenerToken("auditor", "auditor123");

        // 2. Recepción registra nuevo equipo
        EquipoRequestDTO equipoReq = new EquipoRequestDTO("SN-PC-INTEGRATION-001", "Desktop Workstation", "Intel i7 32GB SSD 1TB", EstadoEquipoEnum.RECEPCIONADO);
        MvcResult postResult = mockMvc.perform(post("/api/equipos")
                        .header("Authorization", "Bearer " + tokenRecepcion)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(equipoReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.serial").value("SN-PC-INTEGRATION-001"))
                .andExpect(jsonPath("$.estadoActual").value("RECEPCIONADO"))
                .andReturn();

        long equipoId = objectMapper.readTree(postResult.getResponse().getContentAsString()).get("id").asLong();

        // 3. Validar regla: No permitir registrar el mismo serial de nuevo (Duplicado -> 409 Conflict)
        mockMvc.perform(post("/api/equipos")
                        .header("Authorization", "Bearer " + tokenRecepcion)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(equipoReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("SERIAL_DUPLICADO"));

        // 4. Técnico actualiza estado a EN_DIAGNOSTICO
        CambioEstadoRequestDTO cambio1 = new CambioEstadoRequestDTO(EstadoEquipoEnum.EN_DIAGNOSTICO, "Iniciando pruebas de hardware y componentes");
        mockMvc.perform(patch("/api/equipos/" + equipoId + "/estado")
                        .header("Authorization", "Bearer " + tokenTecnico)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cambio1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoActual").value("EN_DIAGNOSTICO"));

        // 5. Técnico intenta cerrar equipo sin destino ni evidencia (Falla -> 422 Unprocessable Entity)
        CambioEstadoRequestDTO cierreIncompleto = new CambioEstadoRequestDTO(EstadoEquipoEnum.REUTILIZADO, "Pase final sin evidencia");
        mockMvc.perform(patch("/api/equipos/" + equipoId + "/estado")
                        .header("Authorization", "Bearer " + tokenTecnico)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cierreIncompleto)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("EVIDENCIA_DESTINO_INCOMPLETA"));

        // 6. Técnico cierra equipo CON destino y evidencia documental completa
        CambioEstadoRequestDTO cierreExitoso = new CambioEstadoRequestDTO(
                EstadoEquipoEnum.REUTILIZADO,
                "Equipo reacondicionado y donado a biblioteca pública",
                "Biblioteca Municipal Central",
                "https://storage.reusotech.com/actas/acta-entrega-donacion-001.pdf"
        );
        mockMvc.perform(patch("/api/equipos/" + equipoId + "/estado")
                        .header("Authorization", "Bearer " + tokenTecnico)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cierreExitoso)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoActual").value("REUTILIZADO"))
                .andExpect(jsonPath("$.destinoFinal").value("Biblioteca Municipal Central"))
                .andExpect(jsonPath("$.cerrado").value(true));

        // 7. Consultar Pasaporte Digital del equipo (Cualquier usuario autenticado)
        mockMvc.perform(get("/api/equipos/" + equipoId + "/pasaporte")
                        .header("Authorization", "Bearer " + tokenAuditor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.equipo.serial").value("SN-PC-INTEGRATION-001"))
                .andExpect(jsonPath("$.totalTransiciones").value(3)) // Recepcion inicial + Diagnostico + Reutilizado
                .andExpect(jsonPath("$.historial", hasSize(3)))
                .andExpect(jsonPath("$.historial[0].estadoNuevo").value("RECEPCIONADO"))
                .andExpect(jsonPath("$.historial[1].estadoNuevo").value("EN_DIAGNOSTICO"))
                .andExpect(jsonPath("$.historial[2].estadoNuevo").value("REUTILIZADO"));

        // 8. Supervisor o Auditor consulta el Reporte de Circularidad
        mockMvc.perform(get("/api/reportes/circularidad")
                        .header("Authorization", "Bearer " + tokenSupervisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEquiposRecibidos", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.indiceCircularidadPct", greaterThan(0.0)))
                .andExpect(jsonPath("$.completitudTrazabilidadPct", is(100.0)));
    }
}
