const dummyKpis = [
  { id: 'APP-1001', appName: 'Field Service Intake', owner: 'Operations', environment: 'Production', dataSource: 'Azure SQL - ServiceOps', totalSessions: 18420, activeUsers: 1284, avgLoadSeconds: 2.3, successRate: 98.7, errorCount: 42, approvalsPending: 18, lastSync: '2026-07-08 08:45 UTC', health: 'Healthy' },
  { id: 'APP-1002', appName: 'Capital Request Portal', owner: 'Finance', environment: 'Production', dataSource: 'Azure SQL - FinanceDW', totalSessions: 9320, activeUsers: 642, avgLoadSeconds: 3.1, successRate: 96.4, errorCount: 87, approvalsPending: 64, lastSync: '2026-07-08 08:40 UTC', health: 'Watch' },
  { id: 'APP-1003', appName: 'Safety Observation Tracker', owner: 'EHS', environment: 'UAT', dataSource: 'Azure SQL - SafetyLake', totalSessions: 5102, activeUsers: 318, avgLoadSeconds: 1.9, successRate: 99.1, errorCount: 15, approvalsPending: 7, lastSync: '2026-07-08 08:30 UTC', health: 'Healthy' },
  { id: 'APP-1004', appName: 'Plant Maintenance Requests', owner: 'Maintenance', environment: 'Development', dataSource: 'Azure SQL - MaintOps', totalSessions: 2740, activeUsers: 121, avgLoadSeconds: 4.8, successRate: 91.8, errorCount: 129, approvalsPending: 35, lastSync: '2026-07-08 07:55 UTC', health: 'Attention' },
];

const syncEvents = [
  { time: '08:45', app: 'Field Service Intake', status: 'Completed', rows: '12,482', detail: 'SQL view dbo.vw_KPI_FieldService refreshed' },
  { time: '08:40', app: 'Capital Request Portal', status: 'Completed with warnings', rows: '7,904', detail: '3 slow-running approvals queries detected' },
  { time: '08:30', app: 'Safety Observation Tracker', status: 'Completed', rows: '4,118', detail: 'Dataverse audit rows matched SQL staging' },
  { time: '07:55', app: 'Plant Maintenance Requests', status: 'Needs review', rows: '2,003', detail: 'Error threshold exceeded for connector calls' },
];

const integrationSteps = [
  'Replace dummyKpis with an API call to your secured backend or Azure Function.',
  'Use the Power Platform admin connector or Dataverse Web API to identify app metadata.',
  'Query Azure SQL KPI views or stored procedures from the backend, never directly from the browser.',
  'Map returned fields to the KPI cards and table columns in this dashboard.',
];

const state = { environment: 'All', query: '' };
const root = document.getElementById('root');
const numberFormatter = new Intl.NumberFormat('en-US');

function icon(name) {
  const icons = { activity: '☑', users: '👥', shield: '🛡', clock: '⏱', plug: '⚡', db: '▣', server: '☁', filter: '◈', search: '⌕', refresh: '↻', up: '↗', alert: '⚠', check: '✓' };
  return `<span class="icon" aria-hidden="true">${icons[name] ?? '•'}</span>`;
}

function getFilteredKpis() {
  return dummyKpis.filter((kpi) => {
    const matchesEnvironment = state.environment === 'All' || kpi.environment === state.environment;
    const matchesQuery = [kpi.appName, kpi.owner, kpi.dataSource].join(' ').toLowerCase().includes(state.query.toLowerCase());
    return matchesEnvironment && matchesQuery;
  });
}

function getTotals(kpis) {
  const sessions = kpis.reduce((sum, item) => sum + item.totalSessions, 0);
  const users = kpis.reduce((sum, item) => sum + item.activeUsers, 0);
  const pending = kpis.reduce((sum, item) => sum + item.approvalsPending, 0);
  const avgSuccess = kpis.length ? kpis.reduce((sum, item) => sum + item.successRate, 0) / kpis.length : 0;
  return { sessions, users, pending, avgSuccess };
}

function metricCard(symbol, label, value, trend) {
  return `<article class="metric-card"><div class="metric-icon">${icon(symbol)}</div><span>${label}</span><strong>${value}</strong><p class="trend-positive">${icon('up')}${trend} vs prior period</p></article>`;
}

function healthBadge(status) {
  const symbol = status === 'Healthy' ? icon('check') : icon('alert');
  return `<span class="health-badge ${status.toLowerCase()}">${symbol}${status}</span>`;
}

function render() {
  const kpis = getFilteredKpis();
  const totals = getTotals(kpis);

  root.innerHTML = `
    <main class="app-shell">
      <section class="hero">
        <div>
          <p class="eyebrow">${icon('plug')} Power Platform + Azure SQL</p>
          <h1>PowerApps KPI Command Center</h1>
          <p class="hero-copy">A connection-ready dashboard that uses dummy KPI data today and can be wired to PowerApps, Dataverse, Azure SQL views, or your backend services later.</p>
          <div class="hero-actions"><button class="primary" id="refreshButton">${icon('refresh')} Simulate refresh</button><button class="secondary">${icon('db')} Configure SQL connection</button></div>
        </div>
        <div class="connection-card">${icon('server')}<span>Connection mode</span><strong>Dummy data adapter</strong><p>Swap the adapter with your Azure SQL / Power Platform API integration when credentials are ready.</p></div>
      </section>
      <section class="summary-grid" aria-label="KPI summary">
        ${metricCard('activity', 'Total sessions', numberFormatter.format(totals.sessions), '+12.4%')}
        ${metricCard('users', 'Active users', numberFormatter.format(totals.users), '+8.1%')}
        ${metricCard('shield', 'Avg success rate', `${totals.avgSuccess.toFixed(1)}%`, '+1.7%')}
        ${metricCard('clock', 'Pending approvals', numberFormatter.format(totals.pending), '-5.2%')}
      </section>
      <section class="panel controls-panel">
        <div class="control-group"><label for="environment">${icon('filter')} Environment</label><select id="environment">${['All', 'Production', 'UAT', 'Development'].map((option) => `<option ${state.environment === option ? 'selected' : ''}>${option}</option>`).join('')}</select></div>
        <div class="control-group search-box"><label for="search">${icon('search')} Search apps, owners, or sources</label><input id="search" value="${state.query}" placeholder="Try Finance or Azure SQL" /></div>
      </section>
      <section class="dashboard-grid">
        <div class="panel table-panel"><div class="panel-heading"><div><p class="eyebrow">Application telemetry</p><h2>PowerApps KPI data</h2></div><span class="record-count">${kpis.length} apps</span></div><div class="table-wrap"><table><thead><tr><th>App</th><th>Owner</th><th>Environment</th><th>Success</th><th>Load</th><th>Errors</th><th>Health</th></tr></thead><tbody>${kpis.map((kpi) => `<tr><td><strong>${kpi.appName}</strong><span>${kpi.dataSource}</span></td><td>${kpi.owner}</td><td>${kpi.environment}</td><td>${kpi.successRate}%</td><td>${kpi.avgLoadSeconds}s</td><td>${kpi.errorCount}</td><td>${healthBadge(kpi.health)}</td></tr>`).join('')}</tbody></table></div></div>
        <aside class="panel side-panel"><p class="eyebrow">SQL sync monitor</p><h2>Latest refresh events</h2><div class="timeline">${syncEvents.map((event) => `<article><span class="timeline-dot"></span><div><strong>${event.time} · ${event.app}</strong><p>${event.status} · ${event.rows} rows</p><small>${event.detail}</small></div></article>`).join('')}</div></aside>
      </section>
      <section class="panel architecture-panel"><div><p class="eyebrow">Connection-ready architecture</p><h2>How to wire in real data later</h2></div><div class="steps-grid">${integrationSteps.map((step, index) => `<article class="step-card"><span>${index + 1}</span><p>${step}</p></article>`).join('')}</div></section>
    </main>`;

  document.getElementById('environment').addEventListener('change', (event) => { state.environment = event.target.value; render(); });
  document.getElementById('search').addEventListener('input', (event) => { state.query = event.target.value; render(); });
  document.getElementById('refreshButton').addEventListener('click', () => { alert('Dummy KPI refresh complete. Replace this action with your backend refresh endpoint.'); });
}

render();
