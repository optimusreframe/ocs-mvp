# OCS · acceptance pack del primer vertical slice

**Estado:** borrador automatizable · depende de aprobar scope, actores y policies. Estas son pruebas futuras, no resultados de ejecución.
**Contrato asociado:** [`../contracts/ocs-core-api-draft.yaml`](../contracts/ocs-core-api-draft.yaml).
**Fixtures:** `agency-A`, `agency-B`, `admin-A`, `adjuster-A`, `assistant-A`, `accounting-A`, `customer-A`, `customer-B`, `mitigation-A`, `superadmin`, cada cual con IDs reservados de fixture. Ningún dato de persona real.

## Core: pertenencia y autorización

### AC-01 · Cadena válida de claim

**Given** una membresía activa autorizada en Agency A y un cliente, propiedad, póliza y miembro existentes en A
**When** el actor crea un claim y lo asigna a un miembro activo permitido
**Then** OCS genera un ID estable, fase/status iniciales desde workflow publicado, devuelve ETag, guarda las relaciones y registra `claim.created` + `claim.assigned` en la misma unidad de trabajo.

### AC-02 · Relación cruzada no válida

**Given** propiedad en A y cliente o póliza en B (u otro tenant)
**When** un actor de A intenta crear el claim con esos IDs
**Then** se deniega sin crear claim, no se revela metadata del objeto B y se registra un evento minimizado de denegación.

### AC-03 · Tenant derivado del actor

**Given** actor autenticado de A
**When** el request intenta incluir o cambiar `agencyId` en body, query, header o campo patch
**Then** el campo se ignora solo si el contrato lo declara expresamente; de otro modo se rechaza. Ninguna operación muta B.

### AC-04 · Acceso de rol insuficiente

**Given** Assistant sin capacidad de publicar documentos
**When** solicita `PUT /claims/{claimId}/documents/{documentId}/publication`
**Then** recibe 403/404 según política anti-enumeración; el ETag, visibilidad y portal no cambian.

## Claims y concurrencia

### AC-05 · Transición permitida

**Given** Claim en stage publicado y sus precondiciones satisfechas
**When** actor con permiso solicita `transitionKey` permitido y `If-Match` vigente
**Then** cambia el estado/version, registra actor + from/to + motivo minimizado, y dashboard/timeline leen el estado persistido.

### AC-06 · Transición no permitida / precondición faltante

**Given** Claim sin documento obligatorio o transición no definida
**When** actor solicita avanzar
**Then** retorna 409/422 con razón accionable, sin cambios parciales ni eventos de éxito.

### AC-07 · Edición obsoleta

**Given** dos actores leyeron el mismo ETag
**When** ambos hacen cambios y la primera mutación ya avanzó la versión
**Then** la segunda recibe 412, conserva el estado vigente y puede recargar/reaplicar cambios conscientemente.

### AC-08 · Repetición idempotente

**Given** una llamada `POST` exitosa con `Idempotency-Key`
**When** se reintenta la misma operación y payload por timeout
**Then** retorna el mismo resultado lógico sin duplicar claim, tarea, asignación, publication ni audit success. Misma key con payload distinto da conflicto.

## Documento y portal

### AC-09 · Registro privado por defecto

**Given** un documento con clasificación internal
**When** se registra en el claim
**Then** su visibilidad efectiva queda internal, no aparece en rutas de portal, index público, email ni URL anónima.

### AC-10 · Publicación solo al policyholder vinculado

**Given** Customer A está explícitamente vinculado al claim y documento está clasificado como publicable
**When** usuario autorizado publica el documento para A
**Then** se registra actor, destinatario, versión, timestamp y acción; Customer A puede ver su proyección mínima tras autenticarse.

### AC-11 · Policyholder no vinculado / publicación revocada

**Given** Customer B no está vinculado o la publication fue revocada
**When** intenta enumerar, abrir, descargar o reusar URL/link viejo
**Then** la API no expone contenido/metadata y el enlace previo no concede acceso.

### AC-12 · Integridad de archivo (cuando upload/storage se implemente)

**Given** binario en quarantine, tipo/magic bytes no coincidente o resultado de scan pendiente
**When** se registra o solicita acceso
**Then** no se libera al portal ni se ofrece para descargar; hay estado de scan visible para staff y error/rehacer sin bypass.

## Datos, auditoría y operación

### AC-13 · Auditoría minimizada

**When** se crea/actualiza/asigna/transiciona/publica/deniega una acción sensible
**Then** el evento guarda tenant, actor, objeto, acción, resultado, timestamp y correlation ID; no incluye password/token, contenido completo, datos bancarios o binario.

### AC-14 · Error no filtra objeto inaccesible

**Given** un UUID inexistente y uno que existe en otro tenant
**When** el mismo actor solicita ambos
**Then** respuesta, tamaño y comportamiento observable no confirman existencia fuera de alcance; diagnósticos sensibles solo están en log restringido.

### AC-15 · Fuente contable inmutable

**Given** registro de mirror contable y usuario Accounting
**When** crea/edita anotación o asociación a claim
**Then** solo cambia entidad OCS local, conserva referencia al snapshot y versión de origen, y no existe llamada de escritura a la fuente externa.

### AC-16 · Entorno sin efecto externo

**Given** staging/test sin proveedor y sin destinatario allowlisted
**When** un actor intenta enviar email/SMS, firma, pago o notificación
**Then** operación queda como draft/intent bloqueado con motivo; no se invoca red externa ni hay secreto live disponible.

## Evidencia obligatoria en staging

- API contract tests sobre los endpoints involucrados; migration tests y tests transaccionales del camino válido y fallido.
- Pruebas negativas independientes para tenant, rol, objeto, campo, portal y acceso a archivos; revisar queries/export/jobs además del endpoint de detalle.
- E2E de adjuster y policyholder con sesiones separadas en navegador; tomar evidencia de respuesta y UI sin datos reales.
- Repetición concurrency/idempotency y revisión de eventos de auditoría con payload redactado.
- Registro de comando, commit, ambiente, versión, fixture, resultado, defectos, owner y limitación. Green check sin alcance descrito no cuenta.

## Límites actuales

No existe API, auth, base de datos, storage, tenant isolation ni test harness de backend. Este pack no es prueba pasada; se ejecutará una vez aprobados architecture ADRs y construido el core seguro.
