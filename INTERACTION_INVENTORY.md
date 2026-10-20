# Inventario de controles del FULL DEMO

Inventario del prototipo, complementado con recorrido en navegador. Los recuentos de la tabla corresponden al markup base; en runtime se agregan paneles/formularios CRUD, acciones de fila y preferencias. Email, SMS, llamadas, firmas, pagos, IA, importación, integraciones y respaldo son simulaciones locales. Ningún control habilita conexiones externas. Los controles que no representan entidades editables muestran una respuesta contextual persistida localmente o se presentan como información de solo lectura.

## Cobertura

- Vistas navegables: **30** (pantalla inicial `create-agency` + 29 vistas del mockup).
- Controles visibles en el markup de vistas: **556** contando por categoría (botones, inputs, selects, pestañas, links, etc.).
- Botones en pantallas: **218** (285 incluyendo navegación y shell). Todos están enlazados a navegación, acción local explícita o manejador de acción demo delegado; ver este inventario para recuento por pantalla.
- Campos `input`: **25** en pantallas (incluye el selector global de rol fuera del conteo por pantalla); `select`: **18**; `textarea`: **4**.
- Sin anclas `<a>` en el prototipo; los destinos se implementan con botones de navegación accesibles.

| Pantalla | Botón | input | select | textarea | pestañas | acciones de ruta | acciones con `data-action` | manejador local genérico |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `create-agency` | 2 | 12 | 2 | 0 | 0 | 0 | 1 | 1 |
| `dashboard` | 8 | 0 | 0 | 0 | 4 | 6 | 2 | 0 |
| `claims` | 11 | 0 | 1 | 0 | 6 | 1 | 1 | 9 |
| `claim` | 13 | 6 | 0 | 0 | 8 | 7 | 2 | 4 |
| `workflows` | 3 | 2 | 3 | 0 | 0 | 0 | 1 | 2 |
| `tasks` | 10 | 0 | 0 | 0 | 5 | 0 | 4 | 6 |
| `email` | 9 | 0 | 0 | 1 | 0 | 2 | 2 | 5 |
| `approvals` | 4 | 2 | 3 | 1 | 0 | 0 | 1 | 3 |
| `documents` | 12 | 0 | 0 | 0 | 5 | 0 | 3 | 9 |
| `ai` | 5 | 0 | 0 | 1 | 0 | 1 | 0 | 4 |
| `portal` | 13 | 0 | 0 | 0 | 0 | 0 | 0 | 13 |
| `mitigation` | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 3 |
| `accounting` | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 5 |
| `templates` | 7 | 0 | 7 | 0 | 0 | 0 | 1 | 6 |
| `calendar` | 6 | 0 | 0 | 0 | 0 | 0 | 1 | 5 |
| `reports` | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 8 |
| `import` | 12 | 1 | 1 | 0 | 0 | 0 | 0 | 12 |
| `integrations` | 9 | 0 | 0 | 0 | 0 | 2 | 0 | 7 |
| `customdata` | 13 | 0 | 0 | 0 | 7 | 0 | 0 | 13 |
| `automations` | 8 | 0 | 0 | 0 | 3 | 0 | 1 | 7 |
| `signatures` | 5 | 0 | 0 | 0 | 5 | 0 | 1 | 4 |
| `admin` | 15 | 0 | 0 | 0 | 0 | 0 | 0 | 15 |
| `superadmin` | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 3 |
| `customer` | 7 | 0 | 0 | 0 | 0 | 4 | 1 | 2 |
| `phone` | 8 | 1 | 0 | 1 | 0 | 0 | 2 | 6 |
| `viewer` | 7 | 0 | 0 | 0 | 0 | 1 | 0 | 6 |
| `offline` | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 2 |
| `backups` | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 5 |
| `access` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `support` | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 4 |

## Navegación global inventariada

| Control | Cobertura |
|---|---|
| 7 botones de área compacta | Abren popover con heading y lista completa de módulos del área. |
| 7 headings de sección expandida | Acordeón; muestra la lista completa y deja solo un grupo abierto. |
| 40 enlaces de módulo | Navegan a una vista existente (28 destinos únicos más Inicio; destinos secundarios relacionados comparten contexto). |
| Toggle sidebar / menú móvil | Compacta o expande en escritorio; a 620 px o menos abre un sheet de navegación con acordeón de áreas y lista completa de módulos. |
| Overview, Claims, Workflows, Integrations | Destinos directos. |
| Búsqueda global | Filtra tabla/listas de la vista activa y Claims; atajo ⌘K. |
| Selector de rol demo | Ajuster, Assistant, Admin, Accounting, Customer, Mitigation y Superadmin; cambia la perspectiva y muestra aviso de que no concede permisos reales. |
| Selector de agencia, idioma y notificaciones | Retroalimentación local; notificaciones abre aprobaciones. |
| Restablecer demo | Confirmación y borrado de estado local en el navegador. |

## Contratos de interacción aplicados

- Barra: headings desplegables con acordeón de un solo grupo; compacto abre popover con el nombre de área y todos sus destinos; en móvil usa panel sheet y se cierra al elegir ruta.
- Navegación: destino único para módulos contextuales; solo se resalta el acceso seleccionado. Search global filtra filas y tarjetas visibles; búsqueda y filtros rápidos de Claims combinan coincidencia de texto y etiquetas del fixture, con mensaje vacío. En Claims, Filter aplica el criterio seleccionado, Sort alterna orden A–Z/Z–A, Group ordena por tipo de pérdida, Columns permite ocultar/mostrar campos y Save view persiste/aplica vistas guardadas en localStorage. Group ordena filas, sin crear grupos anidados.
- Inputs/selects/checkboxes guardan valor no sensible localmente. Cambio de rol se guarda y se etiqueta como perspectiva ilustrativa, sin control de acceso real.
- El formulario inicial persiste agencia y branding localmente. CRUD tipado local disponible para claims, clientes, tareas, eventos y templates: ver, crear, editar, eliminar con confirmación; completar tareas; enlazar tareas/claims y actualizar el nombre de cliente en claims relacionados. Los cambios se guardan en `ocs-full-demo-state-v1` en localStorage.
- Los formularios CRUD validan campos requeridos y tipo de email. “Restablecer demo” elimina solo las claves `ocs-demo-*` y `ocs-full-demo-state-v1`, sin borrar el resto del localStorage.
- Google Sheets mantiene sus filas de referencia sin edición; asociaciones y anotaciones son acciones locales de demo.
- Email, SMS, llamadas, firmas, notificaciones, AI, integraciones, pagos, importación, backups y sync no transmiten datos ni llaman servicios.

## Referencias y comprobaciones de esta sesión

- Se consultaron el handoff completo, el mockup V6, los dos resúmenes PDF, el boceto de cinco pantallas y las seis capturas de `upload/`. El clip MP4 presente no se previsualizó: el navegador rechazó abrir archivos locales y no se intentó eludir esa restricción.
- La copia Excel se inspeccionó sin leer registros de clientes; se verificaron nombres y dimensiones de pestañas. En el Google Sheet compartido se leyeron metadatos y fórmulas/cabeceras, sin editar celdas ni importar valores.
- Navegador escritorio: **40/40 enlaces de módulos** llegaron a la pantalla asignada; se inventariaron 30 pantallas y siete grupos.
- Navegador móvil a **390×844**: se recorrieron los **40/40 destinos** desde el sheet, con sus 7 grupos, sin desbordamiento horizontal.
- Navegador tablet a **768×1024**: se recorrieron los **40/40 destinos** sin desbordamiento de página. Se ajustaron las columnas de contenido y el encabezado para esta anchura; las tablas conservan desplazamiento dentro de su contenedor y ocultan la barra visual.
- Navegador de escritorio a **1024×768**: se recorrieron los **40/40 destinos** sin desbordamiento. Escritorio amplio **1440×1000**: 40/40 destinos; se comprobaron los popovers compactos de las 7 áreas.
- CRUD local probado en navegador: agencia y branding; claim; tarea creada/editada/completada/borrada; usuario y ticket de soporte; borrador creado desde IA; eliminación confirmada; reset devuelve a “Crear Agencia de Public Adjuster”.
- Claims: filtro Urgent, vista guardada y reaplicada, columnas, orden, grupos y paginación real; al pasar de página 1 a 2 cambió el conjunto de filas de 3 a 2.
- Dashboard: KPI urgente abrió Claims con filtro aplicado. Aprobaciones cambió a “Aprobado · no enviado externamente”; IA dio respuesta sintética con referencia a Sheets read-only y dejó preparar borrador local. Filtro local de soporte redujo el listado según el texto `Open`.
- El selector de idioma alterna/persiste ES/EN en documento y avisos principales; los toggles visuales de configuración cambian y guardan estado local con aviso de que no alteran permisos reales.
- `npm run build`: correcto. Consola de navegador local: 0 errores y 0 advertencias en la revisión tras las últimas interacciones.

## Limitaciones conocidas

- La copia de handoff disponible no incluye los títulos solicitados “12 Contrato de interacción: FULL DEMO, sin controles muertos” y “13 Criterios de aceptación y verificación”; termina con secciones 12 (prompt de inicio) y 13 (nota de alcance). Se aplicaron los requisitos detallados por el usuario en el chat.
- Las vistas del prototipo agrupan submódulos en contexto compartido; el estado de edición y borradores se conserva como registro demo local y el borrado de elementos visibles se recuerda por vista; no se implementó un modelo relacional de producción, por lo que esas mutaciones no se propagan entre copias de mockup como lo haría una API real.
- CRUD tipado local para agencia/branding, claims, clientes/policyholders, tareas/checklists, eventos, templates, adjuntos metadata, usuarios, roles, fases/reglas, soporte, solicitudes del portal, borradores de comunicación, campos personalizados y notas de conciliación. Las notas de conciliación nunca editan las filas fuente de Sheets.
- Entidades recién creadas se reflejan en sus paneles relacionados y se guardan en `localStorage`; el reset limpia solo claves de demo. Los registros de muestra restantes (finanzas fuente, inbox y contenido histórico de expediente, por ejemplo) siguen siendo fixtures; muchas acciones de esas filas actualizan una indicación local en lugar de un modelo relacional CRUD.
- La paginación real está implementada en Claims. Group alterna la ordenación por tipo/fase, no crea grupos anidados. Los demás filtros y ordenamientos usan filas ficticias visibles y no replican consultas de un backend.
- El selector de idioma persiste y cambia el idioma del documento y los avisos principales; la traducción completa de todas las cadenas del prototipo aún no está implementada. El selector de rol cambia la perspectiva/ruta demo, sin aplicar seguridad real.
- En la continuación se comprobó además en navegador que el orden de clientes se conserva y cambia la disposición de filas, que un workflow creado se publica como “Activo · demo”, y que no aparecen errores ni advertencias de consola durante la pasada de rutas.
- Los 556 controles inventariados se revisaron contra sus manejadores; los valores de fixture que no representan entidades editables conservan sus acciones como simulaciones locales y los campos fuente de Google Sheets permanecen de solo lectura. El recorrido de navegación cubre todos los destinos, pero no constituye una prueba aislada de cada combinación de valores de cada formulario.
