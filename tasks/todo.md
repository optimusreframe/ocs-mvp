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
- [ ] Cada destino queda priorizado Release 1 / después / read-only / retirar.

**Verificación:** comparar listado del handoff con navegación/inventario; documentar diferencias.

**Dependencias:** ninguna. **Archivos:** `OCS_LIVE_PROGRAM.md`, `INTERACTION_INVENTORY.md`. **Tamaño:** S.

### Task 1.2 — Definir modelo conceptual, fuentes de verdad y clasificación
**Descripción:** especificar agencia/tenant, actores, clientes, propiedad, póliza, claim, operaciones, documentos, comunicaciones, portal, finanzas y administración, con relaciones y datos sensibles.

**Criterios de aceptación:**
- [ ] Entidades, claves de pertenencia tenant y relaciones definidas.
- [ ] Datos PII/financieros/documentales clasificados con retención/eliminación y fuente de verdad por entidad.
- [ ] Estados, invariantes, eventos de auditoría y efectos externos identificados.

**Verificación:** revisar cada entidad contra las siete áreas y journeys; no copiar registros reales.

**Dependencias:** 1.1. **Archivos:** `tasks/domain-model.md`, `tasks/plan.md`. **Tamaño:** M.

### Task 1.3 — Priorizar el primer release y criterios E2E
**Descripción:** reducir el alcance inicial a un conjunto coherente de slices y definir entradas/salidas del piloto.

**Criterios de aceptación:**
- [ ] Definir primer journey con datos ficticios y resultado útil para un adjuster y una agencia.
- [ ] Portal y acciones externas tienen actor, approval y reglas de publicación.
- [ ] Definir exclusiones explícitas, handoff y estados de error.

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
