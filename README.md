# ♻️ REUSOTECH CIRCULAR - Backend API (Desarrollo Web Integrado)

Backend RESTful y Pasaporte Digital para la trazabilidad y gestión del ciclo de vida de recuperación de equipos electrónicos, desarrollado bajo el patrón MVC por capas con Spring Boot 3, Java 17, Spring Data JPA, MySQL y Spring Security con JWT.

---

## 🏛️ 1. Estructura y Arquitectura por Capas

El proyecto sigue estrictamente la arquitectura solicitada en el paquete raíz `com.reusotech.api`:

```text
src/main/java/com/reusotech/api/
 ├── config/
 │    └── DataInitializer.java        # Semilla automática de usuarios y roles
 ├── domain/
 │    ├── dto/                       # DTOs de solicitud y respuesta
 │    │    ├── AuthResponseDTO.java
 │    │    ├── CambioEstadoRequestDTO.java
 │    │    ├── EquipoRequestDTO.java
 │    │    ├── EquipoResponseDTO.java
 │    │    ├── HistorialResponseDTO.java
 │    │    ├── LoginRequestDTO.java
 │    │    ├── PasaporteDigitalResponseDTO.java
 │    │    ├── RegisterRequestDTO.java
 │    │    ├── ReporteCircularidadDTO.java
 │    │    └── UsuarioResponseDTO.java
 │    ├── exception/                 # Excepciones de negocio y reglas del caso
 │    │    ├── AuditorReadOnlyException.java
 │    │    ├── BusinessRuleException.java
 │    │    ├── DuplicateSerialException.java
 │    │    ├── IncompleteEvidenceException.java
 │    │    └── ResourceNotFoundException.java
 │    ├── repository/                # Interfaces JpaRepository
 │    │    ├── EquipoRepository.java
 │    │    ├── HistorialRepository.java
 │    │    └── UsuarioRepository.java
 │    └── service/                   # Lógica de negocio (TDD)
 │         ├── AuthService.java / AuthServiceImpl.java
 │         ├── EquipoService.java / EquipoServiceImpl.java
 │         └── ReporteService.java / ReporteServiceImpl.java
 ├── persistence/
 │    └── entity/                    # Entidades JPA (@Entity, @Table)
 │         ├── Equipo.java
 │         ├── EstadoEquipoEnum.java
 │         ├── Historial.java
 │         ├── RolEnum.java
 │         └── Usuario.java
 ├── security/                       # Seguridad JWT y Roles
 │    ├── JwtAuthenticationFilter.java
 │    ├── JwtService.java
 │    ├── SecurityConfig.java
 │    └── UserDetailsServiceImpl.java
 └── web/
      └── controller/                # Controladores REST y Manejador Global
           ├── AuthController.java
           ├── EquipoController.java
           ├── GlobalExceptionHandler.java
           └── ReporteController.java
```

---

## 📊 2. Matriz de Consistencia y Operacionalización (Capítulo 1)

| Variable / Indicador | Definición / Fórmula | Meta / Regla Implementada |
| :--- | :--- | :--- |
| **Problema General** | Falta de trazabilidad y gestión centralizada en la recuperación de equipos electrónicos. | Resuelto mediante Pasaporte Digital con trazabilidad inmutable. |
| **Índice de Circularidad (%)** | $\frac{\text{Reutilizados} + \text{Reparados}}{\text{Total Recibidos}} \times 100$ | Calculado dinámicamente en `/api/reportes/circularidad`. |
| **Tasa de exactitud de registros (%)** | Validación de unicidad de `serial` con rechazo automático ante duplicados. | Línea base del 18% reducida a **0% de duplicidad** (100% de exactitud). |
| **Completitud de Trazabilidad (%)** | $\frac{\text{Equipos cerrados con destino y evidencia}}{\text{Total equipos cerrados}} \times 100$ | Subida del 72% al **100%** obligatoria por regla de cierre. |

---

## ⚙️ 3. Reglas de Negocio Críticas Implementadas

1. **Unicidad de Serial:** Un equipo no puede registrarse con un `serial` ya existente en el sistema. Lanza error `409 CONFLICT` con código `SERIAL_DUPLICADO`.
2. **Cierre con Evidencia Obligatoria:** Un equipo no puede transicionar a un estado final (`REUTILIZADO`, `RECICLADO`, `DESMANTELADO`, `DISPOSICION_FINAL`) sin registrar `destinoFinal` y `evidenciaDestino`. Lanza error `422 UNPROCESSABLE ENTITY` con código `EVIDENCIA_DESTINO_INCOMPLETA`.
3. **Rol Auditor Solo Lectura:** El usuario con rol `AUDITOR` tiene acceso restringido a endpoints de consulta y reportes. Cualquier intento de modificación es denegado (`403 FORBIDDEN`).
4. **Pasaporte Digital (Historial Inmutable):** Cada creación y transición de estado registra automáticamente el estado anterior, nuevo estado, motivo, timestamp y usuario responsable.

---

## 🚀 4. Endpoints REST

### Autenticación
- `POST /api/auth/login` - Inicia sesión y retorna token JWT con rol.
- `POST /api/auth/register` - Registra nuevo usuario asignando rol.

### Equipos y Pasaporte Digital
- `POST /api/equipos` - Registra nuevo equipo validando serial único. (Roles: `RECEPCION`, `SUPERVISOR`)
- `PATCH /api/equipos/{id}/estado` - Actualiza estado con motivo y valida evidencia si es cierre. (Roles: `TECNICO`, `SUPERVISOR`)
- `GET /api/equipos/{id}/pasaporte` - Obtiene el pasaporte digital con la trazabilidad completa. (Roles: Todos)
- `GET /api/equipos` - Lista todos los equipos. (Roles: Autenticados)
- `GET /api/equipos/{id}` - Obtiene detalle de un equipo. (Roles: Autenticados)

### Reportes
- `GET /api/reportes/circularidad` - Retorna los indicadores de circularidad y trazabilidad. (Roles: `SUPERVISOR`, `AUDITOR`)

---

## 👥 5. Credenciales Semilla (DataInitializer)

| Usuario | Contraseña | Rol | Permisos Principales |
| :--- | :--- | :--- | :--- |
| `recepcion` | `recepcion123` | `RECEPCION` | Registro de nuevos equipos, consulta |
| `tecnico` | `tecnico123` | `TECNICO` | Diagnóstico, reparación, actualización de estados y cierres |
| `supervisor` | `supervisor123` | `SUPERVISOR` | Gestión completa y reportes |
| `auditor` | `auditor123` | `AUDITOR` | Solo lectura, pasaportes y reportes |
| `aportante` | `aportante123` | `ENTIDAD_APORTANTE` | Consulta de pasaporte y trazabilidad |

---

## 🧪 6. Pruebas Unitarias e Integración (TDD)

Para ejecutar la suite completa de 14 pruebas:

```bash
.\mvnw.cmd test
```


---

## Actualización: CRUD completo, datos de demostración e indicadores

- `GET /api/equipos` y `GET /api/equipos/{id}/pasaporte` ahora también están abiertos a ENTIDAD_APORTANTE (consulta de pasaporte y trazabilidad, según la tabla de credenciales).
- `PUT /api/equipos/{id}` (RECEPCION, SUPERVISOR): edita serial, tipo y características; valida serial único y registra el cambio en el Pasaporte Digital.
- `DELETE /api/equipos/{id}` (SUPERVISOR): baja lógica (`activo = false`); el equipo y su historial se conservan por trazabilidad y dejan de aparecer en el listado.
- `DataInitializer` carga, además de los 5 usuarios, 8 equipos demo (`DEMO-*`) en todos los estados del ciclo con su historial, solo si la tabla `equipos` está vacía.
- Reporte de circularidad: `tasaExactitudRegistrosPct` y `tasaDuplicidadDetectadaPct` ahora se calculan con JPQL (`countRegistrosIncompletos`, `countSerialesRepetidos`).
