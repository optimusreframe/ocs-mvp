# Plan de implementación: OCS a producción full stack

## Overview

Convertir la demo estática OCS en un producto SaaS/full stack seguro, multiagencia y operable. El programa conserva las siete áreas y los 40 destinos del handoff mientras prioriza slices verticales. El estado de progreso es [OCS_LIVE_PROGRAM.md](../OCS_LIVE_PROGRAM.md); los checkbox actuales están en [todo.md](./todo.md).

## Estado de partida

- Vite frontend estático en GitHub Pages; demo en `localStorage`, sin usuarios reales, API ni base de datos.
- 7 áreas y 40 destinos según `INTERACTION_INVENTORY.md`; controles y relaciones son una maqueta con fixtures.
- Sheets fue definido como fuente contable de solo lectura en la primera etapa; correo, SMS, firma, pagos e IA requieren simulación y aprobación antes de producir efectos.
- La demo no sirve como base de seguridad ni aislamiento multi-tenant. No migrar datos reales de clientes a ella.

## Decisiones de arquitectura pendientes

No elegir credenciales, proveedores ni cuentas por intuición. Antes de la Fase 3, registrar ADR con:

- Modelo de entrega: SaaS OCS, licencia/instalación de agencia o alcance de ambos.
- Framework de aplicación y estrategia de migración desde Vite.
- Cloud, región, residencia/retención y clasificación de datos.
- Autenticación, MFA, invitaciones, sesiones y recuperación.
- Base relacional, aislamiento tenant (RLS/servicio), migraciones y backups.
- Almacenamiento de documentos, antivirus, URLs firmadas y versionado.
- Cola/jobs, correo, SMS, calendario, firma y proveedor de IA; todos con sandbox y aprobación.
- Costos, SLOs, privacidad, términos y requisitos regulatorios aplicables.

Las opciones, evidencia y autorización se documentarán en `tasks/adr/`. Las decisiones con gasto, acceso externo, datos personales o efectos legales necesitan aprobación explícita antes de ejecutarse.

## Arquitectura objetivo (agnóstica a proveedor)

```text
Browser / PWA
  → App UI + API client (no secretos)
  → API autenticada (validación + autorización por agencia/rol/acción)
  → Servicios de dominio y jobs idempotentes
  → DB relacional + almacenamiento privado de objetos
  → adaptadores de integración con sandbox, allowlist y aprobación
  → auditoría, métricas, logs, alertas y backups
```

- `agency_id` / tenant se deriva de la sesión autorizada; nunca se acepta como límite de seguridad desde el cliente.
- Las integraciones se encapsulan tras adaptadores; los secretos viven en un vault/secret manager, nunca en Vite ni bundle público.
- Los efectos públicos se preparan como draft, validan y pasan por policy/approval antes de enviar o publicar.
- Sheets empieza como read-only; conciliaciones y explicaciones de OCS viven en tablas propias.
- El portal y la IA solo consultan contenido publicado y autorizado para el tenant, cliente y claim.

## Fases y tareas

### Fase 0 — Demo navegable (completada como demo)

- [x] Navegación a 40 destinos/7 áreas, workflows visuales y datos sintéticos.
- [x] Registro de límites: nada de backend, credenciales ni conexiones.
- [x] GitHub Pages como showcase estático.

**No es evidencia de disponibilidad/seguridad de producción.**

### Fase 1 — Contrato de producto y dominio (activa)

- [ ] Clasificar cada módulo: Release 1 / posterior / solo lectura / retirado.
- [ ] Establecer perfiles, acciones y matrices de permisos por actor y agencia.
- [ ] Formalizar entidades, relaciones, estados, invariantes, retención y fuentes de verdad.
- [ ] Definir journeys y criterios observables del primer release.
- [ ] Resolver decisiones comerciales/operativas que cambian arquitectura sin conectar cuentas.

**Entregables:** matriz de alcance, modelo conceptual, matriz de roles, catálogo de eventos/estados, acceptance pack.

### Gate 1 — Revisión de producto

- [ ] Scope, perfiles y exclusiones aprobados.
- [ ] Cero contradicciones entre los siete grupos, las 40 vistas y el primer release.
- [ ] Datos sensibles y acciones públicas identificados.

### Fase 2 — Arquitectura, amenazas y ADRs

- [ ] Elegir (y documentar) modelo de entrega, framework, runtime, DB, cloud/región, auth, storage y vendors.
- [ ] Modelo de amenazas y abuso: acceso entre agencias, portal, archivos, IA, sesiones, webhooks, importaciones.
- [ ] Contratos de API, versionado, idempotencia, paginación, errores y jobs.
- [ ] Política de secrets, environment separation, migrations, audit, retention, backups y incident response.
- [ ] Estimación de costo y plan de salida/portabilidad.

**Gate 2:** decisiones de arquitectura/riesgo/costo revisadas antes de recursos cloud, cuentas o datos reales.

### Fase 3 — Foundation segura y despliegue de staging

Slice vertical: cuenta demo autorizada → crear agencia tenant → invitar staff → asignar roles → entrar a la agencia → escribir evento de auditoría.

- [ ] Repo/runtime, CI, lint/typecheck/tests/build, variables de entorno y secrets scan.
- [ ] Auth, sesión segura, MFA/recuperación conforme al producto y memberships.
- [ ] Schemas/migrations, tenants, roles/permissions, audit log y aislamiento probado.
- [ ] API client, validación server-side, errores y rate limits.
- [ ] Staging privado, health/readiness, logs/metrics/alerts y runbooks.

**Gate 3:** pruebas negativas de aislamiento y roles pasan; despliegue/reversión de staging funcionan.

### Fase 4 — Claims y clientes

Slice: invitar staff → crear policyholder/cliente → propiedad/póliza → claim → asignación → tarea → timeline → búsqueda/filtros.

- [ ] Entidades y CRUD API, validación, relaciones, archive/delete policy.
- [ ] Listas, detalle, Perfil 360, estados/timeline y vistas configurables.
- [ ] Paginación, búsqueda/filtros/sort persistentes y exportación autorizada.
- [ ] Roles: adjuster, assistant, manager, agency admin, customer context.

### Fase 5 — Operaciones

- [ ] Task/checklist CRUD, asignación y movement history.
- [ ] Workflow stages, transición y reglas versionadas con dry-run.
- [ ] Calendario/eventos, zona horaria, cancelación y notificaciones en sandbox.
- [ ] Jobs programados idempotentes, límites y auditoría de automatizaciones.

### Fase 6 — Documentos y portales

- [ ] Objeto privado, metadata, antivirus/quarantine, hash, versionado, retención y recuperación.
- [ ] Templates/mapeo, previews y generación; pruebas de campos/errores.
- [ ] Política de visibilidad (interno/draft/publicar/publicar+notificar) con approval.
- [ ] Portal autenticado; aislamiento cliente/claim/documento probado.
- [ ] Mitigation partner con scope mínimo y casos explícitamente vinculados.
- [ ] Firma mediante sandbox/test accounts; legales revisados antes de live.

### Fase 7 — Comunicaciones

- [ ] Email ingest/shared inbox/thread, deduplicación y sync cursor.
- [ ] Matching sugerido explicable; ambiguos requieren revisión.
- [ ] Drafts/approvals/versionado antes de cualquier acción externa.
- [ ] SMS/llamadas detrás de adapters; consentimiento, límites, opt-out, reintentos idempotentes.
- [ ] Webhooks con firma, replay protection, logs no sensibles y sandbox.

**Gate 7:** ninguna entrega pública por defecto; activar live por proveedor solo tras autorización/configuración aprobada.

### Fase 8 — Finanzas e inteligencia

- [ ] Conector read-only de Sheets cuando se aprueben scopes y acceso; verificar que no existen endpoints de escritura.
- [ ] Reconciliación OCS, anotaciones, asociaciones, filtros y auditoría separados de datos fuente.
- [ ] Reportes/KPIs derivados, fechas, permisos y exportaciones controladas.
- [ ] IA con tenant/data scopes, citas de fuente, redacción/PII controls, logging, budgets, kill switch y evaluación.
- [ ] Acciones IA: preview, aprobación, ejecución autorizada, undo compensatorio y registro.

### Fase 9 — Administración y paridad de alcance

- [ ] Integraciones, import/export, jobs de migración y rollback.
- [ ] Usuarios/roles configurable, branding, billing/licencias y superadmin con acceso de mínimo privilegio.
- [ ] Backups automáticos/restore drill, retención, portabilidad y salida de agencia.
- [ ] Offline solo tras análisis de threat model, cifrado en dispositivo, expiración y sync-conflicts.
- [ ] Soporte, temporary access JIT con scope/expiry/approval y auditoría inmutable.
- [ ] Todos los módulos restantes clasificados/entregados con criterio de aceptación propio.

### Fase 10 — QA y hardening

- [ ] Unit/component/contract/integration/E2E para rutas, CRUD, roles, tenant isolation, integraciones y acciones.
- [ ] Auditoría de 40 destinos y controles, pruebas responsive/a11y y UX con usuarios.
- [ ] Security review, dependency/SAST/DAST, abuso y privacidad; reparar severidades críticas/altas.
- [ ] Performance/load, límites de concurrencia, observabilidad, alerting y SLO/SLI.
- [ ] Backup/restore, disaster recovery, rollback y migration rehearsal.
- [ ] Runbooks de incidentes, rotación de secretos, retención/borrado y soporte.

### Fase 11 — Piloto privado

- [ ] Sandbox de proveedores y tenants/agencias piloto con consentimiento.
- [ ] Datos sintéticos o minimizados; entrenamiento y soporte.
- [ ] Criterios de entrada/salida, feedback y registro de incidencias.
- [ ] Go/no-go firmado por producto, seguridad, operaciones y negocio.

### Fase 12 — Producción gradual

- [ ] Deploy progresivo, migraciones compatibles y feature flags.
- [ ] Smoke tests, monitoreo y rollback dentro de ventana acordada.
- [ ] Integraciones live activadas por proveedor, scopes mínimos y límites.
- [ ] Soporte/guardia, status page y comunicación aprobada.

### Fase 13 — 100% Live production

- [ ] Todos los destinos comprometidos tienen datos persistentes/API y criterios de operación aprobados.
- [ ] No hay critical-path mocks, rutas muertas o fixtures en tenant real.
- [ ] Seguridad, backup/restore, continuidad, soporte, SLO y ownership cumplen definición en `OCS_LIVE_PROGRAM.md`.
- [ ] Decisiones de exclusión/postponement firmadas; release final y deuda residual registrados.

## Riesgos y mitigación

| Riesgo | Nivel | Mitigación |
|---|---|---|
| Fuga multi-tenant vía API/portal/IA | Crítico | Tenant derivado de sesión; RLS/authorization; negative tests y auditoría independiente |
| Demo confundida con producción | Alto | Banner demo, dominio/env separados, no datos reales, CI y runbooks separados |
| Efecto externo accidental (correo/publicación/pago/firma) | Alto | Draft-first, sandboxes, approvals, idempotencia, feature flags, allowlist |
| Sheets como fuente de verdad difusa | Alto | Solo lectura al inicio; ledger/anotación OCS separada; reconciliación explícita |
| Alcance muy grande | Alto | Release 1 priorizado; slices verticales; gate de cierre por fase |
| Vendor/costo no acordado | Medio/alto | ADR y cost review antes de cloud/proveedores |
| Documentos con PII/sensibles | Alto | Storage privado, scanning, scope URLs, retention/deletion y audit |

## Open questions que se resolverán por fases

- ¿El primer release es SaaS hospedado, instalación Full Suite, o ambos?
- ¿Qué estados/roles/operaciones pueden publicar automáticamente sin aprobación humana?
- ¿Qué fuentes de datos se consideran oficiales por entidad y quién las administra?
- ¿Qué jurisdicciones, acuerdos de retención y obligaciones regulatorias aplican?
- ¿Qué proveedor/costo de hosting, auth, DB, storage, email, SMS, calendar, signature, AI y billing se aprueba?
