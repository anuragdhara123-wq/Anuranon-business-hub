const KEY = 'anuranon_business_hub_v1';

const defaults = {
  pin: '2580',
  clients: [],
  bookings: [],
  payments: [],
  packages: [],
  finance: [],
  team: [],
  leads: []
};

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    const result = { ...defaults, ...saved };
    ['clients','bookings','payments','packages','finance','team','leads']
      .forEach(k => {
        if (!Array.isArray(result[k])) result[k] = [];
      });
    result.pin = String(result.pin || '2580');
    return result;
  } catch (e) {
    return { ...defaults };
  }
}

let data = loadData();
let currentPage = 'dashboard';

const $ = s => document.querySelector(s);
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[c]));

$('#today').textContent = new Date().toLocaleDateString('en-IN', {
  day:'numeric', month:'short', year:'numeric'
});

$('#login-form').addEventListener('submit', e => {
  e.preventDefault();
  if (String($('#pin').value) === data.pin) {
    $('#login-error').textContent = '';
    $('#login').classList.add('hidden');
    $('#app').classList.remove('hidden');
    try {
      render();
    } catch (err) {
      $('#login').classList.remove('hidden');
      $('#app').classList.add('hidden');
      $('#login-error').textContent = 'Dashboard error: ' + err.message;
    }
  } else {
    $('#login-error').textContent = 'Incorrect PIN. Try again.';
  }
});

$('#logout').onclick = () => {
  $('#app').classList.add('hidden');
  $('#login').classList.remove('hidden');
  $('#pin').value = '';
};

$('#nav').addEventListener('click', e => {
  const b = e.target.closest('[data-page]');
  if (!b) return;
  currentPage = b.dataset.page;
  document.querySelectorAll('.nav-item').forEach(x =>
    x.classList.toggle('active', x === b)
  );
  render();
});

function stat(label, value) {
  return `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`;
}

function table(headers, rows) {
  return `<div class="table-wrap"><table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.length ? rows.join('') :
      `<tr><td colspan="${headers.length}" class="empty">No records yet. Add your first entry.</td></tr>`}
    </tbody></table></div>`;
}

function row(cells) {
  return `<tr>${cells.map(x => `<td>${x}</td>`).join('')}</tr>`;
}
const configs = {
  clients: {
    title:'Clients',
    fields:[
      ['name','Client name','text',1],
      ['phone','Phone','tel'],
      ['email','Email','email'],
      ['notes','Notes','text']
    ],
    cols:['Name','Phone','Email','Notes'],
    values:x=>[esc(x.name),esc(x.phone),esc(x.email),esc(x.notes)]
  },
  bookings: {
    title:'Bookings & calendar',
    fields:[
      ['client','Client name','text',1],
      ['event','Event type','text'],
      ['date','Event date','date'],
      ['venue','Venue','text'],
      ['amount','Package amount','number'],
      ['status','Status','select',false,['Enquiry','Confirmed','Completed','Cancelled']]
    ],
    cols:['Client','Event','Date','Venue','Amount','Status'],
    values:x=>[
      esc(x.client),esc(x.event),esc(x.date),esc(x.venue),
      money(x.amount),`<span class="pill">${esc(x.status)}</span>`
    ]
  },
  payments: {
    title:'Payments & invoices',
    fields:[
      ['client','Client name','text',1],
      ['date','Payment date','date'],
      ['amount','Amount received','number',1],
      ['method','Payment method','select',false,['Cash','UPI','Bank transfer','Other']],
      ['note','Note / reference','text']
    ],
    cols:['Client','Date','Amount','Method','Note'],
    values:x=>[
      esc(x.client),esc(x.date),money(x.amount),esc(x.method),esc(x.note)
    ]
  },
  packages: {
    title:'Packages & pricing',
    fields:[
      ['name','Package name','text',1],
      ['price','Price','number',1],
      ['details','Package details','text']
    ],
    cols:['Package','Price','Details'],
    values:x=>[esc(x.name),money(x.price),esc(x.details)]
  },
  team: {
    title:'Team management',
    fields:[
      ['name','Team member','text',1],
      ['role','Role','text'],
      ['phone','Phone','tel'],
      ['rate','Agreed rate','number']
    ],
    cols:['Name','Role','Phone','Rate'],
    values:x=>[esc(x.name),esc(x.role),esc(x.phone),money(x.rate)]
  },
  leads: {
    title:'Instagram leads',
    fields:[
      ['name','Name / Instagram handle','text',1],
      ['phone','Phone','tel'],
      ['event','Event / requirement','text'],
      ['source','Source','select',false,['Instagram DM','Instagram comment','Referral','Other']],
      ['status','Lead status','select',false,['New','Contacted','Follow-up','Converted','Lost']],
      ['followup','Follow-up date','date']
    ],
    cols:['Lead','Phone','Requirement','Source','Status','Follow-up'],
    values:x=>[
      esc(x.name),esc(x.phone),esc(x.event),esc(x.source),
      `<span class="pill">${esc(x.status)}</span>`,esc(x.followup)
    ]
  }
};

function render() {
  const titles = {
    dashboard:'Dashboard',
    finance:'Income & expenses',
    settings:'Settings'
  };
  const title = titles[currentPage] ||
    configs[currentPage]?.title || 'Dashboard';

  $('#page-title').textContent = title;

  if (currentPage === 'dashboard') return dashboard();
  if (currentPage === 'finance') return finance();
  if (currentPage === 'settings') return settings();

  const c = configs[currentPage];

  $('#page-content').innerHTML = `
    <div class="section-head">
      <h2>${c.title}</h2>
      <button class="primary" id="add">+ Add new</button>
    </div>
    <div class="panel">
      ${table(c.cols,data[currentPage].map(x=>row(c.values(x))))}
    </div>
    <div id="form-slot"></div>`;

  $('#add').onclick = () => showForm(currentPage);
}
function dashboard() {
  const received = data.payments.reduce((a,x)=>a+Number(x.amount||0),0);
  const expenses = data.finance.filter(x=>x.type==='Expense')
    .reduce((a,x)=>a+Number(x.amount||0),0);
  const bookingValue = data.bookings.reduce((a,x)=>a+Number(x.amount||0),0);

  $('#page-content').innerHTML = `
    <div class="cards">
      ${stat('Total clients',data.clients.length)}
      ${stat('Total bookings',data.bookings.length)}
      ${stat('Payments received',money(received))}
      ${stat('Booking value',money(bookingValue))}
    </div>
    <div class="two-col">
      <div class="panel">
        <h2>Recent bookings</h2>
        ${table(['Client','Event date','Status'],
          data.bookings.slice(-5).reverse().map(x=>row([
            esc(x.client),esc(x.date),
            `<span class="pill">${esc(x.status)}</span>`
          ])))}
      </div>
      <div class="panel">
        <h2>Business snapshot</h2>
        <p>Payments received: <b>${money(received)}</b></p>
        <p>Expenses: <b>${money(expenses)}</b></p>
        <p>Team members: <b>${data.team.length}</b></p>
        <p>Instagram leads: <b>${data.leads.length}</b></p>
        <p class="notice">Remember to export your backup regularly.</p>
      </div>
    </div>`;
}

function showForm(key) {
  const c = configs[key];
  $('#form-slot').innerHTML = `
    <div class="form-panel">
      <h2>Add ${c.title.toLowerCase()}</h2>
      <form id="record-form">
        <div class="form-grid">
          ${c.fields.map(([id,label,type,required,opts]) => `
            <div class="field">
              <label>${label}</label>
              ${type==='select'
                ? `<select name="${id}">${opts.map(o=>`<option>${o}</option>`).join('')}</select>`
                : `<input name="${id}" type="${type}" ${required?'required':''}>`}
            </div>`).join('')}
        </div>
        <div class="form-actions">
          <button class="primary">Save record</button>
          <button type="button" class="secondary" id="cancel">Cancel</button>
        </div>
      </form>
    </div>`;

  $('#cancel').onclick = () => $('#form-slot').innerHTML = '';

  $('#record-form').onsubmit = e => {
    e.preventDefault();
    const obj = Object.fromEntries(new FormData(e.target).entries());
    data[key].push(obj);
    save();
    render();
  };
}function finance() {
  const income = data.finance.filter(x=>x.type==='Income')
    .reduce((a,x)=>a+Number(x.amount||0),0)
    + data.payments.reduce((a,x)=>a+Number(x.amount||0),0);
  const expense = data.finance.filter(x=>x.type==='Expense')
    .reduce((a,x)=>a+Number(x.amount||0),0);

  $('#page-content').innerHTML = `
    <div class="cards">
      ${stat('Total income',money(income))}
      ${stat('Total expenses',money(expense))}
      ${stat('Net recorded',money(income-expense))}
      ${stat('Entries',data.finance.length)}
    </div>
    <div class="section-head">
      <h2>Income & expenses</h2>
      <button class="primary" id="add-finance">+ Add entry</button>
    </div>
    <div class="panel">
      ${table(['Type','Description','Date','Amount'],
        data.finance.map(x=>row([
          `<span class="pill">${esc(x.type)}</span>`,
          esc(x.description),esc(x.date),money(x.amount)
        ])))}
    </div>
    <div id="form-slot"></div>`;

  $('#add-finance').onclick = () => {
    $('#form-slot').innerHTML = `
      <div class="form-panel">
        <h2>New finance entry</h2>
        <form id="finance-form">
          <div class="form-grid">
            <div class="field">
              <label>Type</label>
              <select name="type">
                <option>Income</option>
                <option>Expense</option>
              </select>
            </div>
            <div class="field">
              <label>Amount</label>
              <input name="amount" type="number" required>
            </div>
            <div class="field">
              <label>Description</label>
              <input name="description" required>
            </div>
            <div class="field">
              <label>Date</label>
              <input name="date" type="date">
            </div>
          </div>
          <div class="form-actions">
            <button class="primary">Save</button>
          </div>
        </form>
      </div>`;

    $('#finance-form').onsubmit = e => {
      e.preventDefault();
      data.finance.push(
        Object.fromEntries(new FormData(e.target).entries())
      );
      save();
      render();
    };
  };
}function settings() {
  $('#page-content').innerHTML = `
    <div class="panel">
      <h2>Security & backup</h2>
      <p class="notice">
        Change your PIN and export your business records.
        Your information is stored in this browser on this device.
      </p>
      <form id="pin-form">
        <div class="field">
          <label>New PIN (4–8 digits)</label>
          <input name="pin" inputmode="numeric"
            pattern="[0-9]{4,8}" minlength="4"
            maxlength="8" required>
        </div>
        <button class="primary" style="margin-top:12px">
          Change PIN
        </button>
      </form>
      <button class="secondary" id="export" style="margin-top:14px">
        Export data backup (JSON)
      </button>
      <p id="settings-msg" class="notice"></p>
    </div>
    <div class="panel">
      <h2>About this app</h2>
      <p class="notice">
        This is a local prototype. It does not yet provide cloud sync,
        encrypted database storage, PDF invoices or direct Instagram integration.
      </p>
    </div>`;

  $('#pin-form').onsubmit = e => {
    e.preventDefault();
    data.pin = new FormData(e.target).get('pin');
    save();
    $('#settings-msg').textContent = 'PIN updated successfully.';
  };

  $('#export').onclick = () => {
    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type:'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anuranon-business-hub-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=4').catch(() => {});
  });
}function save() {
  localStorage.setItem(KEY, JSON.stringify(data));
}
