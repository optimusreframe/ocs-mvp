# OCS · modelo conceptual de dominio

**Estado:** borrador para arquitectura · no es un esquema físico ni una política legal aprobada.
**Principios:** tenancy desde el diseño; denegación por defecto; fuentes de verdad explícitas; auditoría sin duplicar contenido sensible; efectos externos en segundo plano, idempotentes y aprobables. Sin datos reales en la demo.

## Límites de dominio y entidades

| Dominio | Entidades conceptuales | Relaciones / invariantes | Fuente de verdad prevista |
|---|---|---|---|
| Plataforma OCS | Agency (tenant), Plan, FeatureEntitlement, PlatformUser, SupportGrant | Una agencia no se obtiene de un parámetro confiado del cliente. Superadmin no accede a expedientes por defecto. Grant temporal limitado por tenant, propósito, permisos, aprobación y expiración. | OCS para tenant/plan/concesiones. |
| Identidad y autorización | User, AgencyMembership, Role, Permission, Policy, Invitation, Session | Una persona puede tener membresías separadas. Toda lectura/escritura aplica tenant + actor + recurso + acción. Denegar por defecto; separar roles administrativos de acceso a contenido. | Identity service OCS futuro. |
| Clientes y riesgo | Customer/Policyholder, ContactMethod, Property, Policy, Carrier, AdjusterLicense | Cliente puede tener varios claims; property/policy tienen relaciones explícitas; no asumir unicidad por nombre/dirección. Licencia por estado/vigencia antes de asignar. | OCS para contactos/relaciones autorizadas; carrier catálogo puede ser referencia configurable. |
| Claims | Claim, ClaimParty, ClaimStage, ClaimType, ClaimAssignment, ClaimNote, ClaimEvent | ID estable; tenant obligatorio; varios policyholders permitidos; fechas/tipo no son clave. Cierre/reapertura son transiciones con permiso y audit log. | OCS para proceso y estado operativo. |
| Operaciones | Task, Checklist, WorkflowDefinition, WorkflowVersion, Transition, AutomationDefinition, CalendarEntry | Cada tarea pertenece a tenant y opcionalmente claim/customer; cambios de estado guardan actor y evento. Automatizaciones versionadas, desactivables y con dry-run. | OCS. |
| Expediente | Document, DocumentVersion, Template, FieldMapping, Publication, SignatureRequest | Binario separado de metadatos; versión inmutable; clasificación/visibilidad explícita. Publicación requiere autorización; URLs firmadas cortas, nunca públicas por defecto. | OCS para metadatos/publicación; storage aprobado para binarios. |
| Portal externo | PortalIdentity, PortalMembership, MitigationMembership, SharedResource | Identidad separada de membresía agencia; enlaces explícitos a claims; cada recurso se evalúa al leer. Sin acceso transversal por conocer un ID. | OCS. |
| Comunicaciones | MailboxConnection, MessageThread, Message, MatchSuggestion, CallEvent, SmsEvent, Approval, DeliveryAttempt | Mensajes entrantes y salientes inmutables; asociación sugerida no equivale a asociación confirmada. Envío externo solo por acción aprobada, con consentimiento, idempotencia y registro del resultado. | Proveedor autorizado para mensajes/eventos entregados; OCS para asociaciones y drafts. |
| Finanzas | FinanceSource, SourceSnapshot, ReconciliationAnnotation, ClaimAssociation, ReportDefinition | Registros importados/mirror de fuente externa son read-only en OCS. Anotación y asociación OCS se guardan en objetos separados, nunca se escriben al origen. Minimizar datos bancarios. | Sistema contable/Sheet autorizado sigue siendo fuente financiera. |
| Inteligencia | AIRequest, AIOutput, Citation, ReviewDecision, UsageRecord | IA no decide ni publica; salida ligada a fuentes autorizadas, revisable y con posibilidad de descartar. Datos enviados al modelo deben estar minimizados y aprobados por política. | OCS para prompts/decisiones auditables según retención aprobada; proveedor si se habilita. |
| Importación y reporting | ImportJob, ImportRowResult, SavedView, ReportRun, ExportJob | Preview/validación antes de commit; deduplicación explícita; exportación permissioned y auditada. Las vistas no elevan permisos. | OCS; cada fuente conserva sus propios datos de origen. |
| SaaS operations | AuditEvent, NotificationIntent, BackupPolicy, RetentionPolicy, BillingAccount, UsageMeter, SupportCase | Eventos append-only y minimizados. Backup/retención por tenant, restore probado y borrado verificable. Billing separado del dominio claim. | OCS/proveedor aprobado según entidad. |

## Claves y pertenencia de tenant

- Toda entidad de agencia incluye `agency_id` (o se alcanza desde un padre cuya pertenencia se valida en la misma transacción). No aceptar el tenant exclusivamente desde el body/query del navegador.
- IDs opacos no sustituyen autorización. Las consultas y mutaciones filtran tenant y autorización de recurso en servidor.
- Platform-wide entities (catálogo de planes/carriers) se distinguen de tenant-owned entities. Copiar o vincular un catálogo no concede acceso a registros de agencia.
- Membership y roles no se infieren desde email, URL o contenido de claim. Cada policy check registra actor, tenant, acción y objeto.
- Recursos externos se vinculan mediante IDs internos y scope aprobado; nunca incorporar credenciales en JS/browser storage.

## Fuentes de verdad y sincronización

1. OCS será source of truth para agency, memberships, workflow, claims, tareas, asignaciones, publicaciones y eventos propios.
2. La identidad podría ser OCS o proveedor dedicado tras decisión de arquitectura; no se elige proveedor en este documento.
3. Binarios vivirían en almacenamiento privado aprobado; OCS conserva metadata, checksum/version, permisos y referencia no pública.
4. Contabilidad/Google Sheets permanece read-only para la fuente. ReconciliationAnnotation y ClaimAssociation son extensiones locales separadas, con referencia a snapshot/source row y trazabilidad. Prohibida escritura de vuelta por defecto.
5. Gmail/Vonage/DocuSign/Resend y fuentes históricas solo pasan a ser fuentes de eventos tras autorización explícita, aprobación de scopes, sandbox y mecanismo de revocación.
6. Una sincronización debe guardar origen, instante, cursor/versión, resultado, errores, política de conflicto e idempotency key. No sobrescribir silenciosamente cambios locales.

## Clasificación de datos y manejo inicial

| Clase | Ejemplos conceptuales | Controles propuestos | Retención/borrado |
|---|---|---|---|
| Pública/configuración | Branding visible, catálogo público | Validación y ownership; versionado de configuración. | Política comercial pendiente. |
| Operativa interna | etapas, tareas, asignaciones, vistas, auditoría | RBAC, tenant filter, cifrado tránsito/reposo, logs de acceso. | Por definir por contrato y obligación. |
| PII | nombres, email, teléfonos, direcciones, policyholder | Minimización, cifrado, restricciones de export, acceso auditado, enmascarado en logs. | Acceso, corrección, exportación y borrado sujetos a validación legal. |
| Expediente sensible | claims, notas, imágenes, documentos, firmas, comunicaciones | Storage privado, permisos por objeto, análisis de archivo, versionado, publicación explícita, URLs breves. | Retención legal/contractual pendiente; legal hold si se aprueba. |
| Financiera de alto riesgo | montos, cheques, cuentas/datos bancarios, transacciones | No ingerir datos bancarios innecesarios; roles estrictos, masking y export controlado. Demo sin datos reales. | Reglas regulatorias/contables pendientes. |
| Secretos/credenciales | tokens, claves, OAuth refresh tokens | Secret manager del servidor; rotación/revocación; nunca frontend, Git o logs. | Revocar al desconectar; auditoría sin exponer el valor. |
| IA derivada | prompts, respuestas, embeddings/citas | Minimización, scope de origen, revisión humana, retención controlada, evaluación de fuga. | Deshabilitada hasta aprobación de modelo/proveedor y política. |

El borrado debe contemplar cascada lógica, copias y backups, proveedor externo, expiración y evidencia; la política concreta queda abierta hasta revisión legal y contractual. La demo usa fixtures ficticios y no es almacén apto para PII.

## Permisos iniciales propuestos (a ratificar)

| Actor | Alcance base | Límites explícitos |
|---|---|---|
| Agency Admin | configuración, membresías, roles, registros de tenant según permiso | no ve datos de otras agencias; export/admin sensible auditado. |
| Adjuster | claims asignados o alcance de equipo concedido; tareas y documentos necesarios | licencia/estado; publicación externa requiere permiso separado. |
| Assistant | claims/tareas operativas conforme a policy de agencia | no asumir permisos financieros, firma, export o administración. |
| Accounting | reportes/conciliación y datos financieros autorizados | mirror read-only; no editar fuente contable ni expediente completo por defecto. |
| Customer / policyholder | claims vinculados y recursos publicados | sin notas internas, borradores, documentos no publicados ni otros clientes. |
| Mitigation partner | recursos expresamente compartidos para claims vinculados | read-only por defecto; aislamiento de otras compañías y expedientes. |
| OCS Superadmin | ciclo de vida comercial y salud SaaS no contenido | sin acceso a claims/docs/emails; excepción solo mediante concesión aprobada, temporal y auditada. |

Permisos son capacidades verificadas en backend. Ocultar botones no es control de seguridad. Se requiere autorización a nivel de endpoint, query, objeto, campo y operación de storage.

## Estados, eventos y auditoría

- Claim y workflow: transiciones declarativas/versionadas; validar estado actual, actor y precondiciones al confirmar.
- Task/document/publication/invitation/approval/import/communication tienen estados explícitos; cambios inválidos no dejan mutación parcial.
- `AuditEvent` mínimo: `event_id`, `agency_id`, `actor_id` (o actor de sistema), tipo, objeto/tipo/ID, timestamp UTC, resultado, request/correlation ID y diff minimizado.
- No registrar contenido de documento, token, datos bancarios, cuerpo completo de mensajes ni prompt sensible en logs por defecto.
- Notificaciones y efectos externos se representan como intents; worker procesa con idempotencia, reintentos limitados, dead-letter y estado visible. En fase demo solo se simulan.

## Preguntas de arquitectura / gate

- Región y jurisdicciones de operación, obligación de residencia, retención y respuesta a incidentes.
- Modelo de aislamiento tenant (row-level vs schema/database) según riesgo, escala, proveedor y pruebas.
- Proveedor de identidad/MFA/SSO, recuperación, invitaciones y sesiones de portal.
- DB, object storage, cifrado/llaves, backups, restore, jobs/queue, observabilidad y costo total.
- Reglas legales de retención de expedientes y firmas; derechos de policyholders; roles definitivos.
- Si/o cuándo se habilitan proveedores de email, SMS, calendario, pagos e IA; consentimiento y proceso de aprobación.

Estas preguntas son entradas de Fase 2, no permiso para crear cuentas o enviar datos. Antes de elegir servicios: threat model, ADR, presupuesto, responsables y aprobación de negocio/seguridad.
