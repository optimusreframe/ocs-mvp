# OCS · modelo de amenazas inicial

**Estado:** borrador proveedor-neutral · la revisión formal de seguridad y aprobación de riesgos siguen pendientes.
**Alcance:** primer journey agencia → usuario → cliente/propiedad/póliza → claim → tarea → documento → portal → auditoría, con módulos futuros de comunicación, importación e IA. La demo pública no procesa información real y no forma parte del perímetro de producción.

## Activos y límites de confianza

| Activo | Clasificación | Límite que debe protegerlo |
|---|---|---|
| Sesión, identidad, MFA y membresías | Credenciales / seguridad | navegador ↔ proveedor de identidad ↔ API; nunca confiar en role/tenant del cliente. |
| Registros de cliente, póliza y claim | PII / expediente | aislamiento de tenant y autorización de recurso/campo en API y reportes. |
| Documento binario, metadata y versiones | Expediente sensible | API ↔ storage privado; autorización comprobada antes de emitir acceso corto a objeto. |
| Publicación al portal | Divulgación externa | operación explícita actor/permiso/propietario/destinatario, estado y auditoría. |
| Datos contables externos | Financiera sensible | fuente de origen read-only; anotaciones OCS aisladas por referencia. |
| Secretos de proveedores | Secreto | backend ↔ secret manager/proveedor; no incluir en frontend, URL, build ni log. |
| Eventos de auditoría | Evidencia operativa | servidor/job ↔ almacén de eventos con acceso restringido y protección contra alteración. |
| Prompts/respuestas IA | Derivado de datos sensibles | solo servicio aprobado y datos permitidos; salida como sugerencia no confiable. |
| Importaciones y exportaciones | PII/documentos | archivo ↔ zona de cuarentena ↔ parser ↔ tenant; preview antes de commit. |

**Actores:** Admin, Adjuster, Assistant, Accounting, Customer, Mitigation partner, OCS Superadmin, atacante externo, usuario interno malicioso/comprometido, worker, proveedor externo. Los permisos propuestos están en [`permission-matrix.md`](./permission-matrix.md).

## Amenazas, mitigaciones y evidencia de salida

| ID | Amenaza / abuso | Riesgo inicial | Controles requeridos | Prueba de aceptación requerida |
|---|---|---:|---|---|
| T-01 | IDOR / cambiar `claimId`, `clientId` o `documentId` revela recurso de otro tenant | Crítico | `agency_id` derivado de sesión/membership en servidor; scope en toda query/objeto; 404 indistinguible fuera de scope; RLS o control equivalente con defensa de aplicación. | Tenant A intenta GET/PATCH/transition/document/publication sobre ID de tenant B; no hay lectura, mutación ni side-channel de existencia. |
| T-02 | Usuario revocado conserva acceso por sesión/cache/offline | Alto | revocación inmediata o TTL corto con check de membership; invalidación de sesiones; offline restringido por amenaza; revalidar al sincronizar. | Revocar membership y reusar sesión/token/cache antes y después del TTL; API deniega y no sincroniza cambios. |
| T-03 | Escalada de privilegio al editar role, `agency_id`, owner o campos hidden | Crítico | allowlist de campos por operación; rol sólo cambia por endpoint privilegiado; policy en server; no mass assignment. | Actor modifica request para añadir role, tenant, `visibility=customer` o billing; se rechaza sin mutación. |
| T-04 | Admin de agencia o superadmin inspecciona expediente sin autorización | Alto | permisos separados para configuración y datos; superadmin sin scope de claim; grant JIT temporal con razón, aprobación independiente, mínimo alcance, caducidad y alerta. | Verificar denegación por defecto; grant vencido/revocado falla y toda excepción queda en audit. |
| T-05 | Customer/mitigation accede a claim relacionado indirectamente o a notas internas | Crítico | identidad externa explícita y vínculo activo por claim/objeto; proyección de campos permitidos; no usar agency-wide access. | Cliente A prueba IDs de cliente B, claim compartido no vinculado, notas y documentos internos; sólo ve recursos publicados y vinculados. |
| T-06 | Documento interno publicado por error, URL pública o firma/preview reutilizable | Crítico | publicación separada de upload; autorización + destinatario + confirmación; revocar; enlaces breves y no enumerables; storage privado; antimalware/quarantine. | Link expirado/revocado/reenviado no descarga; document no publicado nunca aparece en portal, búsqueda, notificación ni preview. |
| T-07 | Actualización concurrente sobrescribe transición o permiso recién revocado | Alto | ETag/version optimistic lock; transacción; revalidar policy y precondiciones al commit; rollback completo. | Dos ediciones concurrentes, stale `If-Match`, y revoke durante edición: conflicto controlado, sin parcialidad. |
| T-08 | Repetición de request crea duplicados o reenvía mensaje/publicación | Alto | idempotency key asociada al actor/tenant/operación y hash de request; transactional outbox para efectos; replay guard. | Repetir mismo request retorna el resultado idempotente; misma key con cuerpo distinto da conflicto; un solo evento externo. |
| T-09 | CSV/XLSX/PDF malicioso explota parser, macro o fórmulas | Alto | cuarentena, límites, MIME real, antivirus, parsing aislado, protección XXE/ZIP bombs, escapar export CSV, no ejecutar macros/fórmulas. | Fixtures benignas y archivos adversariales quedan bloqueados/escapados; sin ejecutar contenido ni consumir recursos ilimitados. |
| T-10 | Datos bancarios/PII quedan en logs, analytics, prompt, error o backup sin control | Crítico | minimización, redacción de logs, scopes de analytics/IA, cifrado, retención y eliminación aprobadas, acceso auditado. | Canary data en requests produce logs/traces sin secretos ni PII; verificar lifecycle en backup y export. |
| T-11 | Prompt injection o permiso excesivo permite a IA revelar datos ajenos o ejecutar acción | Alto | no usar IA como autoridad; retrieval tenant-scoped y ACL-aware; salida estructurada no confiable; revisión humana; kill switch y budget. | Documento malicioso solicita secretos, tenant cruzado y acción; no revela datos ni ejecuta llamada/publicación. |
| T-12 | Webhook falso/replay provoca estado falso o acción repetida | Alto | firma HMAC/llave rotada, timestamp/nonce, replay window, allowlist donde aplique, idempotencia, validación de evento/estado. | Firma inválida, timestamp viejo, duplicate event y tenant inconsistente no mutan estado. |
| T-13 | Exfiltración por export/reportes, filtro o vista guardada | Alto | permisos aplicados antes de agregación; limitar columnas/filas; export por tarea con ACL/revocación, watermark/registro y rate limit. | Un usuario con vista guardada ajena o filtro manipulado no amplía alcance; export queda dentro del scope. |
| T-14 | Fuerza bruta, enumeration y abuso de login/invitación/portal | Alto | MFA según riesgo; throttling, protección contra credential stuffing, expiración de invitación, mensajes no enumerables, rate limit y alertas. | Ráfagas/login inválido no enumeran usuarios ni evaden límites por IP/identidad. |
| T-15 | Borrado, backup o restore cruza tenant o recupera dato ya borrado | Alto | borrado/retención con policy aprobada, tombstones, backups cifrados e isolated, restore a entorno restringido y re-aplicar borrados. | Restore drill comprueba pertenencia de tenant y eliminación conforme a policy; resultados firmados y tiempos medidos. |
| T-16 | Cambios en configuración de workflow alteran claims históricos | Alto | workflow versionado, draft/publish separado, claims fijados a versión o migración explícita, rollback y preview. | Publicar nueva versión no cambia silenciosamente workflow activo de claims existentes. |
| T-17 | Efectos reales salen desde demo, staging o test accidentalmente | Crítico | secretos separados por entorno; allowlist de destinatarios/sandbox; production gates/feature flags; bloquear en client; audit y kill switch. | Automatización verifica staging sin credenciales live; intento de send real es rechazado y visible. |

## Reglas transversales de diseño

- API resuelve actor y tenant desde una sesión verificada, comprueba estado actual de membership y aplica autorización en cada request.
- Operaciones de negocio y `AuditEvent` se confirman atómicamente. Una denegación o validación fallida no deja mutación parcial.
- No confiar en UI, campos ocultos, UUID difícil de adivinar, origen del frontend ni el filtro de una vista como controles de seguridad.
- Las rutas de storage, exportación, búsqueda, reportes, previews, jobs y webhooks deben aplicar la misma política que el detalle del registro.
- Comunicaciones, pagos, firmas, IA y notificaciones son capabilities separadas. Crear draft ≠ autorizar efecto externo.
- Fallos cerrados ante proveedor caído, configuración ambigua, tenant ausente, versión obsoleta, permiso no resuelto o archivo sin escaneo.
- Security logging captura quién/qué/cuándo/resultado/correlation ID con valores minimizados; nunca token, contenido completo, datos bancarios ni binarios.

## Gates de seguridad antes de producción

1. Revisar y aprobar owners, alcance, clasificación/retención, modelo de superadmin y residencia/jurisdicción.
2. Elegir tenancy e identidad por ADR; documentar threat model y revisión independiente.
3. Tests automatizados negativos para T-01 a T-07 antes del piloto; contract/integration tests para T-08 a T-17 según módulos activados.
4. SAST/dependency/secrets scan, DAST autorizado, pruebas de autorización y revisión de almacenamiento/export antes de staging.
5. Evidencia reproducible de restore, revocación, rollback, alertas e incident runbook; ningún riesgo crítico sin owner y tratamiento aprobado.

Este documento prioriza amenazas previsibles; no es certificación, pentest ni sustituto de asesoría legal/seguridad independiente.
