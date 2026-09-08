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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuditorRestrictionTest {

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

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    @DisplayName("Seguridad: Auditor NO puede crear equipos (403 Forbidden)")
    void testAuditorNoPuedeCrearEquipo() throws Exception {
        String tokenAuditor = obtenerToken("auditor", "auditor123");

        EquipoRequestDTO equipoReq = new EquipoRequestDTO("SN-AUDITOR-TEST", "Monitor", "24 pulg IPS", EstadoEquipoEnum.RECEPCIONADO);

        mockMvc.perform(post("/api/equipos")
                        .header("Authorization", "Bearer " + tokenAuditor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(equipoReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Seguridad: Auditor NO puede modificar estado de equipos (403 Forbidden)")
    void testAuditorNoPuedeModificarEstado() throws Exception {
        String tokenAuditor = obtenerToken("auditor", "auditor123");
        String tokenRecepcion = obtenerToken("recepcion", "recepcion123");

        // Recepcion crea equipo
        EquipoRequestDTO equipoReq = new EquipoRequestDTO("SN-AUDITOR-TEST-2", "Impresora", "Laser", EstadoEquipoEnum.RECEPCIONADO);
        MvcResult res = mockMvc.perform(post("/api/equipos")
                        .header("Authorization", "Bearer " + tokenRecepcion)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(equipoReq)))
                .andExpect(status().isCreated())
                .andReturn();

        long id = objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asLong();

        // Auditor intenta modificar estado
        CambioEstadoRequestDTO cambio = new CambioEstadoRequestDTO(EstadoEquipoEnum.EN_DIAGNOSTICO, "Intento no autorizado de cambio");
        mockMvc.perform(patch("/api/equipos/" + id + "/estado")
                        .header("Authorization", "Bearer " + tokenAuditor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cambio)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Seguridad: Auditor SI puede consultar pasaporte digital y reporte de circularidad")
    void testAuditorPuedeConsultarPasaporteYReporte() throws Exception {
        String tokenAuditor = obtenerToken("auditor", "auditor123");

        mockMvc.perform(get("/api/reportes/circularidad")
                        .header("Authorization", "Bearer " + tokenAuditor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tasaExactitudRegistrosPct").value(100.0));
    }
}
