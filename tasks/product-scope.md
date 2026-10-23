# OCS · propuesta de alcance del primer release

**Estado:** borrador de trabajo · requiere revisión de negocio y operaciones.
**Fuente:** grupos y módulos del handoff OCS (sección 4); límites de demo y no escritura indicados en sus secciones 2, 12 y 13; inventario visible del MVP.
**Regla:** se conservan los siete grupos y sus 40 destinos. “Después” significa fase posterior del roadmap, no eliminación. “Gated” significa que solo se habilita tras aprobación, sandbox y criterios de seguridad. Las prioridades siguientes son propuestas, no alcance firmado.

## Matriz de cobertura de navegación (40/40)

| # | Grupo | Destino visible | Vista / dominio | Propuesta | Alcance inicial y criterio observable |
|---:|---|---|---|---|---|
| 1 | Inicio | Dashboard de agencia | Dashboard | Release 1 | Indicadores derivados de claims/tareas accesibles; estados de carga, vacío y error. |
| 2 | Inicio | Bandeja de prioridades | Prioridades | Release 1 | Ordenar y filtrar pendientes por urgencia, vencimiento y responsable; abrir el registro fuente. |
| 3 | Inicio | Actividad reciente | Auditoría | Release 1 | Timeline de eventos autorizados con actor, hora, tipo y enlace al registro. |
| 4 | Claims y clientes | Claims / cartera | Claim | Release 1 | Buscar, filtrar, ordenar, paginar, crear, editar, ver, asignar y cerrar claims. |
| 5 | Claims y clientes | Detalle de claim | Claim | Release 1 | Identidad estable, etapa, partes, propiedad/póliza, tareas, documentos, timeline y permisos. |
| 6 | Claims y clientes | Archivo de claims cerrados | Claim | Release 1 | Buscar y consultar; reabrir solo con permiso y evento auditado. |
| 7 | Claims y clientes | Perfil 360 de cliente | Cliente / policyholder | Release 1 | Contactos ficticios de entorno autorizado; claims relacionados y datos compartidos por política. |
| 8 | Claims y clientes | Base de datos configurable | Vistas y campos | Release 1 | Tabla con filtros, orden, columnas y vistas guardadas; permisos sobre campos/filas en backend. |
| 9 | Claims y clientes | Propiedades, pólizas y carriers | Property / Policy | Release 1 | Crear y vincular registros con validación, historial y acceso por tenant. |
| 10 | Operaciones | Tareas / To-dos | Task | Release 1 | Crear, asignar, priorizar, fechar, completar y consultar actividad. |
| 11 | Operaciones | Tablero Kanban | Task / board | Release 1 | Cambios de etapa con regla de permiso, persistencia y evento de auditoría. |
| 12 | Operaciones | Workflow / process builder | Workflow | Release 1 básico | Configurar etapas y transiciones; validar que los cambios no rompan claims activos. |
| 13 | Operaciones | Reglas y automatizaciones | Automation | Después | Builder versionado, dry-run, límites, explicación y revisión antes de activar. |
| 14 | Operaciones | Calendario y recordatorios | Calendar / reminder | Release 1 | Vistas calendario/lista de tareas; recordatorios internos; sin envío externo inicial. |
| 15 | Comunicaciones | Email workspace | Email thread | Después + gated | Bandeja con drafts/matching; conexión real y envío solo tras aprobación de proveedor y sandbox. |
| 16 | Comunicaciones | Otros emails sin relación | Unmatched email | Después + gated | Cola de sugerencias con asociación manual auditada; sin leer buzones reales ahora. |
| 17 | Comunicaciones | Llamadas y SMS | Communication event | Después + gated | Registro/drafts locales; llamada/SMS real requiere proveedor aprobado y consentimiento. |
| 18 | Comunicaciones | Aprobaciones externas | Approval | Después + gated | Solicitudes, estados y evidencia; firma externa/native solo cuando esté aprobada. |
| 19 | Comunicaciones | Soporte y handoff | Support case | Después | Crear ticket, asignar owner, comentarios internos y resolución auditada. |
| 20 | Expedientes y portales | Documentos por claim | Document / version | Release 1 básico | Metadatos, versiones y clasificación; carga y descarga seguras al existir storage real. |
| 21 | Expedientes y portales | Templates y mapeo PDF | Template / mapping | Release 1 básico | Campos, mapeo y vista previa con datos sintéticos; control de versión y validación. |
| 22 | Expedientes y portales | Firmas electrónicas demo | Signature request | Después + gated | Estado de solicitud y evidencia simulada; firma legal requiere proveedor y revisión legal. |
| 23 | Expedientes y portales | Portal del cliente | Portal membership / publication | Release 1 básico | Cliente ve solo claims y documentos publicados para él; autenticación real obligatoria antes de pilot. |
| 24 | Expedientes y portales | Portal mitigation partner | External membership | Después | Acceso aislado a claims vinculados y contenido expresamente compartido; lectura por defecto. |
| 25 | Finanzas e inteligencia | Mirror contable · Dashboard | Finance mirror | Solo lectura | Resumen de fuente contable; reconciliación local OCS sin cambiar el sistema de origen. |
| 26 | Finanzas e inteligencia | Leads | Finance/source mirror | Solo lectura | Lectura autorizada de fuente; anotaciones/asociaciones OCS separadas de la fuente. |
| 27 | Finanzas e inteligencia | Transactions | Finance/source mirror | Solo lectura | Nunca editar origen; conciliación local versionada, actor/fecha y enlace opcional a claim. |
| 28 | Finanzas e inteligencia | Gastos | Finance/source mirror | Solo lectura | Mostrar datos minimizados y solo a roles autorizados; sin almacenar datos bancarios innecesarios. |
| 29 | Finanzas e inteligencia | Entradas | Finance/source mirror | Solo lectura | Mismo contrato de lectura y anotaciones locales; fuente de verdad contable externa. |
| 30 | Finanzas e inteligencia | Reportes y KPIs | Reporting | Release 1 básico | Consultas derivadas de datos OCS autorizados; exportación con permiso/auditoría. |
| 31 | Finanzas e inteligencia | OCS Intelligence / AI | AI invocation | Después + gated | Sugerencias con fuente/citas internas, redacción revisable y logging; no decisiones automáticas. |
| 32 | Configuración y administración | Usuarios, roles y permisos | Identity / policy | Release 1 | Alta/invitación, membresía y permisos por tenant con denegación por defecto. |
| 33 | Configuración y administración | Branding de agencia y portal | Tenant settings | Release 1 | Nombre/logo/colores; validar dominios y evitar fuga entre tenants. |
| 34 | Configuración y administración | Integraciones simuladas | Provider connection | Después + gated | Estado visual en demo; secretos en vault backend, scopes mínimos y desconexión auditada en producción. |
| 35 | Configuración y administración | Centro de importación | Import job | Después | Preview, validación, deduplicación, errores descargables y commit con permisos/auditoría. |
| 36 | Configuración y administración | Configuración offline | Offline queue | Después | Cola local protegida, conflictos y expiración; no cachear PII sensible sin análisis/consentimiento. |
| 37 | Configuración y administración | Backups y retención | Backup policy | Después | Política por tenant, retención y borrado verificable; restore probado antes de live. |
| 38 | Configuración y administración | Acceso temporal superadmin | Privileged grant | Después + gated | Alcance/razón/duración/aprobación, separación de funciones, alerta y revocación automática. |
| 39 | Configuración y administración | Superadmin OCS / agencias | SaaS administration | Después | Gestión comercial/estado/planes sin acceso a claims por defecto; soporte mediante concesión temporal. |
| 40 | Configuración y administración | Billing y créditos IA demo | Billing / usage | Después + gated | Métricas y límites; cobro real requiere decisión comercial, proveedor y controles financieros. |

## Recorrido vertical propuesto para el primer release

1. Admin crea tenant/agencia y configura branding; invita al equipo con roles mínimos.
2. Assistant o Adjuster registra policyholder, propiedad, póliza y carrier ficticios o autorizados.
3. Crea claim con ID estable, tipo/fecha de pérdida, licencia/estado y etapa inicial; valida campos obligatorios.
4. Asigna responsable y tareas; cambios de estado generan auditoría y actualizan prioridades/dashboard.
5. Añade documento/version y clasifica visibilidad como interno o publicable; la publicación requiere permiso y confirmación.
6. Policyholder autenticado consulta únicamente el claim vinculado y los documentos expresamente publicados.
7. Cierre deja historial consultable; toda modificación relevante se rastrea con actor y timestamp.

### Criterios E2E iniciales

- **Positivo:** usuario autorizado crea claim y tarea, adjunta metadatos de documento, publica un documento demo y el usuario cliente autorizado ve únicamente ese contenido.
- **Negativo:** usuario de otra agencia, cliente no vinculado o rol sin permiso recibe denegación; no se filtra existencia ni contenido del expediente.
- **Estado/concurrencia:** transición inválida, edición concurrente, campo obligatorio ausente o documento no publicable produce error accionable sin mutación parcial.
- **Auditoría:** creación, actualización, asociación, publicación, transición, permiso denegado y cierre registran actor, tenant, objeto, acción, hora y resultado, sin duplicar contenido sensible en logs.
- **Datos y entorno:** staging/piloto usa datos sintéticos o autorizados expresamente. La demo pública nunca recoge datos reales.
- **Portal:** identidad independiente por policyholder; dos policyholders pueden compartir un claim únicamente mediante vínculo explícito y ambos ven su propio nombre.

## Decisiones que requieren aprobación

- Aprobación de Release 1 y las prioridades propuestas para cada módulo.
- Roles definitivos, restricciones por usuario, alcance de soporte/superadmin y proceso de concesión temporal.
- Campos requeridos, etapas, reglas, documentos legales, publicación al cliente y retención/borrado.
- Fuente contable, acceso de lectura, sincronización permitida, minimización y anotaciones locales.
- Región, residencia de datos, obligaciones regulatorias, seguros, contratos y política de incidentes.
- Proveedores, presupuesto, dominios, consentimientos y aprobaciones para email/SMS/firma/IA/pagos.

Hasta aprobarse, los puntos anteriores son preguntas abiertas; no habilitan cuentas, gastos, conexiones, mensajes ni tratamiento de datos reales.
