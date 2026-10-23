# OCS · matriz de permisos propuesta

**Estado:** propuesta para validación de negocio, seguridad y operaciones. No activa permisos en la demo ni constituye configuración de una API.
**Default:** denegar. Toda acción exige actor autenticado, tenant válido, permiso explícito, relación del recurso y estado permitido. Los checks ocurren en servidor a nivel endpoint, consulta, objeto, campo y archivo.

## Notación

- **A**: permitir dentro del tenant y conforme a policy.
- **R**: lectura del alcance propio/asignado.
- **S**: lectura únicamente de recursos explícitamente compartidos.
- **P**: solo contenido marcado/público para ese actor.
- **—**: denegar por defecto.
- **A¹**: acceso de administración, no otorga automáticamente lectura de expediente sensible.
- **A²**: operación sensible exige permiso separado, motivo y auditoría; algunos casos además requieren aprobación.

## Capacidades por objeto

| Objeto / acción | Agency Admin | Adjuster | Assistant | Accounting | Customer | Mitigation | OCS Superadmin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Agency profile / branding · ver/editar | A¹ | R | R | R | P | — | A¹ (sin expediente) |
| Membresías · ver | A¹ | — | — | — | — | — | metadatos limitados |
| Invitar/revocar miembros | A¹ | — | — | — | — | — | — |
| Roles/policies · configurar | A¹ | — | — | — | — | — | — |
| Cliente · ver | A | R | R | campos autorizados | P propio | S mínimo | — |
| Cliente · crear/editar | A | A | A (campos permitidos) | — | — | — | — |
| Propiedad/póliza/carrier · ver | A | R | R | campos autorizados | P propio/minimizado | S si compartido | — |
| Propiedad/póliza · crear/editar | A | A | A (campos permitidos) | — | — | — | — |
| Claim · ver resumen | A | R | R | — | P vínculo activo | S vínculo activo | — |
| Claim · ver datos sensibles/notas internas | A² | R alcance asignado | R por campo/alcance | — | — | — | — |
| Claim · crear/editar | A | A | A por policy | — | — | — | — |
| Claim · asignar/cambiar etapa/cerrar | A² | A asignado | A por policy | — | — | — | — |
| Task · ver/crear/editar | A | A alcance | A alcance | — | — | — | — |
| Workflow · configurar/publicar versión | A¹ | — | — | — | — | — | — |
| Documento interno · leer/descargar | A² | R necesidad | R necesidad | — | — | — | — |
| Documento · registrar nueva versión | A | A | A por policy | — | — | — | — |
| Documento · publicar/revocar al cliente | A² | A² | A² solo si delegada | — | — | — | — |
| Documento publicado · ver/descargar | A | A | A | — | P vínculo activo | S si compartido | — |
| Documento · borrar/retener/expurgar | A² y proceso legal | — | — | — | — | — | — |
| Finance mirror · leer | permiso financiero separado | — | — | A | — | — | — |
| ReconciliationAnnotation · crear/editar | A | — | — | A | — | — | — |
| Fuente contable · mutar registros | — | — | — | — | — | — | — |
| Exportar datos del tenant | A² | permiso separado | — | A² alcance financiero | — | — | — |
| Integraciones/credenciales · administrar | A² | — | — | — | — | — | — |
| Soporte SaaS · metadatos técnicos | — | — | — | — | — | — | A¹ minimizado |
| Concesión temporal a expediente | puede solicitar/aprobar según separación de funciones | — | — | — | — | — | solo tras grant aprobado |
| Billing/licencias de agencia | lectura | — | — | — | — | — | A¹ |

## Reglas que no se deben inferir del rol

1. **Agencia/tenant:** todas las operaciones de negocio se acotan al tenant efectivo de la membresía autenticada. Un ID enviado por el cliente nunca selecciona por sí solo la agencia.
2. **Scope del claim:** la agencia define si Adjuster/Assistant ve todos los claims o solo asignados; el handoff expresa el valor inicial como configurable. Propuesta inicial: Admin gestiona la agencia; Adjuster ve asignados/equipo concedido; Assistant sigue scope definido por Admin.
3. **Campos:** permiso sobre claim no significa permiso sobre toda nota, documento, dato financiero o contacto. Aplicar minimización de campos.
4. **Portal:** Customer requiere identidad verificada y relación explícita. Mitigation requiere membresía externa y recurso compartido a su compañía. Cada consulta vuelve a comprobar vínculo y publicación vigentes.
5. **Admin:** configuración y membresías no equivalen a acceso general al contenido de claims. El proceso de emergencia/support grant debe separar solicitud y aprobación, acotar recursos/acciones, razón, expiración, aviso y auditoría.
6. **Efectos externos:** enviar, firmar, pagar, notificar o invocar IA son capabilities separadas de leer/editar un registro. Requieren gate, consentimiento y controles definidos por módulo.
7. **Denegación:** recurso inexistente y recurso fuera de alcance devuelven respuesta indistinguible cuando revelar existencia puede filtrar información. Nunca incluir PII o contenido sensible en logs de denegación.

## Decisiones que necesitan ratificación

- ¿Admin de agencia puede leer todos los expedientes por defecto o también debe recibir scope explícito?
- ¿Adjuster/Assistant comienzan con todos los claims de agencia como permite el handoff, o se limita a asignados/equipo?
- ¿Qué campos y reportes financieros ve Accounting y qué roles alternos pueden recibir ese permiso?
- ¿Quién puede publicar documentos al portal, enviar comunicaciones, exportar datos o reabrir/cerrar claims?
- ¿Qué procedimiento de doble aprobación y notificación gobierna el acceso superadmin temporal?
- ¿Qué acciones deben admitir corrección/borrado y cuáles requieren retención legal o aprobación de compliance?

Hasta ratificación, la matriz es un diseño por defecto restrictivo, no una regla comercial definitiva ni sustituto de pruebas de autorización.
