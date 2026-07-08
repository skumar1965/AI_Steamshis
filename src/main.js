const d365Tables = {
  customers: [
    { account: 'US-001', name: 'Contoso Manufacturing', group: 'Major', balance: 128430.22, creditLimit: 250000, status: 'Active', city: 'Seattle', lastInvoice: '2026-07-03' },
    { account: 'US-014', name: 'Northwind Traders', group: 'Wholesale', balance: 84210.5, creditLimit: 100000, status: 'Credit hold', city: 'Chicago', lastInvoice: '2026-07-01' },
    { account: 'US-033', name: 'Fabrikam Aerospace', group: 'Strategic', balance: 31890, creditLimit: 500000, status: 'Active', city: 'Dallas', lastInvoice: '2026-06-28' },
    { account: 'US-047', name: 'Adventure Works Cycles', group: 'Retail', balance: 5244.75, creditLimit: 50000, status: 'Active', city: 'Denver', lastInvoice: '2026-07-06' },
  ],
  salesOrders: [
    { order: 'SO-102884', customer: 'Contoso Manufacturing', legalEntity: 'USMF', status: 'Open order', amount: 45820.15, warehouse: '24', requestedShipDate: '2026-07-10' },
    { order: 'SO-102901', customer: 'Northwind Traders', legalEntity: 'USMF', status: 'Backorder', amount: 12870.0, warehouse: '11', requestedShipDate: '2026-07-12' },
    { order: 'SO-102917', customer: 'Fabrikam Aerospace', legalEntity: 'USMF', status: 'Delivered', amount: 98112.45, warehouse: '31', requestedShipDate: '2026-07-08' },
    { order: 'SO-102930', customer: 'Adventure Works Cycles', legalEntity: 'USMF', status: 'Invoiced', amount: 3540.0, warehouse: '12', requestedShipDate: '2026-07-05' },
  ],
  inventory: [
    { item: 'A0001', productName: 'Hydraulic pump assembly', site: '1', warehouse: '24', onHand: 418, reserved: 72, available: 346, unitCost: 228.45 },
    { item: 'B0144', productName: 'Aluminum frame kit', site: '1', warehouse: '11', onHand: 96, reserved: 91, available: 5, unitCost: 84.1 },
    { item: 'C0902', productName: 'IoT gateway controller', site: '2', warehouse: '31', onHand: 51, reserved: 20, available: 31, unitCost: 412.8 },
    { item: 'D2100', productName: 'Safety valve replacement', site: '1', warehouse: '12', onHand: 0, reserved: 14, available: -14, unitCost: 37.25 },
  ],
  vendors: [
    { account: 'VEN-1007', name: 'Blue Yonder Components', group: 'Parts', openInvoices: 8, balance: 48125.92, paymentTerms: 'Net 30', status: 'Approved' },
    { account: 'VEN-1021', name: 'Litware Logistics', group: 'Freight', openInvoices: 3, balance: 17340, paymentTerms: 'Net 15', status: 'Approved' },
    { account: 'VEN-1075', name: 'Proseware Industrial', group: 'Maintenance', openInvoices: 12, balance: 64210.33, paymentTerms: 'Net 45', status: 'Review' },
  ],
};

const samplePrompts = [
  'Show customers on credit hold',
  'Find backorder sales orders',
  'Which inventory items have low availability?',
  'Summarize vendor balances',
];

const queryPatterns = [
  { match: ['credit hold', 'hold customer'], table: 'customers', summary: 'Customers currently on credit hold', filter: (row) => row.status.toLowerCase().includes('hold') },
  { match: ['customer', 'customers', 'custtable'], table: 'customers', summary: 'Customer account snapshot', filter: () => true },
  { match: ['backorder', 'back order'], table: 'salesOrders', summary: 'Sales orders waiting on fulfillment', filter: (row) => row.status.toLowerCase() === 'backorder' },
  { match: ['sales order', 'salesorders', 'sales', 'open order'], table: 'salesOrders', summary: 'Sales order workspace query', filter: () => true },
  { match: ['low availability', 'shortage', 'negative', 'stockout'], table: 'inventory', summary: 'Inventory availability exceptions', filter: (row) => row.available <= 10 },
  { match: ['inventory', 'on hand', 'inventsum', 'items'], table: 'inventory', summary: 'On-hand inventory by warehouse', filter: () => true },
  { match: ['vendor', 'vendors', 'vendtable', 'invoice'], table: 'vendors', summary: 'Vendor balance and invoice review', filter: () => true },
];

const state = {
  entity: 'All entities',
  query: 'Show customers on credit hold',
  lastResult: runAgentQuery('Show customers on credit hold', 'All entities'),
};

const root = document.getElementById('root');
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const numberFormatter = new Intl.NumberFormat('en-US');

function icon(name) {
  const icons = { bot: '🤖', db: '▣', search: '⌕', shield: '🛡', bolt: '⚡', table: '▦', check: '✓', alert: '⚠', flow: '↝', lock: '🔐' };
  return `<span class="icon" aria-hidden="true">${icons[name] ?? '•'}</span>`;
}

function entityLabel(key) {
  return ({ customers: 'Customers', salesOrders: 'Sales orders', inventory: 'Inventory', vendors: 'Vendors' })[key] ?? key;
}

function formatValue(key, value) {
  if (typeof value === 'number' && ['balance', 'creditLimit', 'amount', 'unitCost'].includes(key)) return currencyFormatter.format(value);
  if (typeof value === 'number') return numberFormatter.format(value);
  return value;
}

function pickPattern(query, entity) {
  const normalized = query.toLowerCase();
  if (entity !== 'All entities') return { table: entity, summary: `${entityLabel(entity)} filtered by your question`, filter: (row) => JSON.stringify(row).toLowerCase().includes(normalized) || normalized.length < 3 };
  return queryPatterns.find((pattern) => pattern.match.some((term) => normalized.includes(term))) ?? queryPatterns[1];
}

function runAgentQuery(query, entity) {
  const pattern = pickPattern(query, entity);
  const rows = d365Tables[pattern.table].filter(pattern.filter);
  const fallbackRows = rows.length ? rows : d365Tables[pattern.table];
  const fields = Object.keys(fallbackRows[0] ?? {});
  return {
    table: pattern.table,
    summary: pattern.summary,
    rows: fallbackRows,
    noExactMatch: rows.length === 0,
    odata: `/data/${entityLabel(pattern.table).replaceAll(' ', '')}?$top=25&cross-company=true`,
    fields,
    insight: buildInsight(pattern.table, fallbackRows),
  };
}

function buildInsight(table, rows) {
  if (table === 'customers') {
    const totalBalance = rows.reduce((sum, row) => sum + row.balance, 0);
    return `${rows.length} customer records returned with ${currencyFormatter.format(totalBalance)} total open balance.`;
  }
  if (table === 'salesOrders') {
    const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
    return `${rows.length} sales orders returned with ${currencyFormatter.format(totalAmount)} in order value.`;
  }
  if (table === 'inventory') {
    const exceptions = rows.filter((row) => row.available <= 10).length;
    return `${exceptions} of ${rows.length} item/warehouse records are at or below the low-availability threshold.`;
  }
  const totalBalance = rows.reduce((sum, row) => sum + row.balance, 0);
  return `${rows.length} vendors returned with ${currencyFormatter.format(totalBalance)} open balance.`;
}

function getEntityTotals() {
  return [
    { label: 'Dummy entities', value: Object.keys(d365Tables).length, detail: 'Customers, orders, inventory, vendors' },
    { label: 'Queryable records', value: Object.values(d365Tables).reduce((sum, rows) => sum + rows.length, 0), detail: 'Seeded F&O rows' },
    { label: 'Agent mode', value: 'Local', detail: 'No credentials required' },
  ];
}

function renderResultTable(result) {
  return `<div class="table-wrap"><table><thead><tr>${result.fields.map((field) => `<th>${field}</th>`).join('')}</tr></thead><tbody>${result.rows.map((row) => `<tr>${result.fields.map((field) => `<td>${formatValue(field, row[field])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function render() {
  const result = state.lastResult;
  root.innerHTML = `
    <main class="app-shell">
      <section class="hero">
        <div>
          <p class="eyebrow">${icon('bot')} Dynamics 365 Finance & Operations Agent</p>
          <h1>Ask questions across D365 F&amp;O dummy data.</h1>
          <p class="hero-copy">A local agent prototype translates natural-language prompts into seeded Finance &amp; Operations entity queries so teams can demo the experience before connecting Microsoft Entra ID, OData, Dataverse virtual tables, or a secure backend.</p>
          <div class="hero-actions">${samplePrompts.map((prompt) => `<button class="secondary sample-prompt" data-prompt="${prompt}">${prompt}</button>`).join('')}</div>
        </div>
        <div class="connection-card">${icon('lock')}<span>Connection mode</span><strong>Dummy D365 F&amp;O adapter</strong><p>Uses in-browser seed data only. Replace the adapter with authenticated D365 F&amp;O OData calls when credentials and environments are ready.</p></div>
      </section>

      <section class="summary-grid" aria-label="Agent setup summary">
        ${getEntityTotals().map((metric) => `<article class="metric-card"><div class="metric-icon">${icon('db')}</div><span>${metric.label}</span><strong>${metric.value}</strong><p>${metric.detail}</p></article>`).join('')}
        <article class="metric-card"><div class="metric-icon">${icon('shield')}</div><span>Security stance</span><strong>Backend first</strong><p>Keep secrets out of the browser</p></article>
      </section>

      <section class="panel agent-panel">
        <div class="panel-heading"><div><p class="eyebrow">${icon('search')} Agent query console</p><h2>Query Finance &amp; Operations entities</h2></div><span class="record-count">${entityLabel(result.table)}</span></div>
        <div class="query-grid">
          <div class="control-group"><label for="entity">Entity scope</label><select id="entity">${['All entities', 'customers', 'salesOrders', 'inventory', 'vendors'].map((option) => `<option value="${option}" ${state.entity === option ? 'selected' : ''}>${option === 'All entities' ? option : entityLabel(option)}</option>`).join('')}</select></div>
          <div class="control-group"><label for="query">Natural-language question</label><input id="query" value="${state.query}" placeholder="Ask about customers, sales orders, inventory, or vendors" /></div>
          <button class="primary" id="askButton">${icon('bolt')} Ask agent</button>
        </div>
        <div class="agent-answer">
          <div><p class="eyebrow">${icon('flow')} Generated query</p><code>${result.odata}</code></div>
          <div><p class="eyebrow">${icon(result.noExactMatch ? 'alert' : 'check')} Agent answer</p><h3>${result.summary}</h3><p>${result.noExactMatch ? 'No exact text match was found, so the agent returned the closest entity set. ' : ''}${result.insight}</p></div>
        </div>
        ${renderResultTable(result)}
      </section>

      <section class="panel architecture-panel"><div><p class="eyebrow">Production path</p><h2>How to replace dummy data</h2></div><div class="steps-grid">${[
        'Move D365 F&O calls behind Azure Functions, API Management, or another trusted service.',
        'Authenticate with Microsoft Entra ID and enforce F&O roles, legal entities, and row-level policies.',
        'Map natural-language intents to approved OData entities, data entities, or custom service operations.',
        'Add audit logging, prompt guardrails, paging, and throttling before exposing production data.',
      ].map((step, index) => `<article class="step-card"><span>${index + 1}</span><p>${step}</p></article>`).join('')}</div></section>
    </main>`;

  document.getElementById('entity').addEventListener('change', (event) => { state.entity = event.target.value; state.lastResult = runAgentQuery(state.query, state.entity); render(); });
  document.getElementById('query').addEventListener('input', (event) => { state.query = event.target.value; });
  document.getElementById('askButton').addEventListener('click', () => { state.lastResult = runAgentQuery(state.query, state.entity); render(); });
  document.querySelectorAll('.sample-prompt').forEach((button) => button.addEventListener('click', () => { state.query = button.dataset.prompt; state.lastResult = runAgentQuery(state.query, state.entity); render(); }));
}

render();
