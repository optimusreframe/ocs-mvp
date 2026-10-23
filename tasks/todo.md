# OCS Live Program · task tracker

Mantener los estados y evidencias alineados con [`../OCS_LIVE_PROGRAM.md`](../OCS_LIVE_PROGRAM.md). No cerrar una fase por terminar el frontend: registrar verificaciones, limitaciones y decisión de salida.

## Phase 0 — Demo navegable (demo, complete)

- [x] 0.1 Siete áreas y módulos navegables con fixtures locales.
- [x] 0.2 Flujos demo, CRUD/localStorage y avisos sin conexión real.
- [x] 0.3 Dashboard responsive; Pages publica el bundle estático.
- [x] 0.4 Registrar que no hay backend, DB, auth ni data isolation real.

**Evidencia:** commit `ccafd22`, build Vite, publicación GitHub Pages, revisión Chrome en 1440/1024/768/390/320 px. Revisiones registradas en `INTERACTION_INVENTORY.md` y `OCS_LIVE_PROGRAM.md`.

## Phase 1 — Product contract and domain (active)

### Task 1.1 — Mapear módulos hacia áreas de dominio
**Descripción:** usar handoff e inventario para mapear cada destino visible a entidades, acciones y owners de datos.

**Criterios de aceptación:**
- [x] Las siete áreas del handoff están registradas en el roadmap.
- [x] La cobertura de 40 destinos se referencia en el inventario actual.
- [x] Cada destino queda priorizado Release 1 / después / read-only / gated, como propuesta pendiente de aprobación.

**Verificación:** comparar listado del handoff con navegación/inventario; documentar diferencias.

**Evidencia:** [`product-scope.md`](./product-scope.md) inventaría 40 destinos en siete áreas, conserva todos los módulos y aclara que la priorización requiere aprobación.

**Dependencias:** ninguna. **Archivos:** `OCS_LIVE_PROGRAM.md`, `INTERACTION_INVENTORY.md`. **Tamaño:** S.

### Task 1.2 — Definir modelo conceptual, fuentes de verdad y clasificación
**Descripción:** especificar agencia/tenant, actores, clientes, propiedad, póliza, claim, operaciones, documentos, comunicaciones, portal, finanzas y administración, con relaciones y datos sensibles.

**Criterios de aceptación:**
- [x] Entidades, claves de pertenencia tenant y relaciones definidas como propuesta.
- [x] Datos PII/financieros/documentales clasificados; retención/eliminación y fuente de verdad propuestas por entidad, sujetas a validación legal/negocio.
- [x] Estados, invariantes, eventos de auditoría y efectos externos propuestos.

**Avance de borrador:** [`domain-model.md`](./domain-model.md) define los límites, relaciones e invariantes conceptuales, fuentes de verdad, clasificación y permisos propuestos. Continúa pendiente la revisión de producto, seguridad y legal; no es un esquema físico aprobado.

**Permisos:** [`permission-matrix.md`](./permission-matrix.md) propone capacidades y scopes para siete actores, incluidos Customer, Mitigation y Superadmin; quedan decisiones administrativas/comerciales pendientes.

**Seguridad preparatoria:** [`threat-model.md`](./threat-model.md) registra 17 amenazas con controles y pruebas de salida. Es un borrador, no revisión formal ni evidencia de seguridad implementada.

**Estados/eventos:** [`domain-states.md`](./domain-states.md) propone ciclos de vida para 14 entidades/conjuntos de entidades y catálogo de eventos auditables; reglas de claim siguen configurables y pendientes de aprobación.

**Verificación:** revisar cada entidad contra las siete áreas y journeys; no copiar registros reales.

**Dependencias:** 1.1. **Archivos:** `tasks/domain-model.md`, `tasks/plan.md`. **Tamaño:** M.

### Task 1.3 — Priorizar el primer release y criterios E2E
**Descripción:** reducir el alcance inicial a un conjunto coherente de slices y definir entradas/salidas del piloto.

**Criterios de aceptación:**
- [x] Proponer primer journey con datos ficticios y resultado útil para un adjuster y una agencia.
- [x] Proponer actor/approval/reglas de publicación del portal y acciones externas.
- [x] Definir exclusiones, handoff y estados de error en la propuesta.

**Avance de borrador:** [`product-scope.md`](./product-scope.md) propone journey y criterios E2E positivo/negativo, estados de error y módulos posteriores/read-only/gated. Criterios sujetos a aprobación.

**Contrato técnico de apoyo:** [`contracts/ocs-core-api-draft.yaml`](./contracts/ocs-core-api-draft.yaml) define 18 operaciones REST de borrador para agencia, clientes, claims, tareas, documentos, portal y auditoría; identidad/proveedor no están decididos y no hay API desplegada. El YAML parsea y las 119 referencias internas y `operationId` únicos pasan comprobación estructural; falta validación formal OpenAPI y aprobación del contrato.

**Acceptance pack:** [`acceptance/core-vertical-slice.md`](./acceptance/core-vertical-slice.md) concreta 16 escenarios positivos, negativos, de concurrencia, portal, privacidad e integración bloqueada. Son casos futuros, todavía no ejecutados porque no existe API/auth/staging.

**Verificación:** cada criterio es observable en UI/API futura, con caso positivo y negativo.

**Dependencias:** 1.1, 1.2. **Archivos:** `tasks/product-scope.md`, `tasks/plan.md`. **Tamaño:** M.

### Task 1.4 — Resolver decisiones de producto que afectan arquitectura
**Descripción:** registrar delivery model, roles, autoridades de datos, regiones y decisiones regulatorias/comerciales necesarias para ADRs.

**Criterios de aceptación:**
- [ ] Decisiones y owner/fecha/documentos de aprobación registrados.
- [ ] Requisitos desconocidos quedan como bloqueos explícitos, no supuestos ocultos.

**Verificación:** confirmar contra stakeholders antes de provisionar recursos o conectar cuentas.

**Dependencias:** 1.2, 1.3. **Archivos:** `tasks/adr/`, `OCS_LIVE_PROGRAM.md`. **Tamaño:** S.

### Checkpoint — Fase 1
- [ ] Contrato de producto revisado y aprobado.
- [ ] Entidades, permisos, datos sensibles, sources of truth y primer release coherentes.

## Phase 2 — Architecture and threat model (blocked by Phase 1 gate, not started)

**Preparación:** threat model inicial en [`threat-model.md`](./threat-model.md). Ninguna mitigación se considera implementada y el gate de Fase 1 sigue pendiente.

- [ ] 2.1 Escribir ADRs de framework, cloud/region, tenancy, auth, DB, object storage, jobs y proveedores.
- [ ] 2.2 Modelar amenazas para multi-tenancy, portal, documentos, IA, importación, webhooks y sesiones.
- [ ] 2.3 Definir contratos API, auditoría, observabilidad, backup, retención, restore, rollback y costos.
- [ ] 2.4 Obtener gate de producto/seguridad/negocio antes de cuentas, servicios o gasto.

### Checkpoint — Architecture gate
- [ ] ADR aprobado; threat model priorizado y plan de mitigación con owner.

## Phases 3–13 — Build to production

Detailed exit criteria and slices are in [`plan.md`](./plan.md) and summary in [`../OCS_LIVE_PROGRAM.md`](../OCS_LIVE_PROGRAM.md).

- [ ] 3. Secure backend foundation + private staging.
- [ ] 4. Claims and client vertical slice.
- [ ] 5. Tasks, workflows and calendar.
- [ ] 6. Documents and isolated portals.
- [ ] 7. Communications and approval controls.
- [ ] 8. Read-only finance, reconciliation, reporting and safe AI.
- [ ] 9. Administration, import/export, SaaS operations and module parity.
- [ ] 10. Security, QA, accessibility, reliability and release hardening.
- [ ] 11. Authorized pilot in staging.
- [ ] 12. Gradual production launch with rollback and support.
- [ ] 13. Close out Definition of Done for 100% Live production.
