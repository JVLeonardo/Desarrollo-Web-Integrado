package com.reusotech.api;

import com.fasterxml.jackson.databind.ObjectMapper;
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
class EquipoUpdateDeleteIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String token(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequestDTO(username, password))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    private long crearEquipo(String tokenRecepcion, String serial) throws Exception {
        EquipoRequestDTO req = new EquipoRequestDTO(serial, "Laptop", "i5 8GB", EstadoEquipoEnum.RECEPCIONADO);
        MvcResult res = mockMvc.perform(post("/api/equipos")
                        .header("Authorization", "Bearer " + tokenRecepcion)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asLong();
    }

    @Test
    @DisplayName("Integración: PUT actualiza datos y deja el evento en el Pasaporte Digital")
    void putActualizaEquipo() throws Exception {
        String recepcion = token("recepcion", "recepcion123");
        long id = crearEquipo(recepcion, "SN-PUT-001");

        EquipoRequestDTO cambio = new EquipoRequestDTO("SN-PUT-001-B", "Laptop reacondicionada", "i7 16GB", null);
        mockMvc.perform(put("/api/equipos/" + id)
                        .header("Authorization", "Bearer " + recepcion)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cambio)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serial").value("SN-PUT-001-B"))
                .andExpect(jsonPath("$.tipo").value("Laptop reacondicionada"))
                .andExpect(jsonPath("$.estadoActual").value("RECEPCIONADO"));

        mockMvc.perform(get("/api/equipos/" + id + "/pasaporte")
                        .header("Authorization", "Bearer " + recepcion))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.historial", hasSize(2)));
    }

    @Test
    @DisplayName("Integración: PUT con serial de otro equipo responde 409")
    void putSerialDuplicadoDevuelve409() throws Exception {
        String recepcion = token("recepcion", "recepcion123");
        crearEquipo(recepcion, "SN-PUT-DUP-A");
        long idB = crearEquipo(recepcion, "SN-PUT-DUP-B");

        EquipoRequestDTO cambio = new EquipoRequestDTO("SN-PUT-DUP-A", "Laptop", "i5", null);
        mockMvc.perform(put("/api/equipos/" + idB)
                        .header("Authorization", "Bearer " + recepcion)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cambio)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("SERIAL_DUPLICADO"));
    }

    @Test
    @DisplayName("Integración: PUT sobre equipo inexistente responde 404")
    void putInexistenteDevuelve404() throws Exception {
        String recepcion = token("recepcion", "recepcion123");
        EquipoRequestDTO cambio = new EquipoRequestDTO("SN-NO-EXISTE", "Laptop", "i5", null);
        mockMvc.perform(put("/api/equipos/999999")
                        .header("Authorization", "Bearer " + recepcion)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cambio)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Seguridad: AUDITOR y TECNICO no pueden hacer PUT (403)")
    void putProhibidoParaAuditorYTecnico() throws Exception {
        String recepcion = token("recepcion", "recepcion123");
        long id = crearEquipo(recepcion, "SN-PUT-SEC-001");
        EquipoRequestDTO cambio = new EquipoRequestDTO("SN-PUT-SEC-002", "Laptop", "i5", null);

        for (String[] cred : new String[][]{{"auditor", "auditor123"}, {"tecnico", "tecnico123"}}) {
            mockMvc.perform(put("/api/equipos/" + id)
                            .header("Authorization", "Bearer " + token(cred[0], cred[1]))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(cambio)))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    @DisplayName("Integración: DELETE (SUPERVISOR) da de baja lógica y el equipo sale del listado")
    void deleteBajaLogica() throws Exception {
        String recepcion = token("recepcion", "recepcion123");
        String supervisor = token("supervisor", "supervisor123");
        long id = crearEquipo(recepcion, "SN-DEL-001");

        mockMvc.perform(delete("/api/equipos/" + id)
                        .header("Authorization", "Bearer " + supervisor))
                .andExpect(status().isNoContent());

        // El registro se conserva (trazabilidad) pero marcado como inactivo
        mockMvc.perform(get("/api/equipos/" + id)
                        .header("Authorization", "Bearer " + supervisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value(false));

        // Ya no aparece en el listado
        mockMvc.perform(get("/api/equipos")
                        .header("Authorization", "Bearer " + supervisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.serial == 'SN-DEL-001')]", hasSize(0)));
    }

    @Test
    @DisplayName("Seguridad: solo SUPERVISOR puede hacer DELETE (RECEPCION, TECNICO y AUDITOR reciben 403)")
    void deleteSoloSupervisor() throws Exception {
        String recepcion = token("recepcion", "recepcion123");
        long id = crearEquipo(recepcion, "SN-DEL-SEC-001");

        for (String[] cred : new String[][]{{"recepcion", "recepcion123"}, {"tecnico", "tecnico123"}, {"auditor", "auditor123"}}) {
            mockMvc.perform(delete("/api/equipos/" + id)
                            .header("Authorization", "Bearer " + token(cred[0], cred[1])))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    @DisplayName("Seguridad: PUT y DELETE sin token no están autorizados")
    void sinTokenNoAutorizado() throws Exception {
        mockMvc.perform(delete("/api/equipos/1")).andExpect(status().is4xxClientError());
        mockMvc.perform(put("/api/equipos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"serial\":\"X\",\"tipo\":\"Y\"}"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("Seguridad: ENTIDAD_APORTANTE consulta pasaporte y trazabilidad, pero no modifica ni ve reportes")
    void aportanteSoloConsulta() throws Exception {
        String recepcion = token("recepcion", "recepcion123");
        String aportante = token("aportante", "aportante123");
        long id = crearEquipo(recepcion, "SN-APORTANTE-001");

        mockMvc.perform(get("/api/equipos/" + id + "/pasaporte")
                        .header("Authorization", "Bearer " + aportante))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/equipos")
                        .header("Authorization", "Bearer " + aportante))
                .andExpect(status().isOk());

        EquipoRequestDTO req = new EquipoRequestDTO("SN-APORTANTE-002", "Laptop", "i5", null);
        mockMvc.perform(post("/api/equipos")
                        .header("Authorization", "Bearer " + aportante)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/equipos/" + id)
                        .header("Authorization", "Bearer " + aportante))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/reportes/circularidad")
                        .header("Authorization", "Bearer " + aportante))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Datos demo: el reporte refleja los equipos sembrados por DataInitializer")
    void reporteConDatosDemo() throws Exception {
        String supervisor = token("supervisor", "supervisor123");
        mockMvc.perform(get("/api/reportes/circularidad")
                        .header("Authorization", "Bearer " + supervisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEquiposRecibidos", greaterThanOrEqualTo(8)))
                .andExpect(jsonPath("$.totalEquiposReutilizados", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.tasaDuplicidadDetectadaPct", is(0.0)))
                .andExpect(jsonPath("$.tasaExactitudRegistrosPct", is(100.0)));
    }
}
