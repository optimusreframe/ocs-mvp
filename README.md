# OCS · Optimus Claims System (demo frontend)

Prototipo frontend con datos sintéticos. No integra servicios reales, backend, credenciales ni API; las acciones que representan correo, SMS, firmas, pagos, IA, importación, sincronización y backups son locales y demostrativas.

## Ejecutar

```sh
npm install
npm run dev
```

Para generar el bundle: `npm run build`. Reinicia la demo con **Restablecer demo** en la barra lateral (o limpia los datos locales del navegador). Ningún cambio local escribe en Gmail, Vonage, Sheets, Claim Wizard, Airtable, Resend o DocuSign.

## Publicación

El workflow de GitHub Actions publica `dist/` en GitHub Pages al actualizar `main`. El sitio es una demostración pública: no introduzcas información real ni credenciales. Todo estado editable queda en el navegador del visitante.

Las siete áreas agrupan los módulos enumerados en el handoff; los submódulos que comparten pantalla abren el contexto funcional relacionado. El alta inicial de agencia aplica branding local. El CRUD ficticio incluye agencia/branding, claims, clientes/policyholders, tareas, eventos, templates, adjuntos (solo metadata), usuarios/roles, fases/reglas, tickets, solicitudes del portal, borradores de comunicación, campos personalizados y notas de conciliación. El estado se persiste en localStorage; **Restablecer demo** borra únicamente claves de OCS. Claims tiene búsqueda/filtros, ordenación, vistas guardadas, columnas visibles y paginación con filas que cambian por página. Datos de persona, claims, agencias y transacciones son ficticios.

El MVP conserva limitaciones intencionales: algunas tablas históricas y KPI siguen siendo fixtures; el estado no es relacional de producción, reglas no se ejecutan automáticamente y la paginación está implementada en Claims. Integraciones y envíos externos se simulan en el navegador. Consulta [INTERACTION_INVENTORY.md](./INTERACTION_INVENTORY.md) para el inventario de controles, cobertura y límites.

## Desarrollo hacia producción

El roadmap de fases, el registro de entregas y la definición de “100% Live production” están en [OCS_LIVE_PROGRAM.md](./OCS_LIVE_PROGRAM.md). Los criterios, dependencias y tareas activas están en [tasks/plan.md](./tasks/plan.md) y [tasks/todo.md](./tasks/todo.md). El objetivo de Codex permanece activo y cada fase completada se registrará allí con evidencia y el próximo paso.
