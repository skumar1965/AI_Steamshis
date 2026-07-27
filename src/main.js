const customers = [
  { id: 'C-10084', name: 'Acme Retail Group', email: 'ar@acmeretail.com', balance: 24850, status: 'Ready' },
  { id: 'C-10219', name: 'Northwind Traders', email: 'finance@northwind.com', balance: 12400, status: 'Ready' },
  { id: 'C-10402', name: 'Blue Yonder Airlines', email: '', balance: 8920, status: 'Missing email' },
  { id: 'C-10557', name: 'Fabrikam, Inc.', email: 'accounting@fabrikam.com', balance: 6380, status: 'Ready' },
];

const state = { selected: new Set(['C-10084', 'C-10219', 'C-10557']), filter: '', activity: [
  { customer: 'Contoso Ltd.', detail: 'Statement delivered · $18,420.00', time: 'Today, 9:42 AM', tone: 'success' },
  { customer: 'Adventure Works', detail: 'Statement delivered · $7,160.00', time: 'Today, 9:41 AM', tone: 'success' },
  { customer: 'Tailspin Toys', detail: 'Delivery failed · Invalid email address', time: 'Yesterday, 4:18 PM', tone: 'error' },
] };

const root = document.getElementById('root');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function render() {
  const visible = customers.filter((customer) => `${customer.name} ${customer.id}`.toLowerCase().includes(state.filter.toLowerCase()));
  const selectedCustomers = customers.filter((customer) => state.selected.has(customer.id));
  const total = selectedCustomers.reduce((sum, customer) => sum + customer.balance, 0);

  root.innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <a class="brand" href="#"><span class="brand-mark">S</span><span>Statement<span class="brand-accent">Flow</span></span></a>
        <nav aria-label="Main navigation">
          <a class="nav-item active" href="#"><span>⌂</span> Overview</a>
          <a class="nav-item" href="#customers"><span>♙</span> Customers</a>
          <a class="nav-item" href="#statements"><span>▤</span> Statements <b>12</b></a>
          <a class="nav-item" href="#schedule"><span>◷</span> Schedule</a>
        </nav>
        <div class="sidebar-bottom">
          <div class="dynamics"><span class="dynamics-logo">D</span><div><strong>Dynamics 365</strong><small>Finance connected</small></div><i></i></div>
          <a class="nav-item" href="#settings"><span>⚙</span> Settings</a>
          <div class="profile"><div class="avatar">AM</div><div><strong>Alex Morgan</strong><small>Finance manager</small></div><button aria-label="Profile menu">•••</button></div>
        </div>
      </aside>

      <main>
        <header><div><p class="breadcrumb">OVERVIEW</p><h1>Good morning, Alex</h1><p>Here's what's happening with your customer statements.</p></div><button class="icon-button" aria-label="Notifications">♧<span></span></button></header>

        <section class="stats" aria-label="Statement summary">
          <article><div class="stat-icon purple">▤</div><div><span>Ready to send</span><strong>24</strong><small>Across 24 customers</small></div></article>
          <article><div class="stat-icon green">✓</div><div><span>Sent this month</span><strong>142</strong><small class="positive">↗ 12% from last month</small></div></article>
          <article><div class="stat-icon amber">◷</div><div><span>Scheduled</span><strong>18</strong><small>Next run Aug 1, 2026</small></div></article>
          <article><div class="stat-icon blue">$</div><div><span>Outstanding balance</span><strong>$328.4K</strong><small>Across all customers</small></div></article>
        </section>

        <section class="workspace" id="statements">
          <div class="section-heading"><div><span class="spark">✦</span><div><h2>Create statement run</h2><p>Select customers, configure the statement, and let the agent handle the rest.</p></div></div><span class="agent-badge"><i></i> Agent ready</span></div>
          <div class="flow">
            <div class="customer-panel">
              <div class="step-title"><span>1</span><div><h3>Select customers</h3><p>${state.selected.size} customers selected</p></div></div>
              <label class="search"><span>⌕</span><input id="search" value="${state.filter}" placeholder="Search customers..." /></label>
              <div class="customer-list">
                ${visible.map((customer) => `<label class="customer-row ${customer.email ? '' : 'disabled'}"><input type="checkbox" data-id="${customer.id}" ${state.selected.has(customer.id) ? 'checked' : ''} ${customer.email ? '' : 'disabled'}><span class="checkmark">✓</span><span class="customer-avatar">${customer.name.split(/\s/).slice(0,2).map((part) => part[0]).join('')}</span><span class="customer-info"><strong>${customer.name}</strong><small>${customer.id} · ${customer.email || 'No email on file'}</small></span><span class="balance"><strong>${money.format(customer.balance)}</strong><small class="${customer.email ? 'ready' : 'warning'}">${customer.email ? '● Ready' : '⚠ Missing email'}</small></span></label>`).join('')}
              </div>
              <button class="view-all">View all 24 customers <span>→</span></button>
            </div>

            <div class="config-panel">
              <div class="step-title"><span>2</span><div><h3>Configure &amp; send</h3><p>Set your statement preferences</p></div></div>
              <div class="form-grid"><label>Statement date<input type="date" value="2026-07-31"></label><label>Include transactions<select><option>Open transactions only</option><option>All transactions</option></select></label></div>
              <label class="full-field">Email template<select><option>Monthly customer statement</option><option>Payment reminder</option></select></label>
              <label class="toggle-row"><span><strong>Schedule recurring run</strong><small>Automatically send on the last day of each month</small></span><input id="scheduleToggle" type="checkbox"><i></i></label>
              <div class="agent-summary"><span class="spark">✦</span><div><strong>Agent summary</strong><p>I'll generate PDF statements for <b>${state.selected.size} customers</b>, attach them to personalized emails, and track delivery status.</p></div></div>
              <div class="send-summary"><div><span>${state.selected.size} statements</span><strong>${money.format(total)}</strong><small>Total outstanding</small></div><button id="sendButton" ${state.selected.size ? '' : 'disabled'}><span>➤</span> Send ${state.selected.size} statements</button></div>
            </div>
          </div>
        </section>

        <section class="activity"><div class="activity-header"><div><h2>Recent activity</h2><p>Latest statement runs and delivery updates</p></div><button>View all activity →</button></div><div class="activity-list">${state.activity.map((item) => `<article><span class="activity-icon ${item.tone}">${item.tone === 'success' ? '✓' : '!'}</span><div><strong>${item.customer}</strong><p>${item.detail}</p></div><time>${item.time}</time></article>`).join('')}</div></section>
        <footer><span>StatementFlow Agent · Connected to Microsoft Dynamics 365 Finance</span><span><i></i> All systems operational</span></footer>
      </main>
      <div id="toast" role="status" aria-live="polite"></div>
    </div>`;

  document.getElementById('search').addEventListener('input', (event) => { state.filter = event.target.value; render(); document.getElementById('search').focus(); });
  document.querySelectorAll('[data-id]').forEach((input) => input.addEventListener('change', () => { input.checked ? state.selected.add(input.dataset.id) : state.selected.delete(input.dataset.id); render(); }));
  document.getElementById('sendButton').addEventListener('click', () => {
    const count = state.selected.size;
    state.activity.unshift({ customer: `${count}-customer statement run`, detail: `Generation started · ${money.format(total)}`, time: 'Just now', tone: 'success' });
    render();
    const toast = document.getElementById('toast'); toast.textContent = `Agent started ${count} statement${count === 1 ? '' : 's'}.`; toast.classList.add('show');
  });
}

render();
