# ♻️ REUSOTECH CIRCULAR — Plataforma Full-Stack de Economía Circular y Pasaporte Digital RAEE (APF3)

Monorepo integral (**Backend Spring Boot 3 + Frontend Angular Standalone + Neon Cloud PostgreSQL**) para la trazabilidad, gestión del ciclo de vida de recuperación de equipos electrónicos (RAEE) y emisión de **Pasaporte Digital** auditable.

---

## 📁 1. Estructura del Monorepo (`api/` + `frontend/`)

```text
Desarrollo-Web-Integrado/
├── api/                                # Backend RESTful (Spring Boot 3.4.3 + Java 17 + PostgreSQL/H2)
│   ├── src/main/java/com/reusotech/api/
│   │   ├── config/                     # DataInitializer (semilla automática de usuarios y equipos demo)
│   │   ├── domain/
│   │   │   ├── dto/                    # DTOs de entrada/salida (Auth, Equipo, Pasaporte, Reporte)
│   │   │   ├── exception/              # Excepciones de negocio (409, 422, 403, 404)
│   │   │   ├── repository/             # Interfaces Spring Data JPA optimizadas para 20,000+ registros
│   │   │   └── service/                # Lógica de negocio transaccional
│   │   ├── persistence/entity/         # Entidades JPA (Equipo, Historial, Usuario, Enums)
│   │   ├── security/                   # JWT (JwtService, JwtAuthenticationFilter, SecurityConfig + CORS)
│   │   └── web/controller/             # Controladores REST + GlobalExceptionHandler
│   └── src/test/                       # Suite de pruebas unitarias y de integración (JUnit 5 + MockMvc + H2)
│
└── frontend/                           # Aplicación Web SPA (Angular Standalone + SASS + Bootstrap 5.3)
    └── src/
        ├── styles.scss                 # Sistema de diseño global con variables SASS ($), @mixins y Bootstrap 5
        └── app/
            ├── core/
            │   ├── guards/             # auth.guard.ts, role.guard.ts (Protección de rutas RBAC)
            │   ├── interceptors/       # jwt.interceptor.ts (Inyección Bearer Token + captura de errores HTTP)
            │   ├── models/             # Interfaces TypeScript sincronizadas 1:1 con los DTOs de Java
            │   └── services/           # auth.service.ts, equipo.service.ts, reporte.service.ts
            ├── shared/components/      # navbar, sidebar, stat-card, estado-badge, alert-banner
            └── features/
                ├── auth/               # login.component (con acceso rápido 1-click), register.component
                ├── dashboard/          # dashboard-circularidad.component (KPIs + gráficos sobre 20K registros)
                └── equipos/            # equipos-list, equipo-form, cambio-estado-modal, pasaporte-digital
```

---

## ▶️ 2. Guía Rápida de Ejecución (Cómo Iniciar Backend y Frontend)

### Paso 1: Levantar el Backend (`api/` en `http://localhost:8080`)

El backend se conecta automáticamente a **Neon Cloud (PostgreSQL)** según la configuración en `api/src/main/resources/application.properties` y habilita CORS global para `http://localhost:4200`.

Abre una terminal en la raíz del proyecto y ejecuta:

```powershell
cd api
.\mvnw.cmd spring-boot:run
```

> **Nota:** Cuando veas en consola `Tomcat started on port 8080 (http)`, la API REST estará lista en `http://localhost:8080`.

---

### Paso 2: Levantar el Frontend (`frontend/` en `http://localhost:4200`)

Abre una **segunda terminal** en la raíz del proyecto y ejecuta:

```powershell
cd frontend
npm install
npm start
```

> **Nota:** Abre tu navegador en **`http://localhost:4200`**. Para compilar el bundle de producción ejecuta `npx ng build` dentro de `frontend/`.

---

## 🔐 3. Credenciales de Acceso por Rol (RBAC)

Al iniciar el backend, `DataInitializer` garantiza la existencia de los **5 perfiles operativos**. En la pantalla de Login (`http://localhost:4200/login`) también dispones de botones **1-Click Demo** para ingresar instantáneamente con cualquiera de ellos:

| Rol RBAC | Usuario | Contraseña | Permisos en el Sistema |
| :--- | :--- | :--- | :--- |
| **`SUPERVISOR`** *(Recomendado)* | `supervisor` | `supervisor123` | **Acceso total**: Dashboard de Circularidad (KPIs), registrar/editar equipos (`POST`/`PUT`), cambiar estado (`PATCH`), baja lógica (`DELETE`) y Pasaporte Digital. |
| **`RECEPCION`** | `recepcion` | `recepcion123` | Registrar nuevos equipos (`POST`), actualizar datos (`PUT`), listar inventario y consultar Pasaporte Digital. |
| **`TECNICO`** | `tecnico` | `tecnico123` | Cambiar estado del ciclo de vida y cerrar con destino/evidencia (`PATCH`), listar inventario y consultar Pasaporte Digital. |
| **`AUDITOR`** | `auditor` | `auditor123` | **Solo lectura estricta**: consultar Dashboard de Circularidad (`/api/reportes/circularidad`), inventario y Pasaporte Digital. Cualquier intento de modificación retorna `403 FORBIDDEN`. |
| **`ENTIDAD_APORTANTE`** | `aportante` | `aportante123` | Consultar inventario de equipos aportados y verificar su Pasaporte Digital. |

---

## ☁️ 4. Integración con Neon Cloud (20,000 Registros) y Optimización

1. **Conexión Cloud PostgreSQL (`Neon Tech`)**:
   - Configurada en `api/src/main/resources/application.properties` con SSL requerido (`sslmode=require`) y `org.postgresql:postgresql` en `api/pom.xml`.
   - La base de datos en memoria `H2` se mantiene en `<scope>test</scope>` (`api/src/test/resources/application.properties`) para que los tests automatizados se ejecuten de forma aislada y ultrarrápida sin alterar los datos de la nube.
2. **Optimización de `GET /api/equipos` para 20,000 registros**:
   - El endpoint `GET /api/equipos` soporta parámetros opcionales `?serial=...&estado=...` y utiliza consultas indexadas `findTop100ByActivoTrueOrderByIdDesc()` en `EquipoRepository`, evitando colapsar el navegador al devolver únicamente el lote activo más reciente o filtrado.
3. **Cálculo Global de Indicadores (`GET /api/reportes/circularidad`)**:
   - `ReporteServiceImpl` calcula los KPIs sobre el universo completo de **20,000+ registros** mediante agregaciones `COUNT` directas en PostgreSQL (`count()`, `countByEstadoActual()`, `countEquiposCerradosConEvidencia()`, `countRegistrosIncompletos()`, `countSerialesRepetidos()`).

---

## 📊 5. Matriz de Consistencia y Operacionalización (Capítulo 1)

| Variable / Indicador | Definición / Fórmula | Meta / Regla Implementada |
| :--- | :--- | :--- |
| **Problema General** | Falta de trazabilidad y gestión centralizada en la recuperación de equipos electrónicos. | Resuelto mediante Pasaporte Digital con trazabilidad inmutable. |
| **Índice de Circularidad (%)** | $\frac{\text{Reutilizados} + \text{Reparados}}{\text{Total Recibidos}} \times 100$ | Calculado dinámicamente en `/api/reportes/circularidad` y visualizado en el Dashboard. |
| **Tasa de Exactitud de Registros (%)** | Validación de unicidad de `serial` y campos obligatorios con rechazo automático ante duplicados. | Línea base del 18% de error reducida a **0% de duplicidad** (100% de exactitud). |
| **Completitud de Trazabilidad (%)** | $\frac{\text{Equipos cerrados con destino y evidencia}}{\text{Total equipos cerrados}} \times 100$ | Subida del 72% al **100%** obligatoria por regla de cierre (`HTTP 422`). |

---

## ⚙️ 6. Reglas de Negocio y Endpoints REST

### Reglas de Negocio Críticas
1. **Unicidad de Serial (`409 CONFLICT` - `SERIAL_DUPLICADO`)**: Impide registrar o actualizar un equipo con un número de serie ya existente.
2. **Cierre con Evidencia Obligatoria (`422 UNPROCESSABLE ENTITY` - `EVIDENCIA_DESTINO_INCOMPLETA`)**: Impide pasar un equipo a un estado final (`REUTILIZADO`, `RECICLADO`, `DESMANTELADO`, `DISPOSICION_FINAL`) sin registrar `destinoFinal` y `evidenciaDestino`.
3. **Rol Auditor Solo Lectura (`403 FORBIDDEN` - `AUDITOR_SOLO_LECTURA` / `ACCESO_DENEGADO`)**: Restringe cualquier operación de escritura al rol `AUDITOR`.
4. **Baja Lógica Conservando Trazabilidad (`DELETE /api/equipos/{id}`)**: Exclusivo para `SUPERVISOR`; marca `activo = false` y registra el evento en el Pasaporte Digital sin borrar físicamente la trazabilidad histórica.

### Resumen de Endpoints REST (`http://localhost:8080`)
- `POST /api/auth/login` — Autenticación de usuario y emisión de token JWT.
- `POST /api/auth/register` — Registro de nuevo usuario con asignación de rol RBAC.
- `GET /api/equipos?serial=&estado=` — Lista los últimos 100 equipos activos o filtra por serial y estado (`AUDITOR`, `RECEPCION`, `TECNICO`, `SUPERVISOR`, `ENTIDAD_APORTANTE`).
- `GET /api/equipos/{id}` — Obtiene el detalle de un equipo por ID.
- `GET /api/equipos/{id}/pasaporte` — Obtiene el **Pasaporte Digital** con su línea de tiempo cronológica auditable.
- `POST /api/equipos` — Registra un nuevo equipo y crea su primer evento en el Pasaporte Digital (`RECEPCION`, `SUPERVISOR`).
- `PUT /api/equipos/{id}` — Actualiza serial, tipo y características dejando constancia en el historial (`RECEPCION`, `SUPERVISOR`).
- `PATCH /api/equipos/{id}/estado` — Ejecuta transiciones de estado y valida evidencia documental en estados de cierre (`TECNICO`, `SUPERVISOR`).
- `DELETE /api/equipos/{id}` — Aplica baja lógica (`activo = false`) conservando el Pasaporte Digital (`SUPERVISOR`).
- `GET /api/reportes/circularidad` — Calcula los indicadores de circularidad sobre el total de la base de datos (`SUPERVISOR`, `AUDITOR`).

---

## 🎓 7. Cumplimiento del Sílabo de Frontend (Semanas 11 a 14)

| Semana | Contenido del Sílabo | Implementación en `frontend/` |
| :---: | :--- | :--- |
| **11** | **Fundamentos de Angular. Generación de componentes. Aplicación de estilos con el preprocesador SASS.** | Configurado con `.scss` por defecto en `angular.json`. Variables SASS (`$`), `@mixin`s reutilizables y anidamiento en `src/styles.scss` junto con Bootstrap 5.3 y 12 componentes Standalone distribuidos en `shared/` y `features/`. |
| **12** | **Sistemas de rutas de Angular. Comunicación entre componentes.** | Enrutamiento SPA en `app.routes.ts` (`/login`, `/register`, `/dashboard`, `/equipos`, `/equipos/:id/pasaporte`) y comunicación Padre ↔ Hijo con `@Input()` y `@Output() EventEmitter` en modales, tarjetas KPI, badges y alertas. |
| **13** | **Procesamiento de formularios. Manejo de errores y validación de datos.** | Formularios validados (`required`, `minlength`, `maxlength`, `email`, reglas condicionales de evidencia de cierre) y captura estructurada de errores HTTP (`409`, `422`, `403`, `404`, `400`) mediante `jwt.interceptor.ts` y `AlertBannerComponent`. |
| **14** | **Consumo de servicios Web con Angular. Prácticas comunes para consumir API REST. Autorización y autenticación en Angular.** | Servicios inyectables (`AuthService`, `EquipoService`, `ReporteService`) consumiendo la API REST con `HttpClient`, inyección automática de `Authorization: Bearer <token>` en `jwtInterceptor` y protección de rutas mediante `authGuard` y `roleGuard`. |

---

## 🧪 8. Ejecución de Pruebas Automatizadas (Backend TDD)

Para ejecutar la suite completa de pruebas unitarias y de integración en memoria (H2):

```powershell
cd api
.\mvnw.cmd test
```
