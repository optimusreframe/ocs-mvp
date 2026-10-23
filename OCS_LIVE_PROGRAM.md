# OCS Live Program

**Objetivo:** llevar OCS desde el MVP demostrativo actual hasta una plataforma full stack lista para operar en producción, registrando cada fase, su evidencia, bloqueos y siguiente paso.

**Goal persistente de Codex:** activo · el objetivo de esta tarea está conectado con este programa.

**Estado al 2026-10-23:** Fase 0 completada como demo; Fase 1 activa. La aplicación publicada sigue siendo una demo estática sin backend.

## Roadmap ejecutivo

| Fase | Resultado | Estado | Gate para avanzar |
|---|---|---|---|
| 0. Demo navegable | UX, 7 áreas y 40 destinos probables con datos sintéticos y acciones locales | **Completada · demo** | No equivale a producto de producción |
| 1. Contrato de producto y dominio | Alcance priorizado, entidades, permisos, flujos y criterios de aceptación | **Activa** | Acordar alcance del primer release y reglas de datos |
| 2. Arquitectura de producción | ADR de stack, tenancy, identidad, datos, archivos, jobs, hosting y proveedores | Pendiente | Decisiones de arquitectura y costo aprobadas |
| 3. Plataforma segura | Entornos, API, base de datos, migraciones, autenticación, autorización, tenancy, auditoría y CI/CD | Pendiente | Pruebas de aislamiento/roles y despliegue de staging |
| 4. Core claims/clientes | Agencia, usuarios, clientes, propiedades, pólizas, carriers, claims, asignaciones y timeline persistentes | Pendiente | Flujo claim de extremo a extremo pasa en staging |
| 5. Operaciones | Tareas, checklists, Kanban/lista, workflows, reglas, calendario y movimientos | Pendiente | Automatizaciones controladas, auditables y probadas |
| 6. Expedientes y portales | Storage, documentos/versiones/templates, visibilidad, portal de cliente/mitigation y firmas | Pendiente | Aislamiento documental y publicación segura verificados |
| 7. Comunicaciones | Inbox/buzones, matching, llamadas/SMS, drafts y aprobaciones | Pendiente | Proveedores en sandbox; envíos live solo con aprobación explícita |
| 8. Finanzas y conciliación | Mirror de fuentes, conciliación local, reportes y exportaciones con control de fuente de verdad | Pendiente | Acuerdo de acceso y lectura; Sheets permanece read-only en la primera etapa |
| 9. Inteligencia, importación y administración SaaS | IA segura, logs/undo, importaciones, vistas/campos, soporte, backups, billing/licencias y superadmin | Pendiente | Evaluaciones de privacidad, permisos, reversión y operación pasan |
| 10. Endurecimiento preproducción | QA integral, seguridad, accesibilidad, rendimiento, observabilidad, backups/restores, recuperación y documentación | Pendiente | Cero hallazgos críticos/altos abiertos y checklist de release completo |
| 11. Piloto de staging | Agencias/usuarios piloto autorizados, datos controlados, feedback y runbooks | Pendiente | Aprobación de negocio, seguridad y soporte |
| 12. Lanzamiento gradual | Producción con rollout, rollback, monitoreo, soporte y control de cambios | Pendiente | SLOs y guardias definidos; smoke tests de producción aprobados |
| 13. 100% Live production | Todos los módulos comprometidos usan flujos persistentes reales, permisos probados y servicios aprobados | Pendiente | Definición de “Done para producción” cumplida abajo |

## Estado real y límite de lo publicado

- Repo: `optimusreframe/ocs-mvp`, rama `main`.
- Demo actual: GitHub Pages, build estático de Vite. Commit de referencia: `ccafd22` (rediseño Apple-inspired del Dashboard; confirmado en `main`).
- No existe backend, base de datos, autenticación real, almacenamiento de archivos, jobs, secretos de integración ni logs de servidor.
- `localStorage` y los fixtures son solo para demostración; no guardar datos reales en la demo.
- La interfaz actual cubre los grupos del handoff; el mapa de módulos y limitaciones está en [INTERACTION_INVENTORY.md](./INTERACTION_INVENTORY.md).
- Ninguna conexión a Gmail, Vonage, Google Sheets, Claim Wizard, Airtable, Resend, DocuSign ni otro servicio se activa como parte de esta planificación.

## Cobertura de las siete áreas

| Área del producto | Dominio y futuras entregas backend |
|---|---|
| Inicio | Dashboard derivado de datos autorizados, prioridades, actividad/auditoría y navegación contextual |
| Claims y clientes | Agencias, memberships, clientes/policyholders, propiedades, pólizas, carriers, contactos, licencias, claims, relaciones y vistas configurables |
| Operaciones | Tareas/checklists/movimientos, workflow/claim stages, reglas, automatizaciones, eventos y recordatorios |
| Comunicaciones | Buzones, threads, mensajes, matching/revisión, llamadas, SMS, drafts, approvals y soporte/handoff |
| Expedientes y portales | Documentos/objetos/versiones/templates/mapeos, publicación, firma, portal de cliente y portal de mitigation aislado |
| Finanzas e inteligencia | Fuentes contables de solo lectura al inicio, anotaciones de conciliación OCS, reportes, IA con scopes y bitácora |
| Configuración y administración | Usuarios, roles, permisos, branding, conexiones/secretos, importaciones, offline, backups, accesos temporales, superadmin y billing/licencias |

## Definition of Done · 100% Live production

Un módulo cuenta como live únicamente cuando:

1. Sus datos de negocio se leen/escriben por API autenticada y modelo persistente; el flujo crítico no depende de fixtures ni `localStorage`.
2. Cada endpoint valida agencia/tenant, actor, rol, alcance y estado; las pruebas demuestran aislamiento entre agencias y denegación por defecto.
3. CRUD, estados, asociaciones, validación, errores, carga/vacíos, concurrencia y auditoría tienen pruebas automatizadas y recorrido manual en staging.
4. Los efectos externos tienen proveedor aprobado, secretos fuera del navegador, modo sandbox, límites, idempotencia, registros y confirmación cuando corresponda. Nunca se declara conectado un servicio sin evidencia de integración autorizada.
5. Backups y restauración están probados; alertas, logs, monitoreo, límites de retención y respuesta a incidentes están documentados.
6. Criterios de seguridad, accesibilidad, rendimiento, recuperación y privacidad del release están aprobados; no quedan controles críticos simulados.
7. Despliegue, rollback, migraciones, soporte y ownership están operativos.

**“100%” significa el alcance de producto priorizado y firmado**, con cada uno de los 40 destinos clasificado como funcional de producción, retirado con decisión registrada o explícitamente pospuesto. No se contará una pantalla bonita o un control que solo muestra un toast como una feature live.

## Registro de fases construidas

| Fecha | Fase / entrega | Evidencia | Resultado / limitaciones | Próximo paso |
|---|---|---|---|---|
| 2026-10-23 | Goal y Live Program inicial | Goal activo de Codex; `OCS_LIVE_PROGRAM.md`, `tasks/plan.md`, `tasks/todo.md` | Roadmap y gates establecidos; no se tocó backend ni servicios | Completar contrato de alcance y dominio de Fase 1 |
| 2026-10-23 | Fase 1.1 propuesta de alcance y borrador de Fase 1.2 | [`tasks/product-scope.md`](./tasks/product-scope.md), [`tasks/domain-model.md`](./tasks/domain-model.md), [`tasks/todo.md`](./tasks/todo.md) | Inventario 40/40 en siete grupos; prioridad, journey, entidades, fuentes, permisos y clasificación propuestos. Pendiente aprobación de negocio/seguridad/legal; documentos conceptuales, sin backend, proveedores ni datos reales. | Revisar propuesta del primer release y validar actores/datos; después cerrar modelo conceptual y criterios E2E |
| 2026-10-23 | Contrato API proveedor-neutral (borrador) | [`tasks/contracts/ocs-core-api-draft.yaml`](./tasks/contracts/ocs-core-api-draft.yaml); parseo YAML y comprobación local de referencias/IDs | 15 rutas, 18 operaciones y 27 esquemas para el journey core; 119 referencias internas resueltas. No desplegado ni validado con un validador formal OpenAPI; auth, proveedor y modelo físico no elegidos. | Ratificar journey/roles; después completar threat model y ADRs antes de implementar endpoints |
| 2026-10-23 | Matriz de permisos por actor (propuesta) | [`tasks/permission-matrix.md`](./tasks/permission-matrix.md), [`tasks/domain-model.md`](./tasks/domain-model.md) | Se especifican capacidades, scope, límites de portal/superadmin, finanzas read-only y acciones sensibles para siete actores. Requiere decisión de negocio; no es política ejecutable ni control desplegado. | Ratificar scopes y excepciones; luego convertir en casos de autorización y pruebas negativas |
| 2026-10-23 | Modelo de amenazas inicial | [`tasks/threat-model.md`](./tasks/threat-model.md) | 17 amenazas cubren tenant/IDOR, portal, archivos, concurrencia, idempotencia, importación, IA, webhooks, export, backups y efectos externos; cada una tiene mitigaciones y criterio de salida. Borrador no revisado, no pentest y sin controles implementados. | Validar owners, amenazas y riesgos aceptados; derivar controles en ADRs e implementación solo tras gate de producto |
| 2026-10-23 | Acceptance pack para el primer vertical slice | [`tasks/acceptance/core-vertical-slice.md`](./tasks/acceptance/core-vertical-slice.md) | 16 escenarios Given/When/Then para core claim, aislamiento, roles, ETags, idempotencia, documentos, portal, auditoría, fuentes read-only y bloqueo de efectos externos. Especificación futura, no pruebas ejecutadas. | Tras aprobar roles y ADRs, implementar auth/tenant/API y automatizar primero AC-01–AC-11 en staging |
| 2026-10-23 | Estados e invariantes del dominio | [`tasks/domain-states.md`](./tasks/domain-states.md), [`tasks/domain-model.md`](./tasks/domain-model.md) | 14 ciclos de vida, transiciones atómicas y catálogo de eventos auditables propuestos; sin máquina de estado implementada y reglas legales/retención abiertas. | Revisar workflow, retención y separación de funciones; luego cerrar Gate 1 y preparar ADRs |
| 2026-10-20 | Fase 0 · FULL DEMO UI y Dashboard | `ccafd22`; `npm run build`; deploy Pages exitoso; revisión Chrome 1440/1024/768/390/320 | Demo estática; CRUD en navegador, sin persistencia multiusuario ni seguridad real | Fase 1: definir modelo/datos/permisos/primer release |

## Siguiente paso concreto

**Siguiente paso: revisar y ratificar alcance, roles y journey.** La matriz [`tasks/product-scope.md`](./tasks/product-scope.md) cubre 40/40 destinos; [`tasks/permission-matrix.md`](./tasks/permission-matrix.md) propone capabilities; [`tasks/domain-model.md`](./tasks/domain-model.md) y [`tasks/domain-states.md`](./tasks/domain-states.md) definen modelo y ciclos de vida; [`tasks/contracts/ocs-core-api-draft.yaml`](./tasks/contracts/ocs-core-api-draft.yaml) especifica operaciones; [`tasks/threat-model.md`](./tasks/threat-model.md) liga amenazas a controles; y [`tasks/acceptance/core-vertical-slice.md`](./tasks/acceptance/core-vertical-slice.md) define 16 escenarios futuros. Son propuestas, no aprobaciones ni controles desplegados. Ratificar decisiones de negocio, seguridad y legal; luego cerrar ADRs y automatizar la aceptación al construir el core. Sin conectar servicios en este paso.

## Cómo mantener el programa actualizado

Al cerrar una fase, actualizar en el mismo cambio:

1. Estado del roadmap aquí y criterios/checkboxes de `tasks/todo.md`.
2. Fila nueva en el registro con fecha, commit/deploy, comandos y recorridos verificados, limitaciones, decisiones y siguiente paso.
3. `tasks/plan.md` si cambia el orden, dependencias, arquitectura o alcance.
4. Goal persistente: mantenerlo activo hasta completar el Definition of Done; actualizarlo a `complete` solo cuando el producto lo cumpla.

Toda evidencia debe distinguir build de validación en navegador, staging de producción, mock de integración real y pruebas de fixtures de datos reales. No registrar secretos, datos de clientes ni información bancaria.
