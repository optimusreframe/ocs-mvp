# OCS · estados, transiciones y eventos

**Estado:** propuesta de dominio para revisión · no es configuración aprobada de procesos ni código ejecutable.
Los estados de OCS representan estado operativo; la agencia podrá versionar sus etapas de claim. Ninguna transición concederá acceso ni disparará un efecto externo por sí sola.

## Ciclos de vida propuestos

| Entidad | Estados | Transiciones permitidas / actor | Invariantes y side effects |
|---|---|---|---|
| Agency | `pending_setup` → `active` → `suspended` → `active`; `closed` terminal sujeto a política | creación por onboarding; activación Admin/proceso aprobado; suspensión por owner autorizado; reactivación auditada | Membership y datos siempre pertenecen a agency; suspender bloquea operaciones de negocio según política, no borra datos. |
| Invitation | `pending` → `accepted` / `revoked` / `expired` | aceptar con token válido y expiración; Admin revoca; expiración por job | Un token no concede membership antes de aceptar; token un solo uso, almacenado como hash y revocable. |
| Membership | `invited` → `active` → `suspended` → `revoked` | activación por invitación; cambios por Admin autorizado; usuario no puede elevar su propio rol | Cada operación vuelve a verificar vigencia; roles/capabilities versionados y auditados. |
| Client / Property / Policy | `active` ↔ `archived`; `deletion_pending` → `deleted` solo tras retención | actor con CRUD; archivado seguro; borrado por workflow de retención aprobado | Archivar no implica borrado de historial; no borrar parent si tiene claim activo/documento legalmente retenido. |
| Claim | `open` ↔ etapas configuradas → `closed`; `closed` → `open` con reapertura justificada | workflow publicado define transiciones; actor y scope requeridos; Admin/rol autorizado reabre | `claimId` OCS inmutable; cada claim fija workflow version; requisitos deben cumplirse; cierre no borra data ni acceso histórico permitido. |
| Task | `open` → `in_progress` / `blocked` / `done` / `cancelled`; `blocked` → `open`/`in_progress`; `done` → `open` solo con permiso y razón | assignee, creador o rol con scope; cambios de asignado/fecha/estado auditados | `done` exige checklist/precondiciones configuradas; cambios de estado no envían notificación externa sin intent aprobado. |
| Document / version | `quarantined` → `available_internal` → `archived`; clasificación separate | scan aprobado y metadata validada; nueva versión append-only; archivado según policy | La primera versión nunca nace publicada; failed scan no libera objeto; reemplazar crea versión nueva, no muta binario histórico. |
| Publication | `unpublished` → `published` → `revoked` | capacidad `documents.publish`, destinatario ligado, clasificación permitida, confirmación | Estado separado del documento; cada nueva versión vuelve a unpublished hasta publicar expresamente; revoke invalida link y proyección. |
| Approval | `draft` → `pending` → `approved` / `rejected` / `cancelled` / `expired` | solicitante crea; aprobador autorizado decide; sin autoaprobación cuando separación sea requerida | Payload y versión aprobada quedan identificados; cambio de draft invalida approval; aprobación no equivale a delivery si falta gate externo. |
| External delivery intent | `draft` → `awaiting_approval` → `queued` → `sent` / `failed` / `cancelled`; `sent` terminal | creador redacta; approval permite queue; worker reintenta de forma limitada | No hay live provider sin feature/config aprobada; outbox/idempotency evita duplicados; registro incluye provider result sin contenido sensible. |
| Finance snapshot / reconciliation | snapshot `received` → `validated` / `rejected` → `superseded`; annotation `unmatched` → `matched` / `ignored` | fuente solo lectura; Accounting/permiso edita anotación local | Source row immutable; match guarda versión/snapshot; error de sync no borra snapshot vigente; sin write-back. |
| Import job | `draft` → `previewed` → `validated` → `committing` → `completed` / `partial` / `failed` / `cancelled` | Admin prepara; approver/commit capability valida y aplica | Commit idempotente; errores por fila descargables con datos minimizados; no aplicar mientras preview haya cambiado. |
| AI request | `proposed` → `reviewed` → `accepted` / `rejected` / `expired` | usuario pide suggestion; reviewer decide; sólo workflow separado puede convertir en acción | Resultado nunca muta por sí mismo; cita/ACL de fuentes; policy o feature off implica no invocar proveedor. |
| Support grant | `requested` → `approved` → `active` → `expired` / `revoked` / `denied` | solicitud y aprobación por personas separadas según policy | Tenancy, recursos y acciones definidos; tiempo limitado; cada acceso auditado y visible al tenant owner. |

## Reglas de transición atómicas

1. Resolver tenant/actor y comprobar autorización sobre estado actual antes de validar transiciones.
2. Validar versión (`If-Match`), estado esperado, workflow version, precondiciones, vigencia de membership y links relacionados dentro de la transacción.
3. Mutar estado y escribir audit event/outbox en una única transacción. Ante error, no hay mutación parcial ni evento de éxito.
4. Los jobs verifican de nuevo tenant, permiso de sistema limitado, version y estado; no confían en autorización pasada al encolar.
5. Reintentos usan idempotency key; evento con misma key y payload es at-most-once lógico. Key reutilizada con otro payload se rechaza.
6. Transiciones no definidas, resource mismatch, conflict y stale version devuelven errores distinguibles para actor autorizado, sin filtrar existencia entre tenants.

## Catálogo mínimo de eventos auditables

| Familia | Eventos sugeridos |
|---|---|
| Identity/tenant | `agency.created`, `agency.suspended`, `membership.invited`, `membership.accepted`, `membership.role_changed`, `membership.revoked`, `session.revoked` |
| Client/claim | `client.created`, `client.updated`, `client.archived`, `property.created`, `policy.created`, `claim.created`, `claim.updated`, `claim.assigned`, `claim.transitioned`, `claim.closed`, `claim.reopened` |
| Operations | `task.created`, `task.assigned`, `task.status_changed`, `task.due_date_changed`, `workflow.draft_saved`, `workflow.published`, `workflow.rolled_back` |
| Documents/portal | `document.registered`, `document.scan_completed`, `document.version_added`, `document.publication_changed`, `document.download_authorized`, `portal.access_denied` |
| Finance/import | `finance.snapshot_received`, `reconciliation.created`, `reconciliation.updated`, `import.previewed`, `import.committed`, `import.failed` |
| External/AI | `delivery.drafted`, `delivery.approved`, `delivery.blocked`, `delivery.sent`, `delivery.failed`, `ai.requested`, `ai.reviewed`, `ai.rejected` |
| Security/admin | `authorization.denied`, `support_grant.requested`, `support_grant.approved`, `support_grant.revoked`, `export.created`, `backup.completed`, `restore.completed`, `retention.executed` |

Cada evento registra actor (incluyendo service identity), tenant, object type/ID, acción, estado before/after minimizado, `occurred_at` UTC, `correlation_id`, resultado y versión de policy/workflow cuando aplique. No guardar valores de campos sensibles ni payloads íntegros.

## Preguntas de dominio abiertas

- Cuáles son las etapas oficiales por tipo/estado, quién puede diseñar workflow y qué claims conservan etapas legacy.
- Retención legal por entidad y trámite de borrado/export/corrección; manejo de legal hold y backups.
- Separación de funciones para aprobaciones, soporte superadmin y publicación de documentos.
- Reglas de expiración de sesión, invitación, vínculo externo, archivo/quarantine y link de descarga.
- Política de conciliación cuando el snapshot de origen cambie tras un match local.

Los estados son base para discusión y futura máquina de estado del servidor; el mockup no debe presentarlos como reglas configurables activas en producción.
