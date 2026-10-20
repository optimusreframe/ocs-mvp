const STORE_KEY = 'ocs-full-demo-state-v1';

const emptyState = () => ({
  agency: null,
  claims: [],
  clients: [],
  tasks: [],
  events: [],
  templates: [],
  signatures: [],
  users: [],
  workflows: [],
  documents: [],
  supportTickets: [],
  portalEvents: [],
  communications: [],
  reconciliations: [],
  customFields: [],
  tables: [],
  roles: [],
  approvalStatus: {},
  activity: [],
  savedViews: [],
  savedReports: [],
  savedDataViews: [],
  importRuns: [],
  backupPoints: [],
  controlActions: [],
});

function readState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (parsed && typeof parsed === 'object') return { ...emptyState(), ...parsed };
  } catch (error) {
    console.warn('El estado demo local no se pudo leer; se inicia una copia limpia.', error);
  }
  return emptyState();
}

let state = readState();
let pendingConfirmation = null;
const now = () => new Date().toISOString();
const makeId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(state));
const toast = (message) => {
  if (typeof window.toast === 'function') window.toast(message);
  else showToast(message);
};

function showToast(message) {
  const node = document.getElementById('toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => node.classList.remove('show'), 2600);
}

function askConfirmation(titleText, messageText, callback, buttonText = 'Confirmar') {
  const backdrop = document.getElementById('modalback');
  const title = document.getElementById('modalTitle');
  const description = document.getElementById('modalDesc');
  const body = document.getElementById('modalBody');
  const confirmButton = backdrop?.querySelector('[data-action="modal-confirm"]');
  if (!backdrop || !body || !confirmButton) return;
  pendingConfirmation = callback;
  title.textContent = titleText;
  description.textContent = 'Confirmación local · ningún servicio externo se modifica.';
  body.replaceChildren();
  const message = document.createElement('p'); message.className = 'smalltxt'; message.textContent = messageText;
  body.append(message);
  body.dataset.formAction = 'confirm';
  delete body.dataset.editId;
  confirmButton.textContent = buttonText;
  backdrop.classList.add('show');
}

function logActivity(type, label, itemId) {
  state.activity.unshift({
    id: makeId('ACT'), type, label, itemId,
    actor: document.getElementById('roleSwitcher')?.value || 'Admin',
    at: now(),
  });
  state.activity = state.activity.slice(0, 60);
}

function applyAgency(agency) {
  if (!agency) return;
  document.getElementById('previewName')?.replaceChildren(document.createTextNode(agency.publicName));
  const switcher = document.getElementById('agencySwitcher');
  if (switcher) switcher.textContent = `${agency.publicName}⌄`;
  const brand = document.querySelector('.logo');
  if (brand) {
    brand.textContent = agency.publicName.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();
    brand.style.background = agency.color || '#007aff';
    brand.setAttribute('aria-label', `${agency.publicName} · demo`);
  }
  const color = agency.color || '#007aff';
  document.documentElement.style.setProperty('--violet', color);
  document.documentElement.style.setProperty('--violet2', `${color}1a`);
  document.documentElement.style.setProperty('--violet3', `${color}33`);
  document.querySelectorAll('[data-agency-name]').forEach((node) => { node.textContent = agency.publicName; });
}

function clientByName(name) {
  return state.clients.find((client) => client.name.toLocaleLowerCase() === name.toLocaleLowerCase());
}

function ensureClient(name, email = '') {
  const normalized = name.trim();
  if (!normalized) return null;
  let client = clientByName(normalized);
  if (!client) {
    client = { id: makeId('CLI'), name: normalized, email: email.trim(), createdAt: now(), updatedAt: now() };
    state.clients.push(client);
    logActivity('client-created', `Cliente demo creado: ${client.name}`, client.id);
  } else if (email.trim() && !client.email) {
    client.email = email.trim();
    client.updatedAt = now();
  }
  return client;
}

function safeButton(label, className, action, id) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.dataset.recordAction = action;
  button.dataset.recordId = id;
  return button;
}

function makeRecordPanel(screenId, title, records, kind, describe) {
  const screen = document.getElementById(screenId);
  if (!screen) return;
  let panel = screen.querySelector(`.full-demo-records[data-kind="${kind}"]`);
  if (!panel) {
    panel = document.createElement('section');
    panel.className = 'card full-demo-records';
    panel.dataset.kind = kind;
    panel.setAttribute('aria-live', 'polite');
    const head = document.createElement('div');
    head.className = 'cardhead';
    const heading = document.createElement('div');
    heading.className = 'cardtitle';
    heading.textContent = title;
    const flag = document.createElement('span');
    flag.className = 'pill blue';
    flag.textContent = 'DEMO · localStorage';
    head.append(heading, flag);
    const list = document.createElement('div');
    list.className = 'full-demo-record-list';
    panel.append(head, list);
    const screenHead = screen.querySelector('.screenhead');
    if (screenHead) screenHead.after(panel);
    else screen.prepend(panel);
  }
  const list = panel.querySelector('.full-demo-record-list');
  list.replaceChildren();
  if (!records.length) {
    const empty = document.createElement('p');
    empty.className = 'smalltxt';
    empty.textContent = 'Aún no hay elementos creados en esta sesión de demo.';
    list.append(empty);
    return;
  }
  records.forEach((record) => {
    const row = document.createElement('article');
    row.className = 'full-demo-record';
    const copy = document.createElement('div');
    copy.className = 'full-demo-record-copy';
    const name = document.createElement('strong');
    name.textContent = record.title || record.name || record.customer || record.ocsId || record.label || record.source || 'Elemento demo';
    const detail = document.createElement('small');
    detail.textContent = describe(record);
    copy.append(name, detail);
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(safeButton('Ver', 'btn sm', 'view', record.id));
    if (formForKind[kind]) actions.append(safeButton('Editar', 'btn sm', 'edit', record.id));
    if (kind === 'claim') actions.append(safeButton(record.archived ? 'Restaurar' : 'Archivar', 'btn sm', 'archive', record.id));
    if (kind === 'task' && record.status !== 'Completada') {
      actions.append(safeButton('Completar', 'btn sm', 'complete', record.id));
    }
    if (kind === 'communication' && record.status === 'Borrador local') actions.append(safeButton('Aprobar · no enviar', 'btn sm', 'approve', record.id));
    if (kind === 'communication' && record.status !== 'Cancelado · no enviado') actions.append(safeButton('Cancelar', 'btn sm', 'cancel', record.id));
    actions.append(safeButton('Eliminar', 'btn sm danger', 'delete', record.id));
    row.append(copy, actions);
    list.append(row);
  });
}

function addClaimRow(claim) {
  const tbody = document.querySelector('#claims tbody');
  if (!tbody) return;
  let tr = tbody.querySelector(`[data-local-claim="${CSS.escape(claim.id)}"]`);
  if (!tr && claim.sourceFixture) tr = [...tbody.querySelectorAll('tr:not([data-local-claim])')].find((row) => row.innerText.includes(claim.ocsId));
  if (!tr) tr = document.createElement('tr');
  tr.replaceChildren();
  tr.dataset.localClaim = claim.id;
  tr.dataset.open = 'claim';
  const cells = [
    `${claim.customer}${claim.address ? ` · ${claim.address}` : ''}`,
    `${claim.ocsId} · Demo`,
    claim.lossType,
    claim.carrier || 'Pendiente de asignar',
    claim.stage,
    claim.clientStage,
    claim.assignee || 'Sin asignar',
    claim.nextAction || 'Definir próximo paso',
    'Actualizado ahora',
  ];
  cells.forEach((value) => {
    const td = document.createElement('td');
    td.textContent = value;
    tr.append(td);
  });
  const actionCell = document.createElement('td');
  actionCell.className = 'local-row-actions';
  actionCell.append(
    safeButton('Editar', 'btn sm', 'edit', claim.id),
    safeButton('Eliminar', 'btn sm danger', 'delete', claim.id),
  );
  tr.append(actionCell);
  tbody.append(tr);
}

function claimFromFixture(ocsId = 'OCS-26-01482') {
  const existing = state.claims.find((claim) => claim.ocsId === ocsId);
  if (existing) return existing;
  const row = [...(document.querySelectorAll('#claims tbody tr'))].find((item) => item.innerText.includes(ocsId));
  if (!row) return null;
  const cells = [...row.cells]; const customer = (cells[0]?.innerText || 'Cliente demo').split('·')[0].trim();
  const claim = {
    id: `FIXTURE-${ocsId}`, ocsId, sourceFixture: true, customer, email: `${customer.toLocaleLowerCase().replace(/\s+/g, '.')}@example.invalid`,
    lossType: cells[2]?.innerText.trim() || 'Agua', date: '2026-05-18', state: 'Florida', address: cells[0]?.innerText.trim() || '',
    carrier: cells[3]?.innerText.trim() || 'Pendiente de asignar', assignee: cells[6]?.innerText.trim() || 'Sin asignar',
    stage: cells[4]?.innerText.trim() || 'Intake · Demo', clientStage: cells[5]?.innerText.trim() || 'Review · Demo',
    nextAction: cells[7]?.innerText.trim() || 'Revisar expediente demo', status: 'Abierto',
  };
  state.claims.push(claim); save(); return claim;
}

function render() {
  if (state.seededClaims) document.querySelectorAll('#claims tbody tr:not([data-local-claim])').forEach((row) => row.remove());
  const existingClaimIds = new Set(state.claims.map((claim) => claim.id));
  document.querySelectorAll('#claims tbody tr[data-local-claim]').forEach((row) => {
    if (!existingClaimIds.has(row.dataset.localClaim)) row.remove();
  });
  state.claims.forEach(addClaimRow);
  state.claims.forEach((claim) => {
    const row = document.querySelector(`#claims tbody tr[data-local-claim="${CSS.escape(claim.id)}"]`);
    if (row && claim.archived) row.cells[4].textContent = 'Archived · Demo';
  });
  makeRecordPanel('claims', 'Claims creados en esta demo', state.claims, 'claim', (item) => `${item.ocsId} · ${item.lossType} · ${item.stage}`);
  makeRecordPanel('customer', 'Clientes creados en esta demo', state.clients, 'client', (item) => item.email || 'Perfil demo local');
  makeRecordPanel('customdata', 'Clientes y registros locales', state.clients, 'client', (item) => item.email || 'Perfil demo local');
  makeRecordPanel('tasks', 'Tareas creadas en esta demo', state.tasks, 'task', (item) => `${item.status} · ${item.priority} · ${item.assignee || 'Sin asignar'}${item.due ? ` · ${item.due}` : ''}`);
  makeRecordPanel('dashboard', 'Tareas locales recientes', state.tasks.slice(0, 5), 'task', (item) => `${item.status} · ${item.priority}`);
  makeRecordPanel('calendar', 'Eventos locales', state.events, 'event', (item) => `${item.date || 'Sin fecha'} · ${item.relatedClaim || 'Agencia'}`);
  makeRecordPanel('documents', 'Templates creados en esta demo', state.templates, 'template', (item) => `${item.type} · ${item.visibility} · borrador local`);
  makeRecordPanel('signatures', 'Paquetes de firma creados en esta demo', state.signatures, 'signature', (item) => `${item.signer} · ${item.provider} · ${item.status} · sin envío real`);
  makeRecordPanel('documents', 'Adjuntos ficticios', state.documents, 'document', (item) => `${item.fileName || 'Archivo de demo'} · ${item.visibility} · ${item.relatedClaim || 'Sin claim'}`);
  makeRecordPanel('admin', 'Usuarios y roles de demo', state.users, 'user', (item) => `${item.email} · ${item.role} · ${item.status}`);
  makeRecordPanel('admin', 'Roles y alcances configurables', state.roles, 'role', (item) => `${item.scope} · ${item.status}`);
  makeRecordPanel('workflows', 'Fases y reglas locales', state.workflows, 'workflow', (item) => `${item.trigger} · ${item.action} · ${item.status}`);
  makeRecordPanel('automations', 'Reglas de automatización demo', state.workflows, 'workflow', (item) => `${item.trigger} · ${item.action} · ${item.status}`);
  makeRecordPanel('support', 'Tickets locales de soporte', state.supportTickets, 'support', (item) => `${item.requester} · ${item.status} · ${item.owner || 'Sin responsable'}`);
  makeRecordPanel('portal', 'Solicitudes y eventos del portal', state.portalEvents, 'portal', (item) => `${item.type} · ${item.status} · ${item.relatedClaim || 'Agencia'}`);
  makeRecordPanel('email', 'Borradores y etiquetas locales', state.communications, 'communication', (item) => `${item.channel} · ${item.status} · ${item.relatedClaim || 'Sin claim'} · Simulación: no enviado`);
  makeRecordPanel('phone', 'Mensajes y anotaciones locales', state.communications, 'communication', (item) => `${item.channel} · ${item.status} · ${item.relatedClaim || 'Sin claim'} · Simulación: no enviado`);
  makeRecordPanel('approvals', 'Borradores de demo para aprobar', state.communications, 'communication', (item) => `${item.channel} · ${item.status} · Simulación: no enviado`);
  makeRecordPanel('accounting', 'Notas de conciliación OCS', state.reconciliations, 'reconciliation', (item) => `${item.reference} · ${item.relatedClaim || 'Sin asociación'} · ${item.status}`);
  makeRecordPanel('customdata', 'Campos personalizados de demo', state.customFields, 'customfield', (item) => `${item.fieldType} · ${item.appliesTo} · local`);
  makeRecordPanel('customdata', 'Tablas agregadas localmente', state.tables || [], 'table', (item) => `${item.primaryField} · ${item.description || 'Esquema ficticio local'}`);
  makeRecordPanel('reports', 'Reportes guardados en esta demo', state.savedReports || [], 'report', (item) => `${item.filters || 'Sin filtros'} · solo local`);
  makeRecordPanel('backups', 'Puntos de recuperación simulados', state.backupPoints || [], 'backup', (item) => `${item.status} · sin archivos externos`);
  makeRecordPanel('import', 'Vistas previas locales', state.importRuns || [], 'importrun', (item) => `${item.source} · ${item.status} · ${item.at ? new Date(item.at).toLocaleString() : ''}`);
  ['workflows', 'automations'].forEach((screenId) => {
    const entries = (state.workflowDraftItems || []).filter((item) => item.screen === screenId);
    const old = document.querySelector(`#${screenId} .workflow-draft-note`); old?.remove();
    if (entries.length) { const note = document.createElement('div'); note.className = 'module-note workflow-draft-note'; note.textContent = `Borrador local: ${entries.map((item) => item.label).join(' · ')}`; document.querySelector(`#${screenId} .screenhead`)?.after(note); }
  });
  document.querySelectorAll('#tasks .taskcard').forEach((card) => {
    const title = card.querySelector('b')?.textContent.trim(); const assignee = state.taskAssignments?.[title];
    if (assignee) { const owner = document.createElement('span'); owner.className = 'pill blue'; owner.textContent = 'Asignada a mí · demo'; card.querySelector('.taskfoot')?.replaceChildren(owner); }
  });
  document.querySelectorAll('#approvals .approvalitem').forEach((item) => {
    const label = item.querySelector('b')?.textContent.trim(); const status = state.approvalStatus?.[label];
    if (status) { let badge = item.querySelector('.demo-approval-status'); if (!badge) { badge = document.createElement('span'); badge.className = 'pill blue demo-approval-status'; item.querySelector('.row')?.append(badge); } badge.textContent = status; }
  });
  const nativeCount = document.querySelectorAll('#claims tbody tr:not([data-local-claim])').length;
  const total = nativeCount + state.claims.length;
  const claimSelect = document.querySelector('#claims .boardhead select');
  if (claimSelect?.options[0]) claimSelect.options[0].textContent = `All claims · ${total}`;
  const claimSummary = document.querySelector('#claims .row.mt .smalltxt');
  if (claimSummary) claimSummary.textContent = `Showing ${total ? 1 : 0}–${total} of ${total} · Página local · Demo`;
  applyClaimColumns();
  applyCustomDataColumns();
  renderCalendarMonth();
  if (state.uiViews?.dashboard) applyDashboardQueue(state.uiViews.dashboard);
  if (state.claimSort) sortClaimRows();
  if (state.claimFilter) applyClaimFilter(state.claimFilter);
  const groupButton = [...document.querySelectorAll('#claims .boardhead button.filter')].find((button) => /group/i.test(button.textContent));
  if (groupButton && state.claimGroup) groupButton.textContent = `▦ Group: ${state.claimGroup === 'loss' ? 'Loss type' : 'Internal stage'}`;
  const sortButton = [...document.querySelectorAll('#claims .boardhead button.filter')].find((button) => /sort/i.test(button.textContent));
  if (sortButton && state.claimSort) sortButton.textContent = `↕ Sort ${state.claimSort === 'asc' ? 'A–Z' : 'Z–A'}`;
  applyClaimPagination();
  if (state.moduleSorts?.customer === 'oldest') {
    const body = document.querySelector('#customer tbody'); if (body) [...body.rows].reverse().forEach((row) => body.append(row));
  }
  renderSavedClaimViews();
  renderSavedDataViews();
  renderAiMessages();
  renderTemplateMappings();
  renderEmailWorkspace();
  const importNote = document.querySelector('#import .saved-mapping-note');
  if (state.importMapping) {
    const note = importNote || document.createElement('p'); note.className = 'module-note saved-mapping-note';
    note.textContent = `Mapeo ${state.importMapping.status} · ${state.importMapping.source}`; document.querySelector('#import .screenhead')?.after(note);
  }
  if (state.importSource) document.querySelectorAll('#import .pagecols .card.flat.center').forEach((card) => card.classList.toggle('source-selected', card.querySelector('b')?.textContent.trim() === state.importSource));
  const offlineNote = document.querySelector('#offline .saved-offline-note');
  if (state.offlinePolicy) { const note = offlineNote || document.createElement('p'); note.className = 'module-note saved-offline-note'; note.textContent = state.offlinePolicy.status; document.querySelector('#offline .screenhead')?.after(note); }
  const visibilityNote = document.querySelector('#viewer .saved-visibility-note');
  if (state.viewerVisibility) { const note = visibilityNote || document.createElement('p'); note.className = 'module-note saved-visibility-note'; note.textContent = `Visibilidad local: ${state.viewerVisibility} · sin publicar`; document.querySelector('#viewer .screenhead')?.after(note); }
  const viewerPage = document.querySelector('#viewer .card[style*="background:#e9e9eb"] > div[style*="background:#fff"]');
  if (viewerPage) viewerPage.style.transform = `scale(${Number(state.viewerZoom || 1)}) rotate(${Number(state.viewerRotation || 0)}deg)`;
  const reminder = state.signatureReminderAt;
  if (reminder) { const status = document.querySelector('#signatures tbody tr .pill'); if (status) status.textContent = `Recordatorio simulado · ${new Date(reminder).toLocaleString()}`; }
  Object.entries(state.emailMatches || {}).forEach(([threadName, claimId]) => {
    const thread = [...document.querySelectorAll('#email .mailthread')].find((item) => item.querySelector('b')?.textContent.trim() === threadName);
    if (thread) { let badge = thread.querySelector('.demo-match-status'); if (!badge) { badge = document.createElement('small'); badge.className = 'demo-match-status'; thread.append(badge); } badge.textContent = `Asociado a ${claimId} · demo`; }
  });
  if (state.agency) applyAgency(state.agency);
  const languageButton = [...document.querySelectorAll('.topright button.tinybtn')].find((button) => /^(ES|EN)⌄?$/.test(button.textContent.trim()));
  if (languageButton) {
    state.uiLanguage ||= (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
    languageButton.textContent = `${state.uiLanguage.toUpperCase()}⌄`;
    document.documentElement.lang = state.uiLanguage;
  }
  (state.removedFixtures || []).forEach(({ screenId, summary }) => {
    document.getElementById(screenId)?.querySelectorAll('tr,.taskpeek,.taskcard,.docrow,.templatecard,.inboxitem,.activityrow,.approvalitem').forEach((row) => {
      if (row.innerText.trim().replace(/\s+/g, ' ') === summary) row.remove();
    });
  });
  Object.entries(state.moduleFilters || {}).forEach(([screenId, filter]) => applyModuleFilter(screenId, filter));
}

function renderSavedClaimViews() {
  const screen = document.getElementById('claims');
  const tabs = screen?.querySelector('.tabs');
  if (!screen || !tabs) return;
  screen.querySelector('.saved-claim-views')?.remove();
  if (!state.savedViews.length) return;
  const strip = document.createElement('div');
  strip.className = 'saved-claim-views';
  strip.setAttribute('aria-label', 'Vistas guardadas locales');
  const label = document.createElement('span'); label.className = 'smalltxt'; label.textContent = 'Vistas guardadas · Demo'; strip.append(label);
  state.savedViews.forEach((view, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'btn sm';
    button.textContent = view.name; button.dataset.claimView = String(index); strip.append(button);
  });
  tabs.after(strip);
}

function renderSavedDataViews() {
  const list = document.querySelector('#customdata .subnav');
  if (!list) return;
  list.querySelectorAll('[data-saved-data-view]').forEach((button) => button.remove());
  [...(state.savedDataViews || [])].reverse().forEach((view) => {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.savedDataView = view.id;
    button.textContent = view.name; list.insertBefore(button, [...list.querySelectorAll('button')].find((item) => /create view/i.test(item.textContent)) || null);
  });
}

function renderTemplateMappings() {
  const screen = document.getElementById('templates');
  const container = screen?.querySelector('.mappingrow')?.parentElement;
  if (!container) return;
  container.querySelectorAll('.mappingrow[data-local-mapping]').forEach((row) => row.remove());
  (state.templateMappings || []).forEach((mapping) => {
    const row = document.createElement('div'); row.className = 'mappingrow'; row.dataset.localMapping = 'true';
    const name = document.createElement('input'); name.placeholder = 'Nombre del campo PDF'; name.setAttribute('aria-label', 'Nombre del campo PDF'); name.value = mapping.pdfField || '';
    const arrow = document.createElement('span'); arrow.textContent = '→';
    const select = document.createElement('select'); select.setAttribute('aria-label', 'Campo OCS asociado');
    ['Policyholder · display name', 'Loss address', 'Loss date', 'Carrier claim number'].forEach((value) => { const option = document.createElement('option'); option.textContent = value; option.selected = value === mapping.ocsField; select.append(option); });
    row.append(name, arrow, select); container.append(row);
  });
}

function renderEmailWorkspace() {
  const screen = document.getElementById('email'); if (!screen) return;
  const list = screen.querySelector('.mailmid'); if (!list) return;
  list.querySelectorAll('.mailthread[data-local-thread]').forEach((row) => row.remove());
  (state.communications || []).forEach((item) => {
    const row = document.createElement('div'); row.className = 'mailthread'; row.dataset.localThread = item.id; row.dataset.threadName = item.title;
    const title = document.createElement('b'); title.textContent = item.title || 'Borrador local';
    const content = document.createElement('p'); content.textContent = `${item.contact || 'Contacto ficticio'} · ${item.content || ''}`;
    const meta = document.createElement('small'); meta.textContent = `${item.status || 'Borrador local'} · no enviado`;
    row.append(title, content, meta); list.append(row);
  });
  const threads = [...list.querySelectorAll('.mailthread')];
  threads.forEach((row) => { row.setAttribute('role', 'button'); row.setAttribute('tabindex', '0'); row.style.cursor = 'pointer'; });
  const selectedName = state.activeEmail || threads[0]?.querySelector('b')?.textContent.trim() || '';
  const folder = state.emailFolder || 'Inbox';
  const folderMatchers = {
    Inbox: () => true,
    Starred: (row) => row.dataset.starred === 'true',
    Sent: (row) => row.dataset.localThread && /Aprobado|Enviado/i.test(row.innerText),
    Drafts: (row) => Boolean(row.dataset.localThread),
    'Needs matching': (row) => /possible match|no claim created|match 7\d%|2 claims/i.test(row.innerText),
    'Unrelated emails': (row) => /no claim created/i.test(row.innerText),
    Archived: (row) => row.dataset.archived === 'true',
  };
  threads.forEach((row) => {
    const name = row.querySelector('b')?.textContent.trim() || row.dataset.threadName;
    row.classList.toggle('sel', name === selectedName);
    row.hidden = !folderMatchers[folder]?.(row) && folder !== 'Inbox';
  });
  let empty = list.querySelector('.mail-folder-empty');
  if (!threads.some((row) => !row.hidden)) {
    if (!empty) { empty = document.createElement('p'); empty.className = 'smalltxt mail-folder-empty'; empty.setAttribute('role', 'status'); list.append(empty); }
    empty.textContent = folder === 'Sent' ? 'No se envió ningún correo real desde esta demo.' : `No hay mensajes sintéticos en “${folder}”.`;
  } else empty?.remove();
  const firstThread = threads.find((row) => !row.hidden && (row.querySelector('b')?.textContent.trim() || row.dataset.threadName) === selectedName) || threads.find((row) => !row.hidden);
  if (firstThread) {
    state.activeEmail = firstThread.querySelector('b')?.textContent.trim() || firstThread.dataset.threadName;
    firstThread.classList.add('sel');
    const title = firstThread.querySelector('b')?.textContent.trim() || 'Borrador de demo';
    const summary = firstThread.querySelector('p')?.textContent.trim() || 'Mensaje sintético de demostración.';
    const content = screen.querySelector('.mailcontent');
    const heading = content?.querySelector('h3'); if (heading) heading.textContent = title;
    const body = content?.querySelector(':scope > p'); if (body) body.textContent = `${summary}\n\nContenido sintético para revisión local. Ningún mensaje se envió.`;
    const matchButton = [...(content?.querySelectorAll('button') || [])].find((button) => /change claim/i.test(button.innerText));
    if (matchButton) matchButton.dataset.emailId = state.activeEmail;
  }
  const folderHeader = list.querySelector('.mailmidhead');
  if (folderHeader) { const text = [...folderHeader.childNodes].find((node) => node.nodeType === Node.TEXT_NODE); if (text) text.textContent = `${folder} · ${state.selectedMailbox || 'claims@example.invalid'} `; }
  screen.querySelectorAll('.mailbox').forEach((item) => item.classList.toggle('active', item.textContent.replace(/[●○]/g, '').trim().split(/\s+\d+$/)[0] === folder || item.textContent.includes(state.selectedMailbox || 'claims@example.invalid')));
}

function openDataViewDialog() {
  const backdrop = document.getElementById('modalback'); const body = document.getElementById('modalBody');
  document.getElementById('modalTitle').textContent = 'Crear vista guardada';
  document.getElementById('modalDesc').textContent = 'La vista y su filtro se guardan solo en este navegador.';
  body.replaceChildren();
  const wrap = document.createElement('div'); wrap.className = 'field'; const label = document.createElement('label'); label.htmlFor = 'demo-data-view-name'; label.textContent = 'Nombre de la vista';
  const input = document.createElement('input'); input.id = 'demo-data-view-name'; input.name = 'name'; input.dataset.field = 'name'; input.required = true; input.value = 'Mi vista demo';
  wrap.append(label, input); body.append(wrap); body.dataset.formAction = 'data-view'; delete body.dataset.editId;
  backdrop.querySelector('[data-action="modal-confirm"]').textContent = 'Guardar vista'; backdrop.classList.add('show'); input.focus();
}

function openClaimViewDialog(mode) {
  const backdrop = document.getElementById('modalback');
  const title = document.getElementById('modalTitle');
  const description = document.getElementById('modalDesc');
  const body = document.getElementById('modalBody');
  const confirmButton = backdrop?.querySelector('[data-action="modal-confirm"]');
  if (!backdrop || !body || !confirmButton) return;
  body.replaceChildren();
  const wrap = document.createElement('div'); wrap.className = 'field';
  const label = document.createElement('label'); label.htmlFor = 'claim-view-filter'; label.textContent = 'Filtro de demo';
  const select = document.createElement('select'); select.id = 'claim-view-filter'; select.dataset.field = 'filter';
  const choices = ['All claims', 'My claims', 'Urgent', 'Awaiting carrier', 'Awaiting customer', 'Archived'];
  choices.forEach((choice) => { const option = document.createElement('option'); option.value = choice; option.textContent = choice; option.selected = choice === (state.claimFilter || 'All claims'); select.append(option); });
  wrap.append(label, select); body.append(wrap);
  if (mode === 'save') {
    const nameWrap = document.createElement('div'); nameWrap.className = 'field';
    const nameLabel = document.createElement('label'); nameLabel.htmlFor = 'claim-view-name'; nameLabel.textContent = 'Nombre de la vista';
    const nameInput = document.createElement('input'); nameInput.id = 'claim-view-name'; nameInput.dataset.field = 'name'; nameInput.required = true; nameInput.value = `Claims · ${choices.includes(state.claimFilter) ? state.claimFilter : 'Mi vista'}`;
    nameWrap.append(nameLabel, nameInput); body.append(nameWrap);
  }
  title.textContent = mode === 'save' ? 'Guardar vista de claims' : 'Filtrar claims';
  description.textContent = 'La vista se aplica a los datos ficticios locales de esta sesión.';
  body.dataset.formAction = mode === 'save' ? 'claims-save-view' : 'claims-filter';
  delete body.dataset.editId; confirmButton.textContent = mode === 'save' ? 'Guardar vista' : 'Aplicar filtro';
  backdrop.classList.add('show'); select.focus();
}

function applyClaimFilter(filter) {
  state.claimFilter = filter;
  state.claimPage = 1;
  const select = document.querySelector('#claims .boardhead select');
  if (select) {
    const match = [...select.options].find((option) => option.textContent.toLowerCase().includes(filter.toLowerCase()));
    if (match) select.value = match.value;
    else select.selectedIndex = 0;
  }
  document.querySelectorAll('#claims .tab').forEach((tab) => tab.classList.toggle('active', tab.textContent.trim().toLowerCase().startsWith(filter.toLowerCase())));
  window.applyClaimsViewState?.();
}

function sortClaimRows() {
  const tbody = document.querySelector('#claims tbody');
  if (!tbody) return;
  const rows = [...tbody.querySelectorAll('tr')].filter((row) => row.cells.length && !row.classList.contains('claim-group-row'));
  const direction = state.claimSort === 'desc' ? -1 : 1;
  rows.sort((a, b) => direction * a.cells[0].innerText.localeCompare(b.cells[0].innerText));
  rows.forEach((row) => tbody.append(row));
}

function applyClaimColumns() {
  const hidden = new Set(state.hiddenClaimColumns || []);
  document.querySelectorAll('#claims table tr').forEach((row) => [...row.children].forEach((cell, index) => {
    cell.style.display = hidden.has(index) ? 'none' : '';
  }));
}

function applyCustomDataColumns() {
  const hidden = new Set(state.hiddenCustomColumns || []);
  document.querySelectorAll('#customdata .tablewrap table tr').forEach((row) => [...row.children].forEach((cell, index) => {
    cell.style.display = hidden.has(index) ? 'none' : '';
  }));
}

function renderCalendarMonth() {
  const screen = document.getElementById('calendar'); const table = screen?.querySelector('.tablewrap table'); const tbody = table?.querySelector('tbody');
  if (!tbody) return;
  const offset = Number(state.calendarOffset || 0); const firstDay = new Date(2026, 9 + offset, 1); const gridStart = new Date(2026, 9 + offset, 1 - firstDay.getDay());
  const events = offset === 0 ? { 15: 'LOR due', 19: 'Inspection 2:30 · Carrier call 4:00', 20: 'Chen inspection', 22: 'Recorded statement' } : {};
  tbody.replaceChildren();
  for (let week = 0; week < 6; week++) {
    const row = document.createElement('tr');
    for (let day = 0; day < 7; day++) {
      const date = new Date(gridStart); date.setDate(gridStart.getDate() + week * 7 + day);
      const cell = document.createElement('td'); cell.dataset.date = date.toISOString().slice(0, 10); cell.textContent = String(date.getDate());
      if (date.getMonth() !== firstDay.getMonth()) cell.style.color = '#a1a1a6';
      if (offset === 0 && date.getDate() === 19 && date.getMonth() === firstDay.getMonth()) cell.style.cssText += ';background:#f7f5ff;border-radius:7px';
      if (events[date.getDate()] && date.getMonth() === firstDay.getMonth()) { const badge = document.createElement('span'); badge.className = 'pill violet'; badge.textContent = events[date.getDate()]; cell.append(document.createElement('br'), badge); }
      row.append(cell);
    }
    tbody.append(row);
  }
  const title = screen.querySelector('.cardtitle'); if (title) title.textContent = firstDay.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  const today = screen.querySelector('.thirdcol .cardtitle'); if (today) today.textContent = offset === 0 ? 'Today · Oct 19' : 'Eventos del mes';
}

function applyDashboardQueue(label = '') {
  const normalized = label.toLocaleLowerCase();
  const rows = [...document.querySelectorAll('#dashboard .card.span2 .tablewrap tbody tr')];
  const predicate = normalized.includes('carrier') ? (row) => /carrier/i.test(row.innerText)
    : normalized.includes('cliente') || normalized.includes('customer') ? (row) => /cliente|customer|photo/i.test(row.innerText)
      : normalized.includes('míos') || normalized.includes('my') ? (row) => /alex parker|a\. parker|jordan rivera|j\. rivera/i.test(row.innerText)
        : () => true;
  rows.forEach((row) => { row.hidden = !predicate(row); });
  let empty = document.querySelector('#dashboard .dashboard-queue-empty');
  if (rows.length && !rows.some((row) => !row.hidden)) {
    if (!empty) { empty = document.createElement('p'); empty.className = 'smalltxt dashboard-queue-empty'; empty.setAttribute('role', 'status'); document.querySelector('#dashboard .queueTabs')?.after(empty); }
    empty.textContent = `No hay claims ficticios en la vista “${label}”.`;
  } else empty?.remove();
}

function applyClaimPagination() {
  const tbody = document.querySelector('#claims tbody');
  if (!tbody) return;
  const rows = [...tbody.querySelectorAll('tr')];
  const filtered = rows.filter((row) => row.style.display !== 'none' || row.dataset.pageHidden === 'true');
  const pageSize = 3;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  state.claimPage = Math.min(Math.max(1, state.claimPage || 1), pages);
  const start = (state.claimPage - 1) * pageSize;
  filtered.forEach((row, index) => {
    const pageHidden = index < start || index >= start + pageSize;
    row.dataset.pageHidden = String(pageHidden);
    if (pageHidden) row.style.display = 'none';
    else row.style.display = '';
  });
  const pager = document.querySelector('#claims .tablewrap')?.nextElementSibling;
  if (!pager) return;
  const summary = pager.querySelector('.smalltxt');
  if (summary) summary.textContent = `Showing ${filtered.length ? start + 1 : 0}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length} · Page ${state.claimPage} of ${pages} · Demo`;
  const buttons = [...pager.querySelectorAll('button')];
  const prev = buttons.find((button) => button.textContent.trim() === '‹');
  const next = buttons.find((button) => button.textContent.trim() === '›');
  if (prev) prev.disabled = state.claimPage <= 1;
  if (next) next.disabled = state.claimPage >= pages;
  buttons.filter((button) => /^\d+$/.test(button.textContent.trim())).forEach((button) => {
    const page = Number(button.textContent.trim());
    button.hidden = page > pages;
    button.classList.toggle('primary', page === state.claimPage);
  });
}

function applyModuleFilter(screenId, query) {
  const screen = document.getElementById(screenId); if (!screen) return;
  const normalized = (query || '').trim().toLowerCase();
  const rows = [...screen.querySelectorAll('tbody tr,.taskpeek,.docrow,.inboxitem,.activityrow,.approvalitem,.full-demo-record')];
  let visible = 0;
  rows.forEach((row) => {
    let match = !normalized || normalized.startsWith('all');
    const text = row.innerText.toLowerCase();
    if (!match && normalized === 'open') match = /open|awaiting|pending|review/i.test(text);
    else if (!match && normalized.includes('assigned to me')) match = /alex parker|a\. parker|jordan rivera|j\. rivera/i.test(text);
    else if (!match && normalized.includes('date range')) match = true;
    else if (!match) match = text.includes(normalized);
    row.style.display = match ? '' : 'none'; if (match) visible++;
  });
  screen.querySelector('.demo-module-filter-empty')?.remove();
  const container = screen.querySelector('.tablewrap,.full-demo-records,.mailapp,.grid') || screen;
  if (rows.length && visible === 0) {
    const empty = document.createElement('p'); empty.className = 'smalltxt demo-module-filter-empty'; empty.setAttribute('role', 'status'); empty.textContent = `No hay filas para “${query}”. Borra el texto en el filtro para restablecer la vista demo.`; container.append(empty);
  }
  const note = screen.querySelector('.demo-module-filter-note'); note?.remove();
  if (normalized) { const status = document.createElement('p'); status.className = 'smalltxt demo-module-filter-note'; status.textContent = `Filtro local: ${query} · ${visible} resultados · Demo`; screen.querySelector('.screenhead')?.after(status); }
}

function renderAiMessages() {
  const screen = document.getElementById('ai'); const activity = screen?.querySelector('.activity'); if (!activity) return;
  activity.querySelector('.full-demo-ai-history')?.remove();
  if (!state.aiMessages?.length) return;
  const history = document.createElement('div'); history.className = 'full-demo-ai-history';
  state.aiMessages.forEach((message) => {
    const card = document.createElement('article'); card.className = 'card';
    const heading = document.createElement('strong'); heading.textContent = `Pregunta demo · ${message.createdAt}`;
    const question = document.createElement('p'); question.className = 'smalltxt'; question.textContent = message.question;
    const answer = document.createElement('p'); answer.textContent = message.answer;
    const label = document.createElement('span'); label.className = 'pill violet'; label.textContent = 'Respuesta simulada · sin IA externa';
    const actions = document.createElement('div'); actions.className = 'actions';
    const claim = document.createElement('button'); claim.type = 'button'; claim.className = 'btn sm'; claim.dataset.screen = 'claims'; claim.textContent = 'Abrir claims demo';
    const task = document.createElement('button'); task.type = 'button'; task.className = 'btn sm'; task.dataset.screen = 'tasks'; task.textContent = 'Abrir tareas demo';
    const draft = document.createElement('button'); draft.type = 'button'; draft.className = 'btn sm primary'; draft.dataset.aiDraft = message.id; draft.textContent = 'Preparar borrador local';
    actions.append(claim, task, draft); card.append(heading, question, answer, label, actions); history.append(card);
  });
  activity.append(history);
}

function runAiPrompt() {
  const input = document.querySelector('#ai .replybox textarea'); const question = input?.value.trim() || '';
  if (!question) { toast('Escribe una consulta para recibir una respuesta de demo.'); input?.focus(); return; }
  const normalized = question.toLowerCase();
  const answer = /payment|pago|sheet|concili|transaction/i.test(normalized)
    ? 'La hoja de referencia permanece en solo lectura. Revisa la coincidencia sugerida, asocia una línea ficticia al claim y registra una nota local de conciliación; OCS no escribirá en Google Sheets.'
    : /photo|document|evidence|foto|documento|evidencia/i.test(normalized)
      ? 'Siguiente paso sugerido: revisar los documentos asociados, comprobar qué evidencia falta y crear una tarea para la persona responsable. Si hace falta contactar al cliente, prepara un borrador para aprobación; no se envía.'
      : 'Siguiente paso sugerido: revisar el timeline del claim, confirmar la fase y asignar una tarea local con fecha límite. Puedes abrir Claims o Tasks para continuar con datos ficticios.';
  state.aiMessages ||= []; const message = { id: makeId('AI'), question, answer, createdAt: new Date().toLocaleString() };
  state.aiMessages.unshift(message); state.aiMessages = state.aiMessages.slice(0, 12);
  logActivity('ai-demo-response', 'Respuesta sintética del asistente OCS demo', message.id); save(); renderAiMessages(); toast('Respuesta generada con reglas sintéticas · sin IA externa');
  if (input) input.value = '';
}

function openModuleFilterDialog(screenId, label) {
  const backdrop = document.getElementById('modalback'); const body = document.getElementById('modalBody');
  document.getElementById('modalTitle').textContent = `Filtrar · ${label}`;
  document.getElementById('modalDesc').textContent = 'Escribe una coincidencia de texto. Deja vacío y aplica para restablecer. Solo filtra filas ficticias locales.';
  body.replaceChildren();
  const wrap = document.createElement('div'); wrap.className = 'field'; const input = document.createElement('input');
  input.type = 'search'; input.placeholder = 'Ej. open, nombre o estado'; input.value = state.moduleFilters?.[screenId] || ''; input.dataset.field = 'query';
  const labelNode = document.createElement('label'); labelNode.textContent = 'Coincidencia'; wrap.append(labelNode, input); body.append(wrap);
  body.dataset.formAction = 'module-filter'; body.dataset.screenId = screenId; delete body.dataset.editId;
  backdrop.querySelector('[data-action="modal-confirm"]').textContent = 'Aplicar filtro'; backdrop.classList.add('show'); input.focus();
}

function showActionFeedback(button) {
  const screen = button.closest('.screen') || document.querySelector('.screen.active');
  if (!screen) return;
  const label = button.innerText.trim().replace(/\s+/g, ' ');
  if (/\bdelete\b|eliminar/i.test(label)) {
    const row = button.closest('tr,.taskpeek,.taskcard,.docrow,.templatecard,.inboxitem,.activityrow,.approvalitem');
    if (row) {
      const screenId = row.closest('.screen')?.id || screen.id;
      const summary = row.innerText.trim().replace(/\s+/g, ' ');
      askConfirmation('Eliminar elemento ficticio', `¿Eliminar “${summary.slice(0, 100)}” de la vista de demo?`, () => {
        state.removedFixtures ||= [];
        state.removedFixtures.push({ screenId, summary });
        row.remove(); logActivity('fixture-deleted', `Elemento de muestra ocultado en ${screenId}`, summary); save();
        toast('Elemento ficticio eliminado de esta vista · Demo');
      }, 'Eliminar');
      return;
    }
  }
  const action = { id: makeId('UI'), label, screen: screen.id, at: now() };
  state.controlActions.unshift(action); state.controlActions = state.controlActions.slice(0, 40);
  logActivity('ui-action', `Acción local: ${label}`, action.id); save();
  let panel = screen.querySelector('.demo-action-feedback');
  if (!panel) {
    panel = document.createElement('section'); panel.className = 'card demo-action-feedback'; panel.setAttribute('role', 'status');
    const head = screen.querySelector('.screenhead');
    if (head) head.after(panel); else screen.prepend(panel);
  }
  panel.replaceChildren();
  const strong = document.createElement('strong'); strong.textContent = `${label} · Simulado en esta demo`;
  const small = document.createElement('p'); small.className = 'smalltxt'; small.textContent = 'El cambio queda en el navegador y no se comunica con servicios externos.';
  panel.append(strong, small);
  const row = button.closest('tr,.taskpeek,.taskcard,.docrow,.templatecard,.inboxitem,.activityrow');
  if (row && /approve|review|confirm|assign|complete|match|publish/i.test(label)) {
    let status = row.querySelector('.demo-row-status');
    if (!status) { status = document.createElement('span'); status.className = 'pill blue demo-row-status'; row.lastElementChild?.append(status); }
    status.textContent = `${label.replace(/[✓↗＋]/g, '').trim()} · Demo`;
  }
  toast(`Acción guardada localmente · ${label}`);
}

const formMarkup = {
  'new-claim': {
    title: 'Crear claim demo', kind: 'claim',
    fields: [
      ['customer', 'Policyholder principal', 'text', true, 'Nombre ficticio'],
      ['email', 'Email demo (opcional)', 'email', false, 'persona@example.invalid'],
      ['lossType', 'Tipo de pérdida', 'select', true, ['Agua', 'Moho', 'Viento / huracán', 'Incendio', 'Otro']],
      ['date', 'Fecha de pérdida', 'date', true],
      ['state', 'Estado', 'select', true, ['Florida', 'Georgia', 'Otro estado con licencia']],
      ['address', 'Propiedad · etiqueta ficticia', 'text', false, 'Dirección de demostración'],
      ['carrier', 'Aseguradora (demo)', 'text', false, 'Aseguradora de prueba'],
      ['assignee', 'Adjuster asignado', 'select', false, ['Sin asignar', 'Jordan Rivera', 'Morgan Lee', 'Alex Parker']],
      ['nextAction', 'Próxima acción', 'text', false, 'Revisar documentos recibidos'],
    ],
  },
  'new-task': {
    title: 'Crear tarea demo', kind: 'task',
    fields: [
      ['title', 'Nombre de la tarea', 'text', true, ''],
      ['relatedClaim', 'Claim relacionado', 'select', false, ['Agencia · sin claim', ...state.claims.map((claim) => claim.ocsId)]],
      ['assignee', 'Asignar a', 'select', false, ['Sin asignar', 'Jordan Rivera', 'Morgan Lee', 'Alex Parker']],
      ['due', 'Fecha límite', 'date', false],
      ['priority', 'Prioridad', 'select', true, ['Normal', 'Alta', 'Urgente']],
      ['checklist', 'Primer elemento de checklist (opcional)', 'text', false, ''],
    ],
  },
  'new-client': {
    title: 'Crear cliente demo', kind: 'client',
    fields: [
      ['name', 'Nombre ficticio', 'text', true, ''],
      ['email', 'Email de ejemplo', 'email', false, 'persona@example.invalid'],
      ['phone', 'Teléfono ficticio', 'tel', false, ''],
      ['policyholder', 'Segundo policyholder (opcional)', 'text', false, ''],
    ],
  },
  'new-event': {
    title: 'Programar evento demo', kind: 'event',
    fields: [
      ['title', 'Título', 'text', true, ''],
      ['date', 'Fecha y hora', 'datetime-local', true],
      ['relatedClaim', 'Claim relacionado', 'select', false, ['Agencia · sin claim', ...state.claims.map((claim) => claim.ocsId)]],
      ['assignee', 'Responsable', 'select', false, ['Sin asignar', 'Jordan Rivera', 'Morgan Lee', 'Alex Parker']],
      ['notes', 'Notas de demo', 'textarea', false, ''],
    ],
  },
  'new-template': {
    title: 'Crear template demo', kind: 'template',
    fields: [
      ['title', 'Nombre del template', 'text', true, ''],
      ['type', 'Tipo', 'select', true, ['Carta', 'Acuerdo', 'Solicitud', 'Formulario']],
      ['visibility', 'Visibilidad predeterminada', 'select', true, ['Interno', 'Publicar al portal', 'Requiere aprobación']],
      ['format', 'Salida de demo', 'select', true, ['PDF preview', 'DOCX preview']],
    ],
  },
  'new-signature': { title: 'Crear paquete de firma demo', kind: 'signature', fields: [
    ['title', 'Nombre del paquete', 'text', true, 'Acuerdo de demostración'],
    ['relatedClaim', 'Claim relacionado', 'select', false, ['Agencia · sin claim', ...state.claims.map((claim) => claim.ocsId)]],
    ['signer', 'Firmante ficticio', 'text', true, 'Policyholder de demo'],
    ['provider', 'Proveedor ilustrativo', 'select', true, ['OCS nativo · demo', 'DocuSign · sin conexión']],
    ['status', 'Estado local', 'select', true, ['Borrador local', 'Pendiente de firma · demo']],
  ] },
  'new-user': { title: 'Crear usuario de demo', kind: 'user', fields: [
    ['name', 'Nombre ficticio', 'text', true, ''], ['email', 'Email de ejemplo', 'email', true, 'usuario@example.invalid'],
    ['role', 'Rol ilustrativo', 'select', true, ['Admin', 'Adjuster', 'Assistant', 'Accounting', 'Mitigation', 'Customer']],
    ['status', 'Estado', 'select', true, ['Activo', 'Invitación demo pendiente', 'Desactivado']],
  ] },
  'new-workflow': { title: 'Crear fase o regla', kind: 'workflow', fields: [
    ['title', 'Nombre', 'text', true, ''], ['trigger', 'Disparador ilustrativo', 'text', true, 'Al actualizar estado'],
    ['action', 'Acción local', 'text', true, 'Crear tarea de revisión'], ['status', 'Estado', 'select', true, ['Borrador', 'Activo · demo', 'Pausado']],
  ] },
  'new-document': { title: 'Crear adjunto de demo', kind: 'document', fields: [
    ['title', 'Nombre visible', 'text', true, ''], ['fileName', 'Archivo local · vista temporal', 'file', false],
    ['relatedClaim', 'Claim relacionado', 'select', false, ['Agencia · sin claim', ...state.claims.map((claim) => claim.ocsId)]],
    ['visibility', 'Visibilidad', 'select', true, ['Interno', 'Publicado al portal', 'Requiere aprobación']],
  ] },
  'new-support': { title: 'Crear ticket de soporte demo', kind: 'support', fields: [
    ['title', 'Asunto', 'text', true, ''], ['requester', 'Solicitante ficticio', 'text', true, 'Cliente de demo'],
    ['relatedClaim', 'Claim relacionado', 'select', false, ['Agencia · sin claim', ...state.claims.map((claim) => claim.ocsId)]],
    ['owner', 'Responsable', 'select', false, ['Sin asignar', 'Jordan Rivera', 'Morgan Lee', 'Alex Parker']],
    ['status', 'Estado', 'select', true, ['Abierto', 'En espera', 'Resuelto · demo']],
  ] },
  'new-portal': { title: 'Crear solicitud del portal demo', kind: 'portal', fields: [
    ['title', 'Título', 'text', true, ''], ['type', 'Tipo de solicitud', 'select', true, ['Documento solicitado', 'Cita', 'Pregunta del cliente', 'Actualización']],
    ['relatedClaim', 'Claim relacionado', 'select', false, ['Agencia · sin claim', ...state.claims.map((claim) => claim.ocsId)]],
    ['status', 'Estado local', 'select', true, ['Borrador', 'Pendiente de revisión', 'Confirmado · demo', 'Cancelado']],
  ] },
  'new-communication': { title: 'Crear borrador local de comunicación', kind: 'communication', fields: [
    ['title', 'Asunto o etiqueta', 'text', true, ''], ['channel', 'Canal simulado', 'select', true, ['Email', 'SMS', 'Llamada · nota']],
    ['contact', 'Contacto ficticio', 'text', true, 'Contacto de demo'], ['assignee', 'Responsable demo', 'select', false, ['Sin asignar', 'Jordan Rivera', 'Morgan Lee', 'Alex Parker']],
    ['tag', 'Etiqueta local', 'select', true, ['Cliente', 'Aseguradora', 'Pago · solo referencia', 'Seguimiento']],
    ['relatedClaim', 'Claim relacionado', 'select', false, ['Agencia · sin claim', ...state.claims.map((claim) => claim.ocsId)]],
    ['content', 'Contenido del borrador', 'textarea', true, 'Mensaje ficticio para revisión'],
    ['status', 'Estado', 'select', true, ['Borrador local', 'Aprobado · no enviado externamente', 'Cancelado · no enviado']],
  ] },
  'new-reconciliation': { title: 'Crear nota de conciliación OCS', kind: 'reconciliation', fields: [
    ['reference', 'Referencia sintética de fila', 'text', true, 'TX-DEMO-001'],
    ['relatedClaim', 'Claim relacionado', 'select', false, ['Sin asociación', ...state.claims.map((claim) => claim.ocsId)]],
    ['note', 'Nota local', 'textarea', true, 'Anotación OCS; no modifica la hoja fuente'],
    ['status', 'Estado de conciliación', 'select', true, ['Pendiente', 'Asociado · demo', 'Revisar']],
  ] },
  'new-customfield': { title: 'Crear campo personalizado demo', kind: 'customfield', fields: [
    ['title', 'Etiqueta del campo', 'text', true, ''], ['fieldType', 'Tipo', 'select', true, ['Texto', 'Número', 'Fecha', 'Selección']],
    ['appliesTo', 'Sección', 'select', true, ['Claims', 'Clientes', 'Tareas']],
  ] },
  'new-table': { title: 'Crear tabla demo', kind: 'table', fields: [
    ['title', 'Nombre de la tabla', 'text', true, ''], ['primaryField', 'Campo principal', 'text', true, 'Nombre'],
    ['description', 'Descripción local', 'text', false, 'Tabla ficticia para esta demo'],
  ] },
  'new-report': { title: 'Editar reporte guardado', kind: 'report', fields: [
    ['title', 'Nombre del reporte', 'text', true, 'Reporte de desempeño · demo'],
    ['filters', 'Filtros guardados', 'text', false, 'Todos los claims ficticios'],
    ['description', 'Descripción', 'textarea', false, ''],
  ] },
  'new-role': { title: 'Crear rol de demo', kind: 'role', fields: [
    ['title', 'Nombre del rol', 'text', true, ''], ['scope', 'Alcance ficticio', 'select', true, ['Todos los claims de demo', 'Claims asignados', 'Solo lectura']],
    ['status', 'Estado', 'select', true, ['Activo · demo', 'Pausado']],
  ] },
  'new-agency': { title: 'Editar agencia y branding demo', kind: 'agency', fields: [
    ['legalName', 'Nombre legal', 'text', true, ''], ['publicName', 'Nombre visible', 'text', true, ''],
    ['email', 'Email ficticio', 'email', true, 'admin@example.invalid'], ['city', 'Ciudad', 'text', false, ''],
    ['website', 'Sitio web', 'url', false, ''], ['color', 'Color de marca', 'color', false, ''],
    ['mode', 'Modalidad de demo', 'select', true, ['SaaS hospedado por OCS', 'Full Suite · infraestructura propia']],
  ] },
};

const entityStores = { claim: 'claims', task: 'tasks', client: 'clients', event: 'events', template: 'templates', signature: 'signatures', table: 'tables', report: 'savedReports', backup: 'backupPoints', importrun: 'importRuns', user: 'users', role: 'roles', workflow: 'workflows', document: 'documents', support: 'supportTickets', portal: 'portalEvents', communication: 'communications', reconciliation: 'reconciliations', customfield: 'customFields' };
const formForKind = { claim: 'new-claim', task: 'new-task', client: 'new-client', event: 'new-event', template: 'new-template', signature: 'new-signature', table: 'new-table', report: 'new-report', user: 'new-user', role: 'new-role', workflow: 'new-workflow', document: 'new-document', support: 'new-support', portal: 'new-portal', communication: 'new-communication', reconciliation: 'new-reconciliation', customfield: 'new-customfield', agency: 'new-agency' };
const collectionFor = (kind) => state[entityStores[kind]] || [];

function openForm(action, record) {
  const config = formMarkup[action];
  if (!config) return;
  const backdrop = document.getElementById('modalback');
  const title = document.getElementById('modalTitle');
  const description = document.getElementById('modalDesc');
  const body = document.getElementById('modalBody');
  const confirmButton = backdrop?.querySelector('[data-action="modal-confirm"]');
  if (!backdrop || !body) return;
  if (confirmButton) confirmButton.textContent = 'Save draft';
  title.textContent = `${record ? 'Editar' : ''} ${config.title}`.trim();
  description.textContent = 'Cambios ficticios guardados solo en este navegador. Nada se envía a servicios reales.';
  body.replaceChildren();
  config.fields.forEach(([key, labelText, type, required, choices]) => {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    if (type === 'textarea') wrap.style.gridColumn = '1 / -1';
    const label = document.createElement('label');
    label.htmlFor = `full-demo-${key}`;
    label.textContent = `${labelText}${required ? ' *' : ''}`;
    let input;
    if (type === 'select') {
      input = document.createElement('select');
      (choices || []).forEach((choice) => {
        const option = document.createElement('option');
        option.value = choice.startsWith('Agencia ·') || choice === 'Sin asignar' || choice === 'Sin asociación' ? '' : choice;
        option.textContent = choice;
        input.append(option);
      });
    } else if (type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 3;
    } else {
      input = document.createElement('input');
      input.type = type;
      if (choices) input.placeholder = choices;
    }
    input.id = `full-demo-${key}`;
    input.name = key;
    input.dataset.field = key;
    if (required) input.required = true;
    const value = record?.[key];
    if (value !== undefined && value !== null && input.type !== 'file') input.value = value;
    wrap.append(label, input);
    body.append(wrap);
  });
  body.dataset.formAction = action;
  body.dataset.editId = record?.id || '';
  backdrop.classList.add('show');
  body.querySelector('input,select,textarea')?.focus();
}

function formValues() {
  const values = {};
  document.querySelectorAll('#modalBody [data-field]').forEach((field) => {
    values[field.dataset.field] = field.type === 'file' ? (field.files?.[0]?.name || '') : field.value.trim();
  });
  return values;
}

function upsert(action, existing) {
  const body = document.getElementById('modalBody');
  const config = formMarkup[action];
  const fields = [...body.querySelectorAll('[data-field]')];
  const invalid = fields.find((field) => !field.checkValidity());
  if (invalid) { invalid.reportValidity(); invalid.focus(); return; }
  const values = formValues();
  if (config.kind === 'agency') {
    state.agency = { ...state.agency, ...values, updatedAt: now() };
    logActivity('agency-updated', `Actualizados datos y branding de ${state.agency.publicName}`, 'agency');
    save(); document.getElementById('modalback').classList.remove('show'); render();
    toast('Agencia y branding actualizados localmente · Demo'); return;
  }
  const list = collectionFor(config.kind);
  if (config.kind === 'claim') {
    const client = ensureClient(values.customer, values.email);
    values.clientId = client?.id;
    values.ocsId = existing?.ocsId || `OCS-DEMO-${String(Date.now()).slice(-5)}`;
    values.stage = existing?.stage || 'Intake · Demo';
    values.clientStage = existing?.clientStage || 'Review · Demo';
    values.status = existing?.status || 'Abierto';
  }
  if (config.kind === 'document' && !values.fileName) values.fileName = existing?.fileName || 'archivo-demo.pdf';
  if (config.kind === 'task') values.status = existing?.status || 'Pendiente';
  if (config.kind === 'client') values.policyholders = [values.name, values.policyholder].filter(Boolean);
  const previousName = existing?.name || '';
  const saved = { ...existing, ...values, id: existing?.id || makeId(config.kind.toUpperCase()), createdAt: existing?.createdAt || now(), updatedAt: now() };
  const index = list.findIndex((item) => item.id === saved.id);
  if (index >= 0) list[index] = saved;
  else list.unshift(saved);
  if (config.kind === 'workflow') state.activeWorkflowId = saved.id;
  if (config.kind === 'client') {
    state.claims.forEach((claim) => {
      const linkedByName = previousName && claim.customer?.trim().toLocaleLowerCase() === previousName.trim().toLocaleLowerCase();
      if (claim.clientId === saved.id || linkedByName) { claim.clientId = saved.id; claim.customer = saved.name; claim.email = saved.email || ''; }
    });
  }
  logActivity(existing ? `${config.kind}-updated` : `${config.kind}-created`, `${existing ? 'Actualizado' : 'Creado'} ${config.kind} demo: ${saved.title || saved.name || saved.ocsId}`, saved.id);
  save();
  document.getElementById('modalback').classList.remove('show');
  render();
  toast(`${existing ? 'Cambios guardados' : 'Elemento creado'} localmente · Demo`);
}

function findEntity(kind, id) {
  if (kind === 'agency') return state.agency;
  return collectionFor(kind).find((item) => item.id === id);
}

function doDelete(kind, id) {
  const record = findEntity(kind, id);
  if (!record) return;
  const label = record.title || record.name || record.ocsId;
  askConfirmation('Eliminar elemento de demo', `¿Eliminar “${label}” de esta demo local? Esta acción no afecta ningún servicio externo.`, () => doDeleteConfirmed(kind, id), 'Eliminar');
}

function doDeleteConfirmed(kind, id) {
  const record = findEntity(kind, id);
  if (!record) return;
  const label = record.title || record.name || record.ocsId;
  if (kind === 'user' && record.role === 'Admin' && record.status === 'Activo' && state.users.filter((user) => user.role === 'Admin' && user.status === 'Activo').length <= 1) {
    toast('No se puede eliminar el último Admin activo de la agencia demo.'); return;
  }
  const key = entityStores[kind];
  state[key] = state[key].filter((item) => item.id !== id);
  if (kind === 'claim') state.tasks.forEach((task) => { if (task.relatedClaim === record.ocsId) task.relatedClaim = ''; });
  if (kind === 'client') state.claims.forEach((claim) => { if (claim.clientId === id) claim.clientId = ''; });
  logActivity(`${kind}-deleted`, `Eliminado ${kind} demo: ${label}`, id);
  save();
  render();
  toast('Elemento eliminado localmente · Demo');
}

function addEntityButtons() {
  const configs = [
    ['customer', 'Clientes', 'new-client'],
    ['customdata', 'Clientes', 'new-client'],
    ['tasks', 'Tareas', 'new-task'],
    ['calendar', 'Eventos', 'new-event'],
    ['documents', 'Templates', 'new-template'],
    ['templates', 'Templates', 'new-template'],
    ['admin', 'Usuarios', 'new-user'], ['workflows', 'Reglas', 'new-workflow'], ['automations', 'Automatizaciones', 'new-workflow'],
    ['documents', 'Adjuntos', 'new-document'], ['support', 'Tickets', 'new-support'], ['portal', 'Solicitudes', 'new-portal'],
    ['email', 'Borrador', 'new-communication'], ['phone', 'Nota / SMS demo', 'new-communication'],
    ['accounting', 'Conciliación', 'new-reconciliation'], ['customdata', 'Campo demo', 'new-customfield'],
  ];
  configs.forEach(([screenId, label, action]) => {
    const screen = document.getElementById(screenId);
    const screenHead = screen?.querySelector('.screenhead');
    if (!screenHead) return;
    let actions = screenHead.querySelector('.actions');
    if (!actions) { actions = document.createElement('div'); actions.className = 'actions'; screenHead.append(actions); }
    if (actions.querySelector(`[data-full-demo-action="${action}"]`)) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn';
    button.dataset.fullDemoAction = action;
    const labels = { customer: 'Nuevo cliente', customdata: action === 'new-customfield' ? 'Nuevo campo' : 'Nuevo cliente', tasks: 'Nueva tarea', calendar: 'Nuevo evento', documents: action === 'new-document' ? 'Nuevo adjunto' : 'Nuevo template', templates: 'Nuevo template', admin: 'Nuevo usuario', workflows: 'Nueva fase / regla', automations: 'Nueva regla demo', support: 'Nuevo ticket', portal: 'Nueva solicitud', email: 'Nuevo borrador', phone: 'Nueva nota / SMS', accounting: 'Nueva nota local' };
    button.textContent = `＋ ${labels[screenId] || 'Nuevo elemento'}`;
    button.setAttribute('aria-label', `${button.textContent} · crear registro ficticio`);
    actions.prepend(button);
  });
  const adminActions = document.querySelector('#admin .screenhead .actions');
  if (adminActions && !adminActions.querySelector('[data-full-demo-action="new-agency"]')) {
    const editBrand = document.createElement('button'); editBrand.type = 'button'; editBrand.className = 'btn';
    editBrand.dataset.fullDemoAction = 'new-agency'; editBrand.textContent = 'Editar agencia / branding'; adminActions.prepend(editBrand);
  }
}

function installStyles() {
  if (document.getElementById('full-demo-styles')) return;
    const style = document.createElement('style');
  style.id = 'full-demo-styles';
  style.textContent = `
    /* Visual direction adapted from the supplied dashboard reference: soft sage surfaces, quiet chrome, pastel status cards. */
    :root{--ink:#242a29;--muted:#74807b;--line:#e1e9e5;--canvas:#edf3f0;--white:#fff;--violet:#6558d9;--violet2:#efedff;--violet3:#dedaff;--navy:#252a31;--green:#328c70;--greenbg:#e5f4ed;--amber:#a66e32;--amberbg:#fff2df;--red:#bf6574;--redbg:#ffedf0;--blue:#5d79d5;--bluebg:#edf1ff;--shadow:0 6px 18px rgba(42,67,56,.055);--radius:16px}
    body{background:var(--canvas)}.rail{background:#f4f8f6;border-color:#e1e9e5}.logo{background:#6558d9;border-radius:11px}.sidebar-expanded .railbtn.active,.railbtn.active{background:#e8e6ff;color:#5b4dcc}.top{background:#f5f8f6ed;border-color:#e1e9e5}.topnav{height:36px;padding:0 5px;border-radius:999px;background:#e8eeea}.topnav button{height:28px;border-radius:999px}.topnav button.active{background:#6558d9;color:#fff}.topnav button.active:after{display:none}.search{background:#f9fbfa;border-color:#e2eae6}.page{padding-top:27px}.h1{font-size:25px;letter-spacing:-.04em}.card{border-color:#e1e9e5;box-shadow:0 5px 16px rgba(42,67,56,.045);border-radius:16px}.btn{border-color:#dfe7e3;border-radius:10px}.btn.primary{background:#6558d9;border-color:#6558d9;box-shadow:0 4px 12px #6558d926}.filter,.tinybtn{border-color:#e0e8e4;background:#fafcfb}.tablewrap{border-radius:10px}.tab.active{color:#5b4dcc}.count{background:#efedff;color:#5b4dcc}.miniavatar,.railavatar{background:#ebe9ff;color:#5b4dcc}
    #dashboard .metric{border-color:transparent;box-shadow:none;min-height:103px}#dashboard .metric:nth-child(1){background:#e9efff}#dashboard .metric:nth-child(2){background:#fff0ed}#dashboard .metric:nth-child(3){background:#e5f3eb}#dashboard .metric:nth-child(4){background:#fff4df}#dashboard .metric:nth-child(5){background:#e6f2ef}#dashboard .metric:nth-child(1) .metricico{background:#dce5ff;color:#526bc5}#dashboard .metric:nth-child(2) .metricico{background:#ffe1dd;color:#bf6574}#dashboard .metric:nth-child(3) .metricico{background:#d7ecdf;color:#328c70}#dashboard .metric:nth-child(4) .metricico{background:#ffe8bd;color:#a66e32}#dashboard .metric:nth-child(5) .metricico{background:#d9ece6;color:#328c70}#dashboard .screenhead{align-items:center}#dashboard .screenhead .h1{font-size:28px}#dashboard .dashboardgrid>.card{border-color:#e3eae6}#dashboard .focusitem{border-color:#e8eeeb}#dashboard .calendarmini .sel{background:#6558d9}
    .full-demo-records{margin:12px 0}.full-demo-record-list{display:grid;gap:8px}
    .full-demo-record{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid var(--line)}
    .full-demo-record-copy{display:grid;gap:3px;min-width:0}.full-demo-record-copy strong{font-size:11px}.full-demo-record-copy small{font-size:9px;color:var(--muted)}
    .local-row-actions{white-space:nowrap}.local-row-actions .btn{margin:2px}#dashboard .card.metric[role="button"],#dashboard .focusitem[role="button"]{cursor:pointer}#dashboard .card.metric[role="button"]:hover,#dashboard .focusitem[role="button"]:hover{outline:1px solid var(--violet3)}
    .saved-claim-views{display:flex;align-items:center;gap:6px;overflow:auto;padding:4px 0 10px;scrollbar-width:none}.saved-claim-views::-webkit-scrollbar{display:none}.demo-action-feedback{margin:10px 0;padding:11px 14px;border-color:var(--violet3);background:var(--violet2)}.demo-action-feedback strong{font-size:10px}.demo-action-feedback p{margin:4px 0 0}
    .task-list-view{display:grid!important;grid-template-columns:1fr!important}.task-list-view .boardcol{min-width:0}.task-list-view .taskcard{max-width:none}.source-selected{outline:2px solid var(--violet)!important;background:var(--violet2)!important}.folder-view-demo tbody tr{display:grid;grid-template-columns:1fr;gap:4px;border-bottom:1px solid var(--line);padding:9px}.folder-view-demo tbody td{border:0}.screen .tab[role="tab"]{cursor:pointer}.screen .tab[role="tab"]:focus-visible,.screen .subnav button:focus-visible{outline:3px solid #a89dff88;outline-offset:1px}
    @media(min-width:621px) and (max-width:900px){.topright{max-width:calc(100vw - 516px);flex-wrap:wrap;justify-content:flex-end}.main,.page,.screen,.screen .grid,.screen .card{min-width:0;max-width:100%}.screen .grid,.screen .pagecols{grid-template-columns:minmax(0,1fr)!important}.screen .pagecols>*{min-width:0}.tablewrap{max-width:100%;overflow-x:auto;scrollbar-width:none}.tablewrap::-webkit-scrollbar{display:none}.screen .boardhead{flex-wrap:wrap}}
    @media(max-width:620px){.rail,body.sidebar-expanded .rail{display:none!important}body.mobile-nav-open:before{content:"";position:fixed;inset:0;background:#10182855;z-index:79}.nav-popover.show{position:fixed;inset:auto 0 0!important;width:auto!important;max-height:82vh!important;overflow:auto!important;padding:18px 16px 24px!important;border-radius:18px 18px 0 0!important;z-index:80}.nav-popover .mobile-sheet-head{display:flex;align-items:center;justify-content:space-between;padding:0 4px 12px;border-bottom:1px solid var(--line);margin-bottom:8px}.nav-popover .mobile-sheet-head strong{font-size:14px}.nav-popover .mobile-sheet-close{width:32px;height:32px;border:0;border-radius:50%;background:#f1f2f5;font-size:18px}.nav-popover .mobile-nav-group{border-bottom:1px solid #f0f1f5}.nav-popover .mobile-nav-group>button{height:auto;min-height:42px;justify-content:space-between;font-weight:750;font-size:10px;letter-spacing:.04em}.nav-popover .mobile-nav-group>button span:first-child{width:auto!important;flex:1;text-align:left}.nav-popover .mobile-nav-items{padding:0 0 8px}.nav-popover .mobile-nav-items button{height:auto;min-height:42px;font-size:12px}.nav-popover .mobile-nav-items[hidden]{display:none}}
    @media(max-width:620px){.full-demo-record{align-items:flex-start;flex-direction:column}.full-demo-record .actions{width:100%;flex-wrap:wrap}.local-row-actions{white-space:normal}}
  `;
  document.head.append(style);
}

function chooseTab(tab) {
  const screen = tab.closest('.screen');
  if (!screen || tab.dataset.screen) return false;
  const screenId = screen.id;
  const label = tab.innerText.trim().replace(/\s+/g, ' ');
  tab.parentElement.querySelectorAll('.tab,.subnav button').forEach((item) => {
    item.classList.toggle('active', item === tab);
    if (item.matches('.tab')) { item.setAttribute('role', 'tab'); item.setAttribute('aria-selected', String(item === tab)); }
  });
  state.uiViews ||= {};
  state.uiViews[screenId] = label;
  save();

  if (screenId === 'claims') {
    const filter = /my work/i.test(label) ? 'My claims' : /urgent/i.test(label) ? 'Urgent' : /awaiting carrier/i.test(label) ? 'Awaiting carrier' : /archive/i.test(label) ? 'Archived' : 'All claims';
    applyClaimFilter(filter); return true;
  }
  if (screenId === 'dashboard' && tab.closest('.queueTabs')) { applyDashboardQueue(label); toast(`Bandeja filtrada · ${label} · demo local`); return true; }
  if (screenId === 'claim') {
    if (/contacts/i.test(label)) { window.go?.('customer'); return true; }
    if (/documents|files/i.test(label)) { window.go?.('documents'); return true; }
    if (/tasks/i.test(label)) { window.go?.('tasks'); return true; }
    if (/email|communication/i.test(label)) { window.go?.('email'); return true; }
    if (/workflow|process/i.test(label)) { window.go?.('workflows'); return true; }
    const selector = /activity/i.test(label) ? '.activity' : /overview/i.test(label) ? '.detailtop' : '';
    if (selector) screen.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (/financial/i.test(label)) window.go?.('accounting');
    toast(`${label} · vista del expediente demo`); return true;
  }
  if (screenId === 'tasks') {
    if (/calendar/i.test(label)) { window.go?.('calendar'); return true; }
    if (/activity log/i.test(label)) { screen.querySelector('.card.mt .cardtitle')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); toast('Historial de movimientos de tareas · demo local'); return true; }
    const board = screen.querySelector('.board');
    if (board) {
      board.dataset.view = /my work/i.test(label) ? 'mine' : /list/i.test(label) ? 'list' : 'board';
      board.classList.toggle('task-list-view', board.dataset.view !== 'board');
      const cards = [...board.querySelectorAll('.taskcard')];
      cards.forEach((card) => { card.hidden = board.dataset.view === 'mine' && !/alex parker|a\. parker|jordan rivera|j\. rivera/i.test(card.innerText); });
      board.querySelector('.demo-task-empty')?.remove();
      if (board.dataset.view === 'mine' && !cards.some((card) => !card.hidden)) {
        const empty = document.createElement('p'); empty.className = 'smalltxt demo-task-empty'; empty.textContent = 'No hay tareas asignadas al rol demo seleccionado.'; board.prepend(empty);
      }
    }
    toast(`Vista de tareas: ${label} · demo local`); return true;
  }
  if (screenId === 'documents') {
    if (/template library/i.test(label)) { window.go?.('templates'); return true; }
    if (/signature requests/i.test(label)) { window.go?.('signatures'); return true; }
    if (/review queue/i.test(label)) { window.go?.('approvals'); return true; }
    if (/client uploads/i.test(label)) { window.go?.('portal'); return true; }
    if (/document activity/i.test(label)) { window.go?.('support'); return true; }
    const query = /client-visible/i.test(label) ? 'client visible' : /^internal$/i.test(label) ? 'internal' : /generated/i.test(label) ? 'template' : /needs review/i.test(label) ? 'review' : '';
    state.moduleFilters ||= {}; state.moduleFilters.documents = query; applyModuleFilter('documents', query);
    toast(query ? `Documentos filtrados · ${label}` : 'Todos los documentos de demo'); return true;
  }
  if (screenId === 'customdata') {
    if (tab.closest('.subnav')) {
      if (tab.dataset.savedDataView) { const view = (state.savedDataViews || []).find((item) => item.id === tab.dataset.savedDataView); if (view) { state.moduleFilters ||= {}; state.moduleFilters.customdata = view.query || ''; applyModuleFilter('customdata', view.query || ''); save(); toast(`Vista “${view.name}” aplicada`); } return true; }
      if (/create view/i.test(label)) { openDataViewDialog(); return true; }
      const query = /^all claims/i.test(label) ? '' : /my assigned/i.test(label) ? 'Jordan' : /awaiting carrier/i.test(label) ? 'carrier' : /urgent/i.test(label) ? 'urgent' : /closed archive/i.test(label) ? 'closed' : '';
      state.moduleFilters ||= {}; state.moduleFilters.customdata = query; applyModuleFilter('customdata', query); toast(`Vista guardada aplicada · ${label}`); return true;
    }
    if (/^\+?\s*table$/i.test(label)) { openForm('new-table'); return true; }
    const query = /^claims$/i.test(label) ? 'OCS-' : /^clients$/i.test(label) ? 'Maria' : /^properties$/i.test(label) ? 'Orlando' : /^participants$/i.test(label) ? 'Jordan' : /^tasks$/i.test(label) ? 'follow-up' : /^documents$/i.test(label) ? 'pdf' : '';
    state.activeDataTable = label; state.moduleFilters ||= {}; state.moduleFilters.customdata = query;
    applyModuleFilter('customdata', query); toast(`Tabla seleccionada · ${label} · datos demo`); return true;
  }
  if (screenId === 'automations') {
    const query = /^drafts/i.test(label) ? 'draft' : /runs/i.test(label) ? 'run|error|history' : '';
    state.moduleFilters ||= {}; state.moduleFilters.automations = query; applyModuleFilter('automations', query);
    toast(`Automatizaciones: ${label} · simulación local`); return true;
  }
  if (screenId === 'signatures') {
    const rows = [...screen.querySelectorAll('tbody tr')];
    const matcher = /^all envelopes/i.test(label) ? null : /needs my action|waiting on signer/i.test(label) ? /pending|waiting|sent/i : /completed/i.test(label) ? /completed/i : /declined|expired/i.test(label) ? /declined|expired/i : null;
    rows.forEach((row) => { row.hidden = Boolean(matcher && !matcher.test(row.innerText)); });
    screen.querySelector('.demo-signature-empty')?.remove();
    if (matcher && !rows.some((row) => !row.hidden)) {
      const empty = document.createElement('p'); empty.className = 'smalltxt demo-signature-empty'; empty.setAttribute('role', 'status'); empty.textContent = `No hay paquetes en “${label}” dentro de los datos ficticios.`; screen.querySelector('.tablewrap')?.after(empty);
    }
    toast(`Paquetes filtrados · ${label} · demo`); return true;
  }
  if (screenId === 'import' && tab.closest('.subnav')) {
    const step = Number(label.match(/^\d+/)?.[0] || 1);
    state.importStep = step; save();
    screen.querySelectorAll('.stepper span').forEach((dot, index) => dot.classList.toggle('on', index < Math.ceil(step * 5 / 7)));
    const title = screen.querySelector('.pagecols > .card:last-child .cardtitle');
    if (title) title.textContent = ['Choose source and verification date', 'Select source tables or sheets', 'Map source fields to OCS', 'Match synthetic customer records', 'Resolve sample conflicts', 'Review the local import preview', 'Confirm this demo preview'][step - 1] || 'Import demo';
    const status = screen.querySelector('.pagecols > .card:last-child .messagepreview');
    if (status) status.textContent = `Paso ${step} de 7 · ${label.replace(/^\d+\s*·\s*/, '')}. Vista previa con datos ficticios; no se consulta ni modifica ningún servicio.`;
    toast(`Paso ${step}/7 seleccionado · sin importación externa`); return true;
  }
  if (screenId === 'admin' && tab.closest('.subnav')) {
    const route = /users|roles/i.test(label) ? 'admin' : /custom field/i.test(label) ? 'customdata' : /claim process|required documents/i.test(label) ? 'workflows' : /automation/i.test(label) ? 'automations' : /portal visibility/i.test(label) ? 'portal' : /offline/i.test(label) ? 'offline' : /branding|language/i.test(label) ? 'admin' : /AI providers/i.test(label) ? 'ai' : /retention|backup/i.test(label) ? 'backups' : 'admin';
    if (route !== 'admin') { window.go?.(route); return true; }
    toast(`Configuración seleccionada · ${label} · demo`); return true;
  }
  if (tab.closest('.subnav') && screenId === 'templates') return false;
  toast(`Vista seleccionada · ${label} · datos ficticios`); return true;
}

function openLocalFileDialog(titleText = 'Seleccionar archivo local de demo') {
  const backdrop = document.getElementById('modalback'); const body = document.getElementById('modalBody');
  document.getElementById('modalTitle').textContent = titleText;
  document.getElementById('modalDesc').textContent = 'El archivo solo se previsualiza en este navegador; no se sube ni se comparte.';
  body.replaceChildren();
  const label = document.createElement('label'); label.className = 'field'; label.textContent = 'Archivo de prueba';
  const input = document.createElement('input'); input.type = 'file'; input.name = 'localDemoFile'; input.setAttribute('aria-label', 'Archivo de prueba local');
  label.append(input); body.append(label); body.dataset.formAction = 'local-file'; delete body.dataset.editId;
  backdrop.querySelector('[data-action="modal-confirm"]').textContent = 'Cerrar vista previa'; backdrop.classList.add('show'); input.focus();
}

function saveSimulationRecord(kind, fields, message) {
  const record = { id: makeId(kind.toUpperCase()), ...fields, status: fields.status || 'Demo local', createdAt: now(), updatedAt: now() };
  state[entityStores[kind]].unshift(record); logActivity(`${kind}-created`, message, record.id); save(); render(); toast(message); return record;
}

function handleSemanticControl(button, event) {
  const screen = button.closest('.screen'); const screenId = screen?.id || '';
  const label = button.innerText.trim().replace(/\s+/g, ' '); const lower = label.toLocaleLowerCase();
  const currentClaimId = window.currentClaimId || 'OCS-26-01482';
  const selectedClaim = state.claims.find((claim) => claim.ocsId === currentClaimId) || claimFromFixture(currentClaimId);
  if (screenId === 'claim' && /edit details/i.test(label)) { openForm('new-claim', selectedClaim); return true; }
  if (screenId === 'claim' && /filter activity/i.test(label)) { openModuleFilterDialog('claim', 'actividad del claim'); return true; }
  if (screenId === 'claim' && /load earlier activity/i.test(label)) {
    const activity = screen.querySelector('.activity'); const row = document.createElement('div'); row.className = 'activityrow'; row.innerHTML = '<span class="activityicon">◷</span><div><b>Actividad anterior de demostración</b><p>Nota histórica sintética cargada localmente para mostrar la cronología.</p><small>Oct 10 · Alex Parker · Solo demo</small></div>'; activity?.prepend(row); button.disabled = true; button.textContent = 'No hay más actividad · Demo'; return true;
  }
  if (screenId === 'claim' && label === '•••') { window.go?.('viewer'); return true; }
  if (screenId === 'ai' && /^new chat$/i.test(label)) { state.aiMessages = []; state.aiPrompt = ''; save(); renderAiMessages(); toast('Conversación de demo reiniciada localmente'); return true; }
  if (screenId === 'ai' && /^open claim$/i.test(label)) { window.go?.('claim'); return true; }
  if (screenId === 'ai' && /^show source email$/i.test(label)) { window.go?.('email'); return true; }
  if (screenId === 'customer' && /editar perfil/i.test(label)) { const client = clientByName('Maria Gonzalez'); openForm('new-client', client); return true; }
  if (screenId === 'customer' && /más (reciente|antiguo) primero/i.test(label)) {
    state.moduleSorts ||= {}; state.moduleSorts.customer = state.moduleSorts.customer === 'oldest' ? 'newest' : 'oldest';
    const rows = [...screen.querySelectorAll('tbody tr')]; if (state.moduleSorts.customer === 'oldest') rows.reverse(); rows.forEach((row) => row.parentElement.append(row));
    button.textContent = state.moduleSorts.customer === 'oldest' ? 'Más antiguo primero⌄' : 'Más reciente primero⌄'; save(); toast('Historial ordenado · preferencia local'); return true;
  }
  if (screenId === 'portal') {
    if (/view as spanish/i.test(label) || /^(en|es)⌄$/i.test(label)) {
      state.portalLanguage = /spanish|^es/i.test(label) ? 'es' : 'en'; save();
      const title = screen.querySelector('.clientbody h2'); if (title) title.textContent = state.portalLanguage === 'es' ? 'Tu reclamo está en revisión' : 'Your claim is under review';
      toast(`Idioma de portal: ${state.portalLanguage.toUpperCase()} · demo local`); return true;
    }
    if (/configure portal visibility/i.test(label)) { window.go?.('admin'); return true; }
    if (/^view all$/i.test(label)) { window.go?.('documents'); return true; }
    if (/^help$/i.test(label)) { window.go?.('support'); return true; }
    if (/chat with ocs assistant/i.test(label)) { window.go?.('ai'); return true; }
    if (/request an agent/i.test(label)) { window.go?.('support'); return true; }
    if (/ask a question|message your claim team/i.test(label)) { openForm('new-communication'); return true; }
    if (/upload photos/i.test(label)) { openLocalFileDialog('Subir fotos · vista previa local'); return true; }
    if (/^confirm$/i.test(label)) {
      const record = saveSimulationRecord('portal', { title: 'Cita confirmada desde portal demo', type: 'Cita', relatedClaim: 'OCS-26-01482', status: 'Confirmado · demo' }, 'Cita confirmada localmente · no se notificó a nadie');
      const badge = screen.querySelector('.eventrow .pill'); if (badge) badge.textContent = record.status; return true;
    }
  }
  if (screenId === 'email' && /^preview$/i.test(label)) {
    const row = button.closest('tr,.inboxitem,.emailrow');
    const body = document.getElementById('modalBody'); body.replaceChildren();
    const preview = document.createElement('p'); preview.className = 'smalltxt'; preview.textContent = row?.innerText || 'Vista previa de un mensaje ficticio. No se accedió a un buzón.'; body.append(preview);
    document.getElementById('modalTitle').textContent = 'Vista previa de correo demo'; document.getElementById('modalDesc').textContent = 'Contenido sintético · sin conexión a Gmail.'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return true;
  }
  if ((screenId === 'email' || screenId === 'phone') && /compose|new sms/i.test(label)) { openForm('new-communication'); return true; }
  if ((screenId === 'email' || screenId === 'phone') && /^(send|review & send)$/i.test(label)) {
    const content = screen.querySelector('textarea')?.value.trim() || 'Borrador de prueba';
    saveSimulationRecord('communication', { title: screenId === 'phone' ? 'SMS de demostración' : 'Respuesta de demostración', channel: screenId === 'phone' ? 'SMS' : 'Email', contact: 'Contacto ficticio', content, relatedClaim: 'OCS-26-01482', status: 'Borrador local · requiere aprobación' }, 'Borrador creado para aprobación · no se envió');
    window.go?.('approvals'); return true;
  }
  if (screenId === 'email' && /^change claim$/i.test(label)) {
    const body = document.getElementById('modalBody'); body.replaceChildren(); const wrapper = document.createElement('div'); wrapper.className = 'field'; const labelNode = document.createElement('label'); labelNode.htmlFor = 'email-match-claim'; labelNode.textContent = 'Asociar con claim demo';
    const select = document.createElement('select'); select.id = 'email-match-claim'; select.dataset.field = 'relatedClaim'; select.required = true; state.claims.forEach((claim) => { const option = document.createElement('option'); option.value = claim.ocsId; option.textContent = `${claim.ocsId} · ${claim.customer}`; select.append(option); }); wrapper.append(labelNode, select); body.append(wrapper);
    body.dataset.formAction = 'email-match'; body.dataset.emailId = button.dataset.emailId || state.activeEmail || 'Citizens Claims · Maria Gonzalez'; document.getElementById('modalTitle').textContent = 'Cambiar asociación del email'; document.getElementById('modalDesc').textContent = 'Asociación ficticia local · el correo no se mueve ni se envía.'; document.getElementById('modalback').classList.add('show'); return true;
  }
  if (screenId === 'email' && /^attach file$/i.test(label)) { openLocalFileDialog('Adjuntar archivo · solo demo local'); return true; }
  if (screenId === 'phone' && /details|open thread|match contact/i.test(label)) {
    if (/match contact/i.test(label)) { openForm('new-client'); return true; }
    const row = button.closest('tr,.activityrow,.inboxitem'); const body = document.getElementById('modalBody'); body.replaceChildren();
    const detail = document.createElement('p'); detail.className = 'smalltxt'; detail.textContent = row?.innerText || 'Registro de llamada sintético'; body.append(detail);
    document.getElementById('modalTitle').textContent = 'Actividad de llamada · demo'; document.getElementById('modalDesc').textContent = 'Registro ficticio · ninguna llamada se realizó.'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return true;
  }
  if (screenId === 'templates' && /^cancel$/i.test(label)) { window.go?.('documents'); return true; }
  if (screenId === 'templates' && /save mapping/i.test(label)) {
    const mappings = [...screen.querySelectorAll('.mappingrow[data-local-mapping]')].map((row) => ({ pdfField: row.querySelector('input')?.value.trim() || '', ocsField: row.querySelector('select')?.value || '' }));
    const invalid = mappings.find((mapping) => !mapping.pdfField);
    if (invalid) { screen.querySelector('.mappingrow[data-local-mapping] input')?.focus(); toast('Completa el nombre del campo PDF antes de guardar el mapeo'); return true; }
    state.templateMappings = mappings; saveSimulationRecord('template', { title: 'LOR · mapeo demo', type: 'Carta', visibility: 'Interno', format: 'PDF preview' }, 'Mapeo guardado localmente como template de demo'); return true;
  }
  if (screenId === 'templates' && /add mapping/i.test(label)) {
    const list = screen.querySelector('.mappingrow')?.parentElement; const row = document.createElement('div'); row.className = 'mappingrow'; row.dataset.localMapping = 'true';
    const name = document.createElement('input'); name.placeholder = 'Nombre del campo PDF'; name.setAttribute('aria-label', 'Nombre del campo PDF');
    const arrow = document.createElement('span'); arrow.textContent = '→';
    const select = document.createElement('select'); select.setAttribute('aria-label', 'Campo OCS asociado'); ['Policyholder · display name', 'Loss address', 'Loss date', 'Carrier claim number'].forEach((v) => { const o = document.createElement('option'); o.textContent = v; select.append(o); });
    row.append(name, arrow, select); list?.append(row); toast('Fila de mapeo local agregada'); return true;
  }
  if (screenId === 'templates' && /^(‹|›|1 \/ 2)$/i.test(label)) {
    state.templatePage = label === '›' ? 2 : label === '‹' ? 1 : (state.templatePage === 2 ? 2 : 1);
    const subtitle = screen.querySelector('.cardsub'); if (subtitle) subtitle.textContent = `Letter of Representation — page ${state.templatePage} of 2 · Preview demo`;
    save(); toast(`Página ${state.templatePage} del template · Demo`); return true;
  }
  if ((screenId === 'workflows' || screenId === 'automations') && /publish/i.test(label)) {
    const name = screen.querySelector('.cardtitle')?.textContent.trim() || 'Regla de demo';
    const existing = state.workflows.find((item) => item.id === state.activeWorkflowId) || state.workflows.find((item) => item.title === name) || state.workflows[0];
    if (existing) { existing.status = 'Activo · demo'; existing.updatedAt = now(); save(); render(); }
    else saveSimulationRecord('workflow', { title: name, trigger: 'Validación local de muestra', action: 'Ejecutar solo dentro de la demo', status: 'Activo · demo' }, 'Versión activada únicamente en la demostración');
    toast('Versión activada únicamente en la demostración'); return true;
  }
  if ((screenId === 'workflows' || screenId === 'automations') && /add condition|add action/i.test(label)) {
    const entry = { id: makeId('RULEPART'), screen: screenId, label: `${/condition/i.test(label) ? 'Condición' : 'Acción'} nueva · configuración sintética pendiente`, at: now() };
    state.workflowDraftItems ||= []; state.workflowDraftItems.push(entry); save(); render(); toast(`${entry.label} · demo`); return true;
  }
  if (screenId === 'automations' && /test against/i.test(label)) {
    const body = document.getElementById('modalBody'); body.replaceChildren();
    const p = document.createElement('p'); p.className = 'smalltxt'; p.textContent = 'Simulación en 50 claims sintéticos: 7 coincidencias, 0 mensajes enviados, 0 cambios externos. La prueba no lee expedientes ni ejecuta reglas reales.'; body.append(p);
    document.getElementById('modalTitle').textContent = 'Resultado de prueba · dry run'; document.getElementById('modalDesc').textContent = 'Solo fixtures ficticios locales'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return true;
  }
  if ((screenId === 'workflows' || screenId === 'automations') && /version history|run history/i.test(label)) {
    const entries = state.activity.filter((item) => /workflow|rule|automat/i.test(`${item.type} ${item.summary}`)).slice(0, 8);
    const body = document.getElementById('modalBody'); body.replaceChildren();
    const list = document.createElement('div'); list.className = 'record-list';
    (entries.length ? entries : [{ summary: 'Sin ejecuciones previas; crea una regla local para empezar.', createdAt: now() }]).forEach((item) => {
      const row = document.createElement('p'); row.className = 'smalltxt'; row.textContent = `${item.label || item.summary || 'Ejecución demo'} · ${item.at || item.createdAt ? new Date(item.at || item.createdAt).toLocaleString() : 'sin fecha'} · solo demo`; list.append(row);
    });
    body.append(list); document.getElementById('modalTitle').textContent = /version/i.test(label) ? 'Historial de versiones' : 'Historial de ejecuciones';
    document.getElementById('modalDesc').textContent = 'Registro local sintético. No se ejecutó ninguna automatización real.'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return true;
  }
  if (screenId === 'import' && /save mapping/i.test(label)) {
    state.importMapping = { source: state.importSource || 'Fuente demo', savedAt: now(), fields: ['policyholder', 'claimId', 'lossDate'], status: 'Mapeo local · no importado' }; save();
    const note = screen.querySelector('.module-note') || document.createElement('p'); note.className = 'module-note'; note.textContent = `Mapeo de ${state.importMapping.source} guardado localmente · no se conectó ni importó ninguna fuente.`; screen.querySelector('.screenhead')?.after(note); toast('Mapeo guardado solo en esta demo'); return true;
  }
  if (screenId === 'reports' && /save report/i.test(label)) {
    saveSimulationRecord('report', { title: 'Reporte de desempeño · demo', filters: state.moduleFilters?.reports || '', description: 'Captura de filtros local', status: 'Guardado · demo' }, 'Reporte guardado en localStorage · Demo'); return true;
  }
  if (screenId === 'reports' && /^export$/i.test(label)) {
    const rows = [['Métrica', 'Valor ficticio'], ['Claims abiertos', '126'], ['Días medianos por fase', '18.4'], ['Tareas a tiempo', '92%']];
    const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'ocs-reporte-demo.csv'; link.click(); URL.revokeObjectURL(url); toast('Exportación sintética descargada localmente'); return true;
  }
  if (screenId === 'reports' && /open assignments/i.test(label)) { window.go?.('tasks'); return true; }
  if (screenId === 'reports' && /metric definition/i.test(label)) {
    const body = document.getElementById('modalBody'); body.replaceChildren(); const p = document.createElement('p'); p.className = 'smalltxt'; p.textContent = 'Los KPIs del reporte se calculan sobre fixtures sintéticos de la demo; no representan datos reales ni una consulta a fuentes externas.'; body.append(p);
    document.getElementById('modalTitle').textContent = 'Definición de métricas'; document.getElementById('modalDesc').textContent = 'Origen y alcance · Demo'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return true;
  }
  if (screenId === 'signatures' && /export audit records/i.test(label)) {
    const csv = [['Evento', 'Paquete', 'Estado'], ['Solicitud de firma', 'Acuerdo de demo', 'Simulada'], ['Recordatorio', 'Acuerdo de demo', 'No enviado']].map((row) => row.join(',')).join('\n');
    const link = document.createElement('a'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); link.href = url; link.download = 'ocs-audit-firmas-demo.csv'; link.click(); URL.revokeObjectURL(url); toast('Auditoría sintética descargada · sin datos de firmas reales'); return true;
  }
  if (screenId === 'signatures' && /send reminder/i.test(label)) {
    state.signatureReminderAt = now(); save(); const row = screen.querySelector('tbody tr'); if (row) { const status = row.querySelector('.pill'); if (status) status.textContent = 'Recordatorio simulado · no enviado'; }
    toast('Recordatorio registrado en demo · no se envió'); return true;
  }
  if (screenId === 'signatures' && /open signed preview/i.test(label)) { window.go?.('viewer'); return true; }
  if (screenId === 'integrations' && /integration activity log/i.test(label)) {
    const body = document.getElementById('modalBody'); body.replaceChildren(); const p = document.createElement('p'); p.className = 'smalltxt'; p.textContent = 'Sin eventos de conexión. Gmail, Sheets, Vonage, Resend y DocuSign permanecen desconectados en este prototipo.'; body.append(p);
    document.getElementById('modalTitle').textContent = 'Registro de actividad de integraciones'; document.getElementById('modalDesc').textContent = 'Estado local de la demostración'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return true;
  }
  if (screenId === 'integrations') {
    const title = button.closest('.card')?.querySelector('.cardtitle')?.textContent.trim() || label;
    const body = document.getElementById('modalBody'); body.replaceChildren();
    const p = document.createElement('p'); p.className = 'smalltxt'; p.textContent = `${title}: esta conexión permanece desconectada. La configuración se representa localmente y no se guardan credenciales.`; body.append(p);
    document.getElementById('modalTitle').textContent = `Configuración demo · ${title}`; document.getElementById('modalDesc').textContent = 'Sin API, OAuth ni cuentas reales.'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return true;
  }
  if (screenId === 'customdata' && /preview as user/i.test(label)) {
    const role = document.getElementById('roleSwitcher')?.value || 'Adjuster'; const body = document.getElementById('modalBody'); body.replaceChildren(); const p = document.createElement('p'); p.className = 'smalltxt'; p.textContent = `Vista del esquema para el rol ilustrativo “${role}”. Esto no aplica ni verifica permisos reales.`; body.append(p);
    document.getElementById('modalTitle').textContent = 'Vista previa por rol'; document.getElementById('modalDesc').textContent = 'Esquema ficticio local'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return true;
  }
  if (screenId === 'customdata' && /^formulas$/i.test(label)) {
    const body = document.getElementById('modalBody'); body.replaceChildren(); const p = document.createElement('p'); p.className = 'smalltxt'; p.textContent = 'Las fórmulas visibles son ejemplos de cálculo sobre filas sintéticas. No evalúan datos externos ni fórmulas personalizadas.'; body.append(p);
    document.getElementById('modalTitle').textContent = 'Fórmulas de ejemplo'; document.getElementById('modalDesc').textContent = 'Solo lectura · demo local'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return true;
  }
  if (screenId === 'customdata' && /^fields⌄?$/i.test(label)) {
    const columns = [...screen.querySelectorAll('thead th')].map((th) => th.innerText.trim()).filter(Boolean); const body = document.getElementById('modalBody'); body.replaceChildren();
    columns.forEach((name, index) => { const labelNode = document.createElement('label'); labelNode.className = 'field'; labelNode.style.cssText = 'display:flex;align-items:center;gap:8px'; const input = document.createElement('input'); input.type = 'checkbox'; input.dataset.column = String(index); input.checked = !(state.hiddenCustomColumns || []).includes(index); labelNode.append(input, document.createTextNode(name)); body.append(labelNode); });
    body.dataset.formAction = 'customdata-columns'; document.getElementById('modalTitle').textContent = 'Campos visibles'; document.getElementById('modalDesc').textContent = 'Selecciona las columnas que se muestran en esta vista local.'; document.getElementById('modalback').querySelector('[data-action="modal-confirm"]').textContent = 'Aplicar campos'; document.getElementById('modalback').classList.add('show'); return true;
  }
  if (screenId === 'superadmin' && /create agency/i.test(label)) { openForm('new-agency', state.agency); return true; }
  if (screenId === 'access' && /request access/i.test(label)) {
    saveSimulationRecord('support', { title: 'Solicitud de acceso temporal', requester: 'Admin demo', owner: 'Sin asignar', status: 'Pendiente de aprobación' }, 'Solicitud registrada localmente · requiere aprobación de la agencia'); return true;
  }
  if (screenId === 'backups' && /create backup/i.test(label)) {
    state.backupPoints ||= []; state.backupPoints.unshift({ id: makeId('BKP'), label: `Copia local demo · ${new Date().toLocaleString()}`, createdAt: now(), status: 'Vista previa · sin archivos externos' }); save();
    render(); toast('Punto de recuperación simulado localmente'); return true;
  }
  if (screenId === 'backups' && /preview restore/i.test(label)) {
    askConfirmation('Vista previa de restauración', 'Esta simulación no restaura, borra ni reemplaza datos. Los datos de muestra permanecen intactos.', () => toast('Vista previa revisada · sin cambios aplicados'), 'Entendido'); return true;
  }
  if (screenId === 'offline' && /save offline policy/i.test(label)) { toast('Política offline guardada solo como preferencia de demo'); return true; }
  if (screenId === 'viewer') {
    if (/^download$/i.test(label)) { toast('El archivo mostrado es una vista sintética; no hay documento real para descargar'); return true; }
    if (/add version/i.test(label)) { openLocalFileDialog('Agregar versión · vista previa local'); return true; }
    if (/change visibility/i.test(label)) { toast('Visibilidad de prueba actualizada localmente · sin publicar al portal'); return true; }
    if (/rotate|zoom|^\+|^−/i.test(label)) { const page = screen.querySelector('.card[style*="background:#e9e9eb"] > div[style*="background:#fff"]'); if (page) page.style.transform = label.includes('Rotate') ? `rotate(${(Number(page.dataset.rotation || 0) + 90) % 360}deg)` : label === '+' ? 'scale(1.08)' : label === '−' ? 'scale(.92)' : page.style.transform; return true; }
  }
  if (screenId === 'mitigation' && /contact agency support|open ticket/i.test(label)) { window.go?.('support'); return true; }
  if (screenId === 'support' && /open ticket/i.test(label)) {
    const row = button.closest('tr,.ticketrow,.card') || button.parentElement; const body = document.getElementById('modalBody'); body.replaceChildren(); const detail = document.createElement('p'); detail.className = 'smalltxt'; detail.textContent = `${row?.innerText || 'Ticket ficticio'} · detalle local de soporte; no se envió ninguna comunicación.`; body.append(detail);
    document.getElementById('modalTitle').textContent = 'Detalle del ticket demo'; document.getElementById('modalDesc').textContent = 'Registro local'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return true;
  }
  if (screenId === 'support' && /open agency audit log/i.test(label)) { window.go?.('admin'); return true; }
  if (screenId === 'admin' && /save configuration/i.test(label)) { logActivity('settings-saved', 'Configuración de agencia guardada en demo', 'admin'); save(); toast('Configuración guardada localmente · sin permisos reales'); return true; }
  if (screenId === 'tasks' && /^import task list$/i.test(label)) { openLocalFileDialog('Importar tareas · vista previa local'); return true; }
  if (screenId === 'email' && label === '⌕') { openModuleFilterDialog('email', 'mensajes'); return true; }
  if ((screenId === 'email' || screenId === 'claim') && label === '•••') {
    const body = document.getElementById('modalBody'); body.replaceChildren(); const p = document.createElement('p'); p.className = 'smalltxt'; p.textContent = screenId === 'email' ? 'Opciones del buzón demo: marcar leído, archivar o abrir el detalle del hilo. Ningún correo real se modifica.' : 'Acciones del expediente demo: abrir documentos, tareas o vista previa.'; body.append(p);
    document.getElementById('modalTitle').textContent = 'Más opciones'; document.getElementById('modalDesc').textContent = 'Acciones disponibles en esta demostración'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return true;
  }
  if (screenId === 'templates' && /^zoom⌄?$/i.test(label)) { const card = [...screen.querySelectorAll('.card')].find((item) => item.innerText.includes('Document preview')); const preview = card?.querySelector('div[style*="min-height:380px"]'); if (preview) { const zoom = preview.dataset.demoZoom === '1.1' ? '1' : '1.1'; preview.dataset.demoZoom = zoom; preview.style.transform = `scale(${zoom})`; preview.style.transformOrigin = 'top center'; } return true; }
  if (screenId === 'superadmin' && /plans & pricing/i.test(label)) {
    const body = document.getElementById('modalBody'); body.replaceChildren(); const p = document.createElement('p'); p.className = 'smalltxt'; p.textContent = 'SaaS hospedado: precio ilustrativo desde $500/mes. Full Suite: $8,000–$10,000 indicativo. Valores sujetos a definición; no hay cobros ni suscripciones.'; body.append(p);
    document.getElementById('modalTitle').textContent = 'Planes y precios · demo'; document.getElementById('modalDesc').textContent = 'Referencia comercial sintética'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return true;
  }
  if (screenId === 'superadmin' && /view request status/i.test(label)) { window.go?.('access'); return true; }
  if (screenId === 'offline' && /review changes/i.test(label)) {
    const body = document.getElementById('modalBody'); body.replaceChildren(); const p = document.createElement('p'); p.className = 'smalltxt'; p.textContent = 'No hay cambios pendientes. La cola de sincronización es una maqueta y no conserva expedientes en caché.'; body.append(p);
    document.getElementById('modalTitle').textContent = 'Revisión de cambios offline'; document.getElementById('modalDesc').textContent = 'Sin sincronización real'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return true;
  }
  if (screenId === 'offline' && /save offline policy/i.test(label)) { state.offlinePolicy = { savedAt: now(), status: 'Preferencias guardadas localmente; caché y sync desactivados' }; save(); render(); toast(state.offlinePolicy.status); return true; }
  if (screenId === 'viewer' && /^download$/i.test(label)) {
    const content = 'Documento de muestra OCS\nDEMO · datos sintéticos · no es un documento legal ni un archivo de cliente real.\n'; const link = document.createElement('a'); const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' })); link.href = url; link.download = 'documento-ocs-sintetico-demo.txt'; link.click(); URL.revokeObjectURL(url); toast('Documento sintético descargado · no contiene información real'); return true;
  }
  if (screenId === 'viewer' && /change visibility/i.test(label)) {
    state.viewerVisibility = state.viewerVisibility === 'Cliente · demo' ? 'Interno · demo' : 'Cliente · demo'; save(); render(); toast(`Visibilidad local: ${state.viewerVisibility}; no se publicó al portal`); return true;
  }
  if (screenId === 'viewer' && /rotate|zoom|^\+|^−|^＋$/i.test(label)) { const page = screen.querySelector('.card[style*="background:#e9e9eb"] > div[style*="background:#fff"]'); if (page) { if (/rotate/i.test(label)) { state.viewerRotation = (Number(state.viewerRotation || 0) + 90) % 360; page.style.transform = `scale(${Number(state.viewerZoom || 1)}) rotate(${state.viewerRotation}deg)`; } else { state.viewerZoom = Math.min(1.8, Math.max(.6, Number(state.viewerZoom || 1) + (label === '−' ? -.1 : .1))); page.style.transform = `scale(${state.viewerZoom}) rotate(${Number(state.viewerRotation || 0)}deg)`; } save(); } return true; }
  if (screenId === 'backups' && /all types/i.test(label)) { openModuleFilterDialog('backups', 'copias de seguridad'); return true; }
  if (screenId === 'documents' && /^folder view/i.test(label)) { const table = screen.querySelector('.tablewrap'); table?.classList.toggle('folder-view-demo'); toast('Vista de carpetas alternada · demo local'); return true; }
  if (screenId === 'documents' && /^filter$/i.test(label)) { openModuleFilterDialog('documents', 'documentos'); return true; }
  if (screenId === 'documents' && /upload files/i.test(label)) { openLocalFileDialog('Cargar documentos · vista previa local'); return true; }
  if (screenId === 'tasks' && /lo tomo/i.test(label)) {
    const card = button.closest('.taskcard'); if (card) { const taskName = card.querySelector('b')?.textContent.trim() || card.innerText.trim().split('\n')[0]; state.taskAssignments ||= {}; state.taskAssignments[taskName] = 'Alex Parker · demo'; save(); const owner = document.createElement('span'); owner.className = 'pill blue'; owner.textContent = 'Asignada a mí · demo'; card.querySelector('.taskfoot')?.replaceChildren(owner); }
    toast('Tarea asignada al usuario demo'); return true;
  }
  if (screenId === 'calendar' && /^(‹|›)$/.test(label)) {
    state.calendarOffset = (state.calendarOffset || 0) + (label === '›' ? 1 : -1); renderCalendarMonth(); save(); toast('Mes de calendario actualizado · datos de ejemplo'); return true;
  }
  if (screenId === 'import' && /select source/i.test(label)) {
    state.importSource = button.closest('.card')?.querySelector('b')?.textContent.trim() || 'Fuente demo';
    screen.querySelectorAll('.pagecols .card.flat.center').forEach((card) => card.classList.toggle('source-selected', card.contains(button)));
    save(); toast(`${state.importSource} seleccionada · solo referencia, sin conexión`); return true;
  }
  if (screenId === 'import' && /run preview/i.test(label)) {
    state.importRuns ||= []; state.importRuns.unshift({ id: makeId('PREVIEW'), source: state.importSource || 'Airtable · datos sintéticos', at: now(), status: 'Preview local · no importado' }); save();
    const status = screen.querySelector('.screenhead .pill'); if (status) status.textContent = 'Preview local · no importado'; render(); toast('Vista previa de migración simulada · no se leyó ni escribió ninguna fuente'); return true;
  }
  return false;
}

function installFullNavigationHandlers() {
  document.querySelectorAll('.screen .tab,.screen .subnav button').forEach((tab) => {
    if (!tab.dataset.screen) { tab.setAttribute('role', 'tab'); tab.setAttribute('tabindex', '0'); tab.setAttribute('aria-selected', String(tab.classList.contains('active'))); }
  });
  document.querySelectorAll('.more:not([data-screen])').forEach((item) => { item.setAttribute('role', 'button'); item.setAttribute('tabindex', '0'); });
  document.addEventListener('click', (event) => {
    const tab = event.target.closest('.screen.active .tab,.screen.active .subnav button');
    if (tab && !tab.dataset.screen) { event.preventDefault(); event.stopImmediatePropagation(); chooseTab(tab); return; }
    const more = event.target.closest('.screen.active .more:not([data-screen])');
    if (more) {
      event.preventDefault(); event.stopImmediatePropagation();
      const screenId = more.closest('.screen')?.id; const label = more.innerText.trim();
      if (screenId === 'claim' && label === '•••') { window.go?.('viewer'); return; }
      if (screenId === 'tasks' && /full task audit/i.test(label)) {
        const body = document.getElementById('modalBody'); body.replaceChildren();
        const entries = state.activity.filter((item) => /task/i.test(item.type)).slice(0, 8);
        const detail = document.createElement('p'); detail.className = 'smalltxt'; detail.textContent = entries.length ? entries.map((item) => `${item.label} · ${item.actor} · ${new Date(item.at).toLocaleString()}`).join('\n') : 'Historial sintético inicial: dos movimientos de tarea mostrados en el tablero; no hay más eventos locales.'; body.append(detail);
        document.getElementById('modalTitle').textContent = 'Auditoría completa de tareas · demo'; document.getElementById('modalDesc').textContent = 'Registro local; no hay cronómetro ni actividad de usuarios reales.'; delete body.dataset.formAction; document.getElementById('modalback').classList.add('show'); return;
      }
      const route = screenId === 'claim' && label === 'Full task audit' ? 'tasks'
        : screenId === 'ai' && /audit|versions/i.test(label) ? 'support'
          : screenId === 'portal' && /^view$/i.test(label) ? 'viewer' : '';
      if (route) { window.go?.(route); return; }
      window.go?.(screenId === 'portal' ? 'viewer' : screenId === 'claim' ? 'documents' : 'support'); return;
    }
    const button = event.target.closest('.screen.active button');
    if (button && handleSemanticControl(button, event)) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  document.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) return;
    const tab = event.target.closest?.('.screen.active .tab,.screen.active .subnav button');
    if (tab && !tab.dataset.screen) { event.preventDefault(); tab.click(); }
    const more = event.target.closest?.('.screen.active .more[role="button"]');
    if (more) { event.preventDefault(); more.click(); }
  });
}

function installListeners() {
  installFullNavigationHandlers();
  document.querySelectorAll('#email .mailbox,#email .mailthread').forEach((item) => {
    item.setAttribute('role', 'button'); item.setAttribute('tabindex', '0'); item.style.cursor = 'pointer';
  });
  document.addEventListener('click', (event) => {
    const mailbox = event.target.closest('#email .mailbox');
    if (mailbox) {
      event.preventDefault(); event.stopImmediatePropagation();
      const label = mailbox.textContent.replace(/[●○]/g, '').replace(/\s+\d+$/, '').trim();
      if (/Vonage call log|SMS conversations/i.test(label)) { window.go?.('phone'); return; }
      if (/@/.test(label)) state.selectedMailbox = label;
      else state.emailFolder = label;
      save(); renderEmailWorkspace(); return;
    }
    const thread = event.target.closest('#email .mailthread');
    if (thread) {
      event.preventDefault(); event.stopImmediatePropagation();
      state.activeEmail = thread.querySelector('b')?.textContent.trim() || thread.dataset.threadName || 'Email demo';
      save(); renderEmailWorkspace(); return;
    }
  }, true);
  document.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) return;
    const item = event.target.closest?.('#email .mailbox,#email .mailthread');
    if (item) { event.preventDefault(); item.click(); }
  });
  document.querySelectorAll('#dashboard .card.metric').forEach((card) => {
    const label = card.querySelector('.metriclabel')?.textContent.toLowerCase() || '';
    const destination = label.includes('urgentes') ? 'claims' : label.includes('tareas') ? 'tasks' : label.includes('aprobar') ? 'approvals' : label.includes('pagos') ? 'accounting' : 'claims';
    card.dataset.demoDestination = destination; card.setAttribute('role', 'button'); card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Abrir ${label} · vista demo`);
  });
  document.querySelectorAll('#dashboard .focusitem').forEach((item) => { item.setAttribute('role', 'button'); item.setAttribute('tabindex', '0'); });
  const openDashboardDestination = (target) => {
    const text = target.innerText.toLowerCase();
    if (text.includes('urgent') || text.includes('overdue') || text.includes('necesitan acción')) state.claimFilter = 'Urgent';
    else if (text.includes('míos') || text.includes('my work')) state.claimFilter = 'My claims';
    else if (text.includes('carrier')) state.claimFilter = 'Awaiting carrier';
    else if (text.includes('cliente') || text.includes('policyholder')) state.claimFilter = 'Awaiting customer';
    if (target.dataset.demoDestination) window.go?.(target.dataset.demoDestination);
    else if (text.includes('urgent') || text.includes('overdue') || text.includes('claim') || text.includes('carrier') || text.includes('cliente')) window.go?.('claims');
    else if (text.includes('task') || text.includes('tarea')) window.go?.('tasks');
    else if (text.includes('approval') || text.includes('aprobar')) window.go?.('approvals');
    else if (text.includes('sheet') || text.includes('payment') || text.includes('pago')) window.go?.('accounting');
    else window.go?.('tasks');
    if (document.querySelector('.screen.active')?.id === 'claims' && state.claimFilter) applyClaimFilter(state.claimFilter);
  };
  document.addEventListener('click', (event) => {
    const metric = event.target.closest('#dashboard .card.metric');
    if (metric) { event.preventDefault(); event.stopImmediatePropagation(); openDashboardDestination(metric); return; }
    const focus = event.target.closest('#dashboard .focusitem');
    if (focus) { event.preventDefault(); event.stopImmediatePropagation(); openDashboardDestination(focus); return; }
    const queue = event.target.closest('#dashboard .queueTabs .tab');
    if (queue) {
      event.preventDefault(); event.stopImmediatePropagation();
      const label = queue.innerText.toLowerCase();
      state.claimFilter = label.includes('míos') ? 'My claims' : label.includes('carrier') ? 'Awaiting carrier' : label.includes('cliente') ? 'Awaiting customer' : 'Urgent';
      window.go?.('claims'); applyClaimFilter(state.claimFilter); return;
    }
  }, true);
  document.addEventListener('keydown', (event) => {
    const target = event.target.closest?.('#dashboard .card.metric[role="button"],#dashboard .focusitem[role="button"]');
    if (target && ['Enter', ' '].includes(event.key)) { event.preventDefault(); target.click(); }
  });
  document.querySelectorAll('.screen .toggle').forEach((toggle, index) => {
    const screenId = toggle.closest('.screen')?.id || 'global';
    toggle.dataset.demoToggle = `${screenId}:${index}`;
    toggle.setAttribute('role', 'switch'); toggle.setAttribute('tabindex', '0');
    const checked = state.toggles?.[toggle.dataset.demoToggle] ?? toggle.classList.contains('on');
    toggle.classList.toggle('on', Boolean(checked)); toggle.setAttribute('aria-checked', String(Boolean(checked)));
  });
  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('.screen .toggle');
    if (!toggle) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const checked = !toggle.classList.contains('on');
    toggle.classList.toggle('on', checked); toggle.setAttribute('aria-checked', String(checked));
    state.toggles ||= {}; state.toggles[toggle.dataset.demoToggle] = checked;
    const description = toggle.closest('.kv')?.innerText.trim().replace(/\s+/g, ' ') || 'Preferencia de demo';
    logActivity('setting-toggled', `${description}: ${checked ? 'activado' : 'desactivado'} · demo`, toggle.dataset.demoToggle);
    save(); toast(`Preferencia local ${checked ? 'activada' : 'desactivada'} · Demo; no concede ni retira permisos reales`);
  }, true);
  document.addEventListener('keydown', (event) => {
    const toggle = event.target.closest?.('.screen .toggle');
    if (!toggle || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault(); toggle.click();
  });
  document.addEventListener('change', (event) => {
    const select = event.target.closest('.screen:not(#claims) .boardhead select');
    if (select) {
      const screenId = select.closest('.screen').id; const value = select.options[select.selectedIndex]?.textContent.trim() || '';
      state.moduleFilters ||= {}; state.moduleFilters[screenId] = value.startsWith('All ') ? '' : value;
      applyModuleFilter(screenId, state.moduleFilters[screenId]); save();
      toast(state.moduleFilters[screenId] ? `Filtro aplicado · ${value} · Demo` : 'Filtros restablecidos · Demo'); return;
    }
    const input = event.target.closest('input[type="file"]');
    if (!input) return;
    const file = input.files?.[0];
    const field = input.closest('.field');
    field?.querySelector('.local-file-preview')?.remove();
    if (!file || !field) return;
    const preview = document.createElement('div'); preview.className = 'local-file-preview smalltxt';
    preview.textContent = `${file.name} · ${(file.size / 1024).toFixed(1)} KB · vista temporal local; no se sube ni se guarda el archivo.`;
    field.append(preview);
    if (file.type.startsWith('image/')) {
      const image = document.createElement('img'); image.alt = 'Vista previa local'; image.style.cssText = 'display:block;max-width:140px;max-height:90px;margin-top:8px;border-radius:8px';
      const url = URL.createObjectURL(file); image.src = url; image.addEventListener('load', () => URL.revokeObjectURL(url), { once: true }); field.append(image);
    }
    toast('Archivo seleccionado solo para vista previa local · no enviado');
  }, true);
  document.addEventListener('click', (event) => {
    if (event.target.closest('#resetDemo')) {
      event.preventDefault(); event.stopImmediatePropagation();
      askConfirmation('Restablecer demo', 'Se eliminarán los datos ficticios de OCS guardados en este navegador. Los demás datos locales se conservarán.', () => {
        Object.keys(localStorage).filter((key) => key.startsWith('ocs-demo-') || key === STORE_KEY).forEach((key) => localStorage.removeItem(key));
        window.location.reload();
      }, 'Restablecer');
      return;
    }
    const trigger = event.target.closest('#mobile-nav-trigger, .mobile-nav-trigger');
    if (trigger) {
      event.preventDefault(); event.stopImmediatePropagation();
      const popover = document.getElementById('navPopover');
      if (popover.classList.contains('show')) { popover.classList.remove('show'); document.body.classList.remove('mobile-nav-open'); return; }
      popover.replaceChildren();
      const head = document.createElement('div'); head.className = 'mobile-sheet-head';
      const heading = document.createElement('strong'); heading.textContent = 'Navegación OCS · Demo';
      const close = document.createElement('button'); close.className = 'mobile-sheet-close'; close.type = 'button'; close.setAttribute('aria-label', 'Cerrar navegación'); close.textContent = '×';
      close.addEventListener('click', () => { popover.classList.remove('show'); document.body.classList.remove('mobile-nav-open'); });
      head.append(heading, close); popover.append(head);
      document.querySelectorAll('.rail .navgroup').forEach((group) => {
        const section = document.createElement('section'); section.className = 'mobile-nav-group';
        const toggle = document.createElement('button'); toggle.type = 'button'; toggle.setAttribute('aria-expanded', 'false');
        const name = document.createElement('span'); name.textContent = group.querySelector('.navgrouphead')?.textContent.trim() || 'Área';
        const arrow = document.createElement('span'); arrow.textContent = '＋'; toggle.append(name, arrow);
        const items = document.createElement('div'); items.className = 'mobile-nav-items'; items.hidden = true;
        group.querySelectorAll('.railbtn[data-screen]').forEach((source) => {
          const item = document.createElement('button'); item.type = 'button'; item.setAttribute('role', 'menuitem');
          const icon = source.firstChild?.textContent?.trim() || '•';
          const label = source.querySelector('.navtext')?.textContent.trim() || source.title || source.textContent.trim();
          item.textContent = `${icon}  ${label}`;
          item.addEventListener('click', () => { window.go?.(source.dataset.screen, source); popover.classList.remove('show'); document.body.classList.remove('mobile-nav-open'); });
          items.append(item);
        });
        toggle.addEventListener('click', () => {
          const opening = items.hidden;
          popover.querySelectorAll('.mobile-nav-items').forEach((list) => { list.hidden = true; list.previousElementSibling.setAttribute('aria-expanded', 'false'); list.previousElementSibling.lastElementChild.textContent = '＋'; });
          items.hidden = !opening; toggle.setAttribute('aria-expanded', String(opening)); arrow.textContent = opening ? '−' : '＋';
        });
        section.append(toggle, items); popover.append(section);
      });
      const active = document.querySelector('.rail .navgroup.open .navgrouphead')?.textContent.trim();
      const initial = [...popover.querySelectorAll('.mobile-nav-group')].find((section) => section.querySelector('button')?.innerText.includes(active || '')) || popover.querySelector('.mobile-nav-group');
      initial?.querySelector('button')?.click();
      popover.classList.add('show'); document.body.classList.add('mobile-nav-open');
      return;
    }
    if (document.body.classList.contains('mobile-nav-open') && !event.target.closest('#navPopover')) {
      document.getElementById('navPopover')?.classList.remove('show'); document.body.classList.remove('mobile-nav-open');
    }
  }, true);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('mobile-nav-open')) {
      document.getElementById('navPopover')?.classList.remove('show'); document.body.classList.remove('mobile-nav-open');
    }
  });
  document.addEventListener('click', (event) => {
    const aiShortcut = event.target.closest('#dashboard .aiwidget .chip');
    if (aiShortcut) {
      event.preventDefault(); event.stopImmediatePropagation();
      const prompt = aiShortcut.textContent.toLowerCase().includes('overdue')
        ? '¿Qué claims ficticios requieren seguimiento urgente hoy?'
        : 'Prepara un seguimiento de demo para el carrier y señala la evidencia pendiente.';
      state.aiPrompt = prompt; save(); window.go?.('ai');
      const input = document.querySelector('#ai .replybox textarea'); if (input) input.value = prompt;
      return;
    }
    const aiSend = event.target.closest('#ai .replybox button');
    if (aiSend) { event.preventDefault(); event.stopImmediatePropagation(); runAiPrompt(); return; }
    const aiDraft = event.target.closest('[data-ai-draft]');
    if (aiDraft) {
      event.preventDefault(); event.stopImmediatePropagation();
      const message = state.aiMessages?.find((item) => item.id === aiDraft.dataset.aiDraft); if (!message) return;
      const record = { id: makeId('MSG'), title: 'Borrador preparado por OCS demo', contact: 'Contacto ficticio', channel: 'Email', content: message.answer, status: 'Borrador local', createdAt: now(), updatedAt: now() };
      state.communications.unshift(record); logActivity('communication-created', 'Borrador local preparado desde respuesta IA demo', record.id); save(); render();
      toast('Borrador local creado · no enviado ni publicado'); return;
    }
    const pageButton = event.target.closest('#claims .tablewrap + .row.mt button');
    if (pageButton) {
      event.preventDefault(); event.stopImmediatePropagation();
      const pager = pageButton.parentElement;
      const buttons = [...pager.querySelectorAll('button')];
      const numeric = buttons.filter((button) => /^\d+$/.test(button.textContent.trim()));
      const page = Number(pageButton.textContent.trim());
      if (pageButton.textContent.trim() === '‹') state.claimPage = Math.max(1, (state.claimPage || 1) - 1);
      else if (pageButton.textContent.trim() === '›') state.claimPage = (state.claimPage || 1) + 1;
      else if (Number.isFinite(page) && page > 0) state.claimPage = page;
      window.applyClaimsViewState?.(); applyClaimPagination(); save();
      return;
    }
    const moduleFilterButton = event.target.closest('.screen:not(#claims) button.filter');
    if (moduleFilterButton) {
      event.preventDefault(); event.stopImmediatePropagation();
      const screen = moduleFilterButton.closest('.screen'); const label = moduleFilterButton.textContent.trim();
      if (/sort|recent|first|oldest/i.test(label)) {
        const rows = [...screen.querySelectorAll('tbody tr')]; const descending = (state.moduleSorts?.[screen.id] || 'asc') === 'asc';
        rows.sort((a, b) => (descending ? 1 : -1) * a.cells[0]?.innerText.localeCompare(b.cells[0]?.innerText)); rows.forEach((row) => row.parentElement.append(row));
        state.moduleSorts ||= {}; state.moduleSorts[screen.id] = descending ? 'desc' : 'asc'; save(); toast(`Orden aplicado · ${label} · Demo`);
      } else openModuleFilterDialog(screen.id, label);
      return;
    }
    const staticApprove = event.target.closest('[data-action="approve-send"]');
    if (staticApprove) {
      event.preventDefault(); event.stopImmediatePropagation();
      const item = document.querySelector('#approvals .approvalitem.active');
      const label = item?.querySelector('b')?.textContent.trim() || 'Elemento de aprobación';
      state.approvalStatus ||= {}; state.approvalStatus[label] = 'Aprobado · no enviado externamente';
      logActivity('approval-approved', `${label}: aprobado en demo · no enviado`, label); save();
      const badge = document.querySelector('#approvals .cardhead .pill');
      if (badge) badge.textContent = 'Aprobado · no enviado externamente';
      const feedback = document.querySelector('#approvals .demo-action-feedback') || document.createElement('section');
      feedback.className = 'card demo-action-feedback'; feedback.textContent = `${label} · Aprobado en demo. No se envió email ni se publicó al portal.`;
      document.querySelector('#approvals .approvalgrid')?.prepend(feedback);
      toast('Aprobación simulada · nada se envió ni publicó'); return;
    }
    const approvalItem = event.target.closest('#approvals .approvalitem');
    if (approvalItem) {
      event.preventDefault(); event.stopImmediatePropagation();
      document.querySelectorAll('#approvals .approvalitem').forEach((item) => item.classList.toggle('active', item === approvalItem));
      const selected = approvalItem.querySelector('b')?.textContent.trim() || 'Aprobación demo';
      const title = document.querySelector('#approvals .cardhead .cardtitle');
      if (title) title.textContent = `Borrador · ${selected}`;
      toast(`Detalle seleccionado · ${selected} · Demo`); return;
    }
    if (event.target.closest('#modalback [data-close]') && document.getElementById('modalBody')?.dataset.formAction === 'confirm') {
      pendingConfirmation = null; delete document.getElementById('modalBody').dataset.formAction;
    }
    const savedViewButton = event.target.closest('[data-claim-view]');
    if (savedViewButton) {
      event.preventDefault(); event.stopImmediatePropagation();
      const view = state.savedViews[Number(savedViewButton.dataset.claimView)];
      if (view) { applyClaimFilter(view.filter); state.claimSort = view.sort; sortClaimRows(); toast(`Vista “${view.name}” aplicada · Demo`); }
      return;
    }
    const claimControl = event.target.closest('#claims .boardhead .filter');
    if (claimControl) {
      const label = claimControl.textContent.toLowerCase();
      if (label.includes('filter')) { event.preventDefault(); event.stopImmediatePropagation(); openClaimViewDialog('filter'); return; }
      if (label.includes('save view')) { event.preventDefault(); event.stopImmediatePropagation(); openClaimViewDialog('save'); return; }
      if (label.includes('sort')) {
        event.preventDefault(); event.stopImmediatePropagation();
        state.claimSort = state.claimSort === 'asc' ? 'desc' : 'asc'; sortClaimRows(); claimControl.textContent = `↕ Sort ${state.claimSort === 'asc' ? 'A–Z' : 'Z–A'}`; save();
        toast(`Claims ordenados por policyholder · ${state.claimSort === 'asc' ? 'A–Z' : 'Z–A'}`); return;
      }
      if (label.includes('group')) {
        event.preventDefault(); event.stopImmediatePropagation();
        state.claimGroup = state.claimGroup === 'loss' ? 'stage' : 'loss';
        const rows = [...document.querySelectorAll('#claims tbody tr')].filter((row) => row.cells.length);
        const column = state.claimGroup === 'loss' ? 2 : 4;
        rows.sort((a,b) => a.cells[column].innerText.localeCompare(b.cells[column].innerText)); rows.forEach((row) => row.parentElement.append(row));
        claimControl.textContent = `▦ Group: ${state.claimGroup === 'loss' ? 'Loss type' : 'Internal stage'}`; save();
        toast(`Claims agrupados por ${state.claimGroup === 'loss' ? 'tipo de pérdida' : 'fase interna'} · Demo`); return;
      }
      if (label.includes('columns')) {
        event.preventDefault(); event.stopImmediatePropagation();
        const columns = [...document.querySelectorAll('#claims thead th')].map((header, index) => ({ index, name: header.innerText.trim(), hidden: (state.hiddenClaimColumns || []).includes(index) }));
        const backdrop = document.getElementById('modalback'); const body = document.getElementById('modalBody');
        document.getElementById('modalTitle').textContent = 'Columnas de Claims';
        document.getElementById('modalDesc').textContent = 'Elige columnas visibles para esta vista local.'; body.replaceChildren();
        columns.forEach((column) => { const label = document.createElement('label'); label.className = 'field'; label.style.display = 'flex'; label.style.alignItems = 'center'; label.style.gap = '8px'; const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.dataset.column = String(column.index); checkbox.checked = !column.hidden; label.append(checkbox, document.createTextNode(column.name)); body.append(label); });
        body.dataset.formAction = 'claims-columns'; delete body.dataset.editId;
        backdrop.querySelector('[data-action="modal-confirm"]').textContent = 'Aplicar columnas'; backdrop.classList.add('show'); return;
      }
    }
    const add = event.target.closest('[data-full-demo-action]');
    const actionButton = event.target.closest('[data-action]');
    const action = add?.dataset.fullDemoAction || actionButton?.dataset.action;
    if (action && formMarkup[action]) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openForm(action, action === 'new-agency' ? state.agency : undefined);
      return;
    }
    const recordButton = event.target.closest('[data-record-action]');
    if (recordButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const kind = recordButton.closest('.full-demo-records')?.dataset.kind || 'claim';
      const item = findEntity(kind, recordButton.dataset.recordId);
      if (!item) return;
      const verb = recordButton.dataset.recordAction;
      if (verb === 'edit') {
        const formAction = formForKind[kind];
        if (!formAction) { toast('Este elemento es de solo lectura en la demo.'); return; }
        openForm(formAction, item);
      } else if (verb === 'view') {
        const backdrop = document.getElementById('modalback');
        const title = document.getElementById('modalTitle');
        const description = document.getElementById('modalDesc');
        const body = document.getElementById('modalBody');
        title.textContent = item.title || item.name || item.ocsId || 'Detalle demo';
        description.textContent = 'Registro ficticio · solo local · nada se envía a servicios reales.';
        body.replaceChildren();
        Object.entries(item).filter(([key, value]) => !['id', 'createdAt', 'updatedAt'].includes(key) && value !== '' && value != null).forEach(([key, value]) => {
          const row = document.createElement('p'); row.className = 'smalltxt';
          const label = document.createElement('strong'); label.textContent = `${key}: `;
          row.append(label, document.createTextNode(Array.isArray(value) ? value.join(', ') : String(value)));
          body.append(row);
        });
        delete body.dataset.formAction; delete body.dataset.editId;
        backdrop.classList.add('show');
      } else if (verb === 'delete') doDelete(kind, item.id);
      else if ((verb === 'approve' || verb === 'cancel') && kind === 'communication') {
        item.status = verb === 'approve' ? 'Aprobado · no enviado externamente' : 'Cancelado · no enviado';
        item.updatedAt = now(); logActivity(`communication-${verb}d`, `${item.title}: ${item.status}`, item.id);
        save(); render(); toast(verb === 'approve' ? 'Aprobado · no enviado externamente' : 'Borrador cancelado · no enviado');
      }
      else if (verb === 'archive' && kind === 'claim') {
        item.archived = !item.archived;
        item.updatedAt = now();
        logActivity(item.archived ? 'claim-archived' : 'claim-restored', `${item.archived ? 'Archivado' : 'Restaurado'} claim demo: ${item.ocsId}`, item.id);
        save(); render(); toast(`Claim ${item.archived ? 'archivado' : 'restaurado'} localmente · Demo`);
      }
      else if (verb === 'complete' && kind === 'task') {
        item.status = 'Completada';
        item.completedAt = now();
        logActivity('task-completed', `Completada tarea demo: ${item.title}`, item.id);
        save(); render(); toast('Tarea completada localmente · Demo');
      }
      return;
    }
    const claimRow = event.target.closest('tr[data-local-claim]');
    if (claimRow && !event.target.closest('button')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.currentClaimId = claimRow.innerText.match(/OCS-[A-Z0-9-]+/)?.[0] || 'OCS-26-01482';
      if (window.go) window.go('claim', claimRow);
      return;
    }
    const linkedClaimRow = event.target.closest('.screen.active tr[data-open="claim"]');
    if (linkedClaimRow && !event.target.closest('button')) {
      event.preventDefault(); event.stopImmediatePropagation();
      window.currentClaimId = linkedClaimRow.innerText.match(/OCS-[A-Z0-9-]+/)?.[0] || 'OCS-26-01482';
      window.go?.('claim', linkedClaimRow); return;
    }
    const button = event.target.closest('button');
    if (!button || button.matches('button[type="submit"]') || button.closest('.rail,.nav-popover,#modalback') || button.matches('#sidebarToggle,.mobile-nav-trigger,[data-screen],[data-action],[data-close],#resetDemo') || button.closest('.tab,.queueTabs,[role="tab"]')) return;
    const label = button.innerText.trim();
    const screenId = button.closest('.screen')?.id || document.querySelector('.screen.active')?.id;
    if (/^save as draft$/i.test(label) && screenId === 'approvals') {
      event.preventDefault(); event.stopImmediatePropagation();
      const recipient = document.querySelector('#approvals .formgrid input')?.value || 'Contacto demo';
      const title = document.querySelector('#approvals .field.mt input')?.value || 'Mensaje demo';
      const content = document.querySelector('#approvals .field.mt textarea')?.value || 'Borrador sintético';
      const record = { id: makeId('MSG'), title, contact: recipient, channel: 'Email', content, status: 'Borrador local', createdAt: now(), updatedAt: now() };
      state.communications.unshift(record); logActivity('communication-created', `Borrador de aprobación guardado: ${title}`, record.id); save(); render();
      toast('Borrador guardado solo en OCS demo · no enviado'); return;
    }
    if (/^discard$/i.test(label) && screenId === 'approvals') {
      event.preventDefault(); event.stopImmediatePropagation();
      const selected = document.querySelector('#approvals .approvalitem.active b')?.textContent.trim() || 'Elemento de aprobación';
      askConfirmation('Descartar borrador', `¿Descartar “${selected}” de esta demo? No se envió al cliente.`, () => {
        state.approvalStatus ||= {}; state.approvalStatus[selected] = 'Descartado · demo';
        logActivity('approval-discarded', `${selected}: descartado en demo`, selected); save();
        const item = document.querySelector('#approvals .approvalitem.active'); item?.remove();
        toast('Borrador descartado localmente · Demo');
      }, 'Descartar'); return;
    }
    if (/^edit content$/i.test(label) && screenId === 'approvals') {
      const editor = document.querySelector('#approvals .formgrid textarea'); editor?.focus();
      if (editor) editor.setAttribute('aria-label', 'Contenido editable del borrador de demo');
      toast('Contenido listo para editar localmente · Demo'); return;
    }
    if (/^(ES|EN)⌄?$/.test(label)) {
      const language = state.uiLanguage === 'es' ? 'en' : 'es';
      state.uiLanguage = language; save();
      button.textContent = language === 'es' ? 'ES⌄' : 'EN⌄';
      document.documentElement.lang = language;
      document.querySelector('.demo-mode-banner').textContent = language === 'es' ? 'DEMO · local · nada se envía' : 'DEMO · local · nothing is sent';
      document.querySelector('.demo-role-label').firstChild.textContent = language === 'es' ? 'Rol demo ' : 'Demo role ';
      toast(language === 'es' ? 'Idioma de demo: Español · interfaz principal' : 'Demo language: English · primary interface');
      return;
    }
    const createAction = /role/i.test(label) ? 'new-role'
      : /support ticket/i.test(label) ? 'new-support'
        : /\b(user|invitation|member)\b/i.test(label) ? 'new-user'
          : /\b(rule|workflow|phase|process)\b/i.test(label) ? 'new-workflow'
            : /\b(document|attachment|file)\b/i.test(label) ? 'new-document'
              : /\b(portal|request|appointment)\b/i.test(label) ? 'new-portal'
                : /\b(email|sms|message|draft|call)\b/i.test(label) ? 'new-communication'
                  : /\b(reconcil|note|match)\b/i.test(label) && screenId === 'accounting' ? 'new-reconciliation'
                    : /\b(field)\b/i.test(label) && screenId === 'customdata' ? 'new-customfield'
                      : /\b(claim)\b/i.test(label) ? 'new-claim'
                        : /\b(task|checklist)\b/i.test(label) ? 'new-task'
                          : /\b(client|contact|customer)\b/i.test(label) ? 'new-client'
                            : /\b(event|calendar)\b/i.test(label) ? 'new-event'
                              : /\b(template)\b/i.test(label) ? 'new-template' : null;
    if (/^(\+|＋)?\s*(create|add|new|crear|agregar|añadir)/i.test(label) && createAction) {
      event.preventDefault(); event.stopImmediatePropagation(); openForm(createAction); return;
    }
    if (/^cancel$/i.test(label)) {
      event.preventDefault(); event.stopImmediatePropagation();
      const feedback = screen.querySelector('.demo-action-feedback'); feedback?.remove();
      toast('Acción cancelada · no se guardaron cambios'); return;
    }
    if (/^(close|×)$/i.test(label)) {
      event.preventDefault(); event.stopImmediatePropagation(); toast('Panel cerrado en la demo · sin cambios externos'); return;
    }
    if (/^(‹|›|[0-9]+)$/i.test(label)) {
      event.preventDefault(); event.stopImmediatePropagation();
      const pages = state.modulePages || (state.modulePages = {});
      const current = pages[screenId] || 1;
      pages[screenId] = label === '‹' ? Math.max(1, current - 1) : label === '›' ? current + 1 : Number(label);
      save(); toast(`Página ${pages[screenId]} · ${screenId} · Demo`); return;
    }
    event.preventDefault(); event.stopImmediatePropagation(); showActionFeedback(button);
  }, true);

  document.addEventListener('click', (event) => {
    const confirmButton = event.target.closest('#modalback [data-action="modal-confirm"]');
    if (!confirmButton || !document.getElementById('modalBody')?.dataset.formAction) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const body = document.getElementById('modalBody');
    const action = body.dataset.formAction;
    if (action === 'confirm') {
      event.preventDefault(); event.stopImmediatePropagation();
      const callback = pendingConfirmation; pendingConfirmation = null;
      document.getElementById('modalback').classList.remove('show');
      delete body.dataset.formAction;
      callback?.();
      return;
    }
    if (action === 'claims-filter' || action === 'claims-save-view') {
      const fields = [...body.querySelectorAll('[data-field]')];
      const invalid = fields.find((field) => !field.checkValidity());
      if (invalid) { invalid.reportValidity(); invalid.focus(); return; }
      const values = formValues();
      if (action === 'claims-filter') applyClaimFilter(values.filter);
      else {
        state.savedViews.unshift({ id: makeId('VIEW'), name: values.name, filter: values.filter, sort: state.claimSort || 'asc', createdAt: now() });
        logActivity('claim-view-saved', `Vista de claims guardada: ${values.name}`, state.savedViews[0].id); save(); renderSavedClaimViews();
      }
      document.getElementById('modalback').classList.remove('show'); delete body.dataset.formAction;
      toast(action === 'claims-filter' ? `Filtro aplicado · ${values.filter}` : 'Vista guardada localmente · Demo');
      return;
    }
    if (action === 'claims-columns') {
      state.hiddenClaimColumns = [...body.querySelectorAll('input[data-column]:not(:checked)')].map((input) => Number(input.dataset.column));
      applyClaimColumns(); save(); document.getElementById('modalback').classList.remove('show'); delete body.dataset.formAction;
      toast('Columnas actualizadas en esta vista local · Demo'); return;
    }
    if (action === 'customdata-columns') {
      state.hiddenCustomColumns = [...body.querySelectorAll('input[data-column]:not(:checked)')].map((input) => Number(input.dataset.column));
      applyCustomDataColumns(); save(); document.getElementById('modalback').classList.remove('show'); delete body.dataset.formAction;
      toast('Campos visibles actualizados en la tabla demo'); return;
    }
    if (action === 'email-match') {
      const select = body.querySelector('[data-field="relatedClaim"]');
      if (!select?.checkValidity()) { select?.reportValidity(); select?.focus(); return; }
      state.emailMatches ||= {}; state.emailMatches[body.dataset.emailId || 'Citizens Claims · Maria Gonzalez'] = select.value;
      logActivity('email-claim-matched', `Email demo asociado a ${select.value}`, body.dataset.emailId); save();
      const thread = [...document.querySelectorAll('#email .mailthread')].find((item) => item.querySelector('b')?.textContent.trim() === body.dataset.emailId);
      let badge = thread?.querySelector('.demo-match-status'); if (thread && !badge) { badge = document.createElement('small'); badge.className = 'demo-match-status'; thread.append(badge); }
      if (badge) badge.textContent = `Asociado a ${select.value} · demo`;
      document.getElementById('modalback').classList.remove('show'); delete body.dataset.formAction; delete body.dataset.emailId; toast('Email asociado localmente · no se movió ni envió'); return;
    }
    if (action === 'local-file') {
      const file = body.querySelector('input[type="file"]')?.files?.[0];
      document.getElementById('modalback').classList.remove('show'); delete body.dataset.formAction;
      toast(file ? `${file.name} revisado localmente · no se subió` : 'Vista previa cerrada · no se seleccionó ningún archivo'); return;
    }
    if (action === 'module-filter') {
      const query = body.querySelector('[data-field="query"]')?.value.trim() || '';
      const screenId = body.dataset.screenId;
      state.moduleFilters ||= {}; state.moduleFilters[screenId] = query; save(); applyModuleFilter(screenId, query);
      document.getElementById('modalback').classList.remove('show'); delete body.dataset.formAction; delete body.dataset.screenId;
      toast(query ? `Filtro local aplicado · ${query}` : 'Filtro local restablecido'); return;
    }
    if (action === 'data-view') {
      const input = body.querySelector('[data-field="name"]');
      if (!input?.checkValidity()) { input?.reportValidity(); input?.focus(); return; }
      state.savedDataViews ||= [];
      state.savedDataViews.unshift({ id: makeId('DV'), name: input.value.trim(), query: state.moduleFilters?.customdata || '', createdAt: now() });
      logActivity('data-view-created', `Vista local creada: ${input.value.trim()}`, state.savedDataViews[0].id); save(); renderSavedDataViews();
      document.getElementById('modalback').classList.remove('show'); delete body.dataset.formAction; toast(`Vista “${input.value.trim()}” guardada localmente`); return;
    }
    const kind = formMarkup[action].kind;
    const editId = body.dataset.editId;
    const existing = editId ? findEntity(kind, editId) : null;
    upsert(action, existing);
  }, true);

  document.getElementById('agencyForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!event.currentTarget.reportValidity()) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const publicName = String(values.get('publicName') || document.getElementById('agencyPublic')?.value || '').trim();
    state.agency = {
      legalName: String(values.get('legalName') || document.getElementById('agencyLegal')?.value || '').trim(),
      publicName,
      email: String(document.querySelector('#agencyForm input[type="email"]')?.value || '').trim(),
      city: document.getElementById('agencyCity')?.value.trim() || '',
      website: document.getElementById('agencyWeb')?.value.trim() || '',
      color: document.getElementById('agencyColor')?.value || '#007aff',
      mode: document.getElementById('agencyMode')?.value || '',
      adminName: document.getElementById('adminName')?.value.trim() || '',
      adminEmail: [...form.querySelectorAll('input[type="email"]')].at(-1)?.value.trim() || '',
      states: [...form.querySelectorAll('input[name="states"]:checked')].map((field) => field.parentElement?.textContent.trim() || field.value),
      createdAt: now(),
    };
    if (!state.users.some((user) => user.role === 'Admin' && user.status === 'Activo')) {
      state.users.unshift({ id: makeId('USR'), name: state.agency.adminName, email: state.agency.adminEmail, role: 'Admin', status: 'Activo', createdAt: now(), updatedAt: now() });
    }
    state.activity.unshift({ id: makeId('ACT'), type: 'agency-created', label: 'Agencia demo creada', actor: state.agency.adminName || 'Admin demo', at: now() });
    save();
    applyAgency(state.agency);
    document.body.classList.remove('onboarding-mode');
    window.go?.('dashboard');
    toast('Agencia creada localmente · Demo interactiva');
  }, true);

  document.querySelector('[data-action="skip-onboarding"]')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    state.agency ||= { legalName: 'Coastal Adjusting Demo LLC', publicName: 'Coastal Adjusting · Demo', color: '#007aff', mode: 'SaaS hospedado por OCS', states: ['Florida', 'Georgia'], createdAt: now() };
    if (!state.users.some((user) => user.role === 'Admin' && user.status === 'Activo')) state.users.unshift({ id: makeId('USR'), name: 'Alex Parker', email: 'alex.parker@example.invalid', role: 'Admin', status: 'Activo', createdAt: now(), updatedAt: now() });
    save(); applyAgency(state.agency); document.body.classList.remove('onboarding-mode'); window.go?.('dashboard');
    toast('Agencia de ejemplo cargada localmente · Demo');
  }, true);
}

function initialize() {
  installStyles();
  seedClaimFixtures();
  addEntityButtons();
  if (state.agency) {
    applyAgency(state.agency);
    document.body.classList.remove('onboarding-mode');
    window.go?.('dashboard');
  } else {
    document.body.classList.add('onboarding-mode');
    window.go?.('create-agency');
  }
  installListeners();
  const originalClaimFilter = window.applyClaimsViewState;
  window.applyClaimsViewState = () => {
    document.querySelectorAll('#claims tbody tr[data-page-hidden]').forEach((row) => { delete row.dataset.pageHidden; });
    originalClaimFilter?.();
    const selectValue = document.querySelector('#claims .boardhead select')?.value?.toLowerCase() || '';
    const tabValue = document.querySelector('#claims .tab.active')?.textContent?.toLowerCase() || '';
    const archivedOnly = selectValue.includes('archived') || tabValue.includes('archive');
    const searchValue = document.getElementById('globalSearch')?.value?.trim().toLowerCase() || '';
    document.querySelectorAll('#claims tbody tr[data-local-claim]').forEach((row) => {
      const isArchived = row.cells[4]?.textContent.toLowerCase().includes('archived');
      if (archivedOnly && isArchived) row.style.display = !searchValue || row.innerText.toLowerCase().includes(searchValue) ? '' : 'none';
      else if (archivedOnly !== isArchived) row.style.display = 'none';
    });
    applyClaimPagination();
  };
  render();
}

function seedClaimFixtures() {
  if (state.seededClaims) return;
  const rows = [...document.querySelectorAll('#claims tbody tr[data-open="claim"]')];
  rows.forEach((row) => {
    const cells = [...row.cells];
    const text = (index) => cells[index]?.innerText.trim().replace(/\s+/g, ' ') || '';
    const identifiers = text(1).match(/OCS-[A-Z0-9-]+/g) || [];
    const id = identifiers[0] || makeId('OCS');
    if (state.claims.some((claim) => claim.ocsId === id)) return;
    const person = cells[0]?.querySelector('.person span:last-child');
    const personLines = person?.innerText.split('\n').map((value) => value.trim()) || [];
    const customer = (personLines[0] || text(0)).replace(/\s*\+\s*\d+$/, '');
    const client = ensureClient(customer);
    state.claims.push({
      id: makeId('CLM'), ocsId: id, customer, address: personLines[1] || '', lossType: text(2),
      carrier: text(3), stage: text(4), clientStage: text(5), assignee: text(6), nextAction: text(7),
      clientId: client?.id || '', status: /closed|resolved/i.test(text(4)) ? 'Closed' : 'Open',
      archived: /closed|resolved/i.test(text(4)), createdAt: now(), updatedAt: now(), fixture: true,
    });
  });
  state.seededClaims = true;
  const tbody = document.querySelector('#claims tbody'); tbody?.replaceChildren();
  save();
}

initialize();
