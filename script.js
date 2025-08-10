// Pet data
const pets = [
  {name: "Chicken Axolotl", value: 300000},
  {name: "Limited Damson", value: 200000},
  {name: "Huge chicken", value: 150000},
  {name: "Exclusive Moon Kitsune", value: 100000},
  {name: "Exclusives (range)", valueMin: 50000, valueMax: 100000, isRange:true},
  {name: "Event RNG god", value: 45000},
  {name: "Shadow Kitsune", value: 25000},
  {name: "Brainrot tralalero tralala", value: 2000},
  {name: "Deadpool", value: 1000},
  {name: "Brainrot Tung Tung", value: 500},
  {name: "Commons (range)", valueMin: 10, valueMax: 50, isRange:true}
];

const tbody = document.getElementById('tbody');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');
const downloadBtn = document.getElementById('download');

function formatNum(n){
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n/1000).toFixed(n%1000===0 ? 0 : 1) + 'k';
  return n.toString();
}

function numberWithCommas(x){ if (x === undefined) return ''; return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function escapeHtml(text){ return text.replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m]; }); }

function renderList(order='desc', filterFn = ()=>true, q=''){
  const list = [...pets];
  list.sort((a,b)=>{
    const aval = a.isRange ? (a.valueMax ?? a.valueMin) : a.value;
    const bval = b.isRange ? (b.valueMax ?? b.valueMin) : b.value;
    if (order === 'desc') return (bval ?? 0) - (aval ?? 0);
    return (aval ?? 0) - (bval ?? 0);
  });

  tbody.innerHTML = '';
  for (const p of list){
    if (!filterFn(p)) continue;
    const name = p.name;
    if (q && !name.toLowerCase().includes(q.toLowerCase())) continue;

    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.innerHTML = `<div style="font-weight:700">${escapeHtml(name)}</div><div class="muted small">${p.isRange ? 'Category / range' : 'Pet'}</div>`;
    const tdVal = document.createElement('td');
    tdVal.style.textAlign = 'right';
    if (p.isRange){
      tdVal.innerHTML = `<div class="value">${formatNum(p.valueMin)} — ${formatNum(p.valueMax)}</div><div class="kilo muted">${numberWithCommas(p.valueMin)} — ${numberWithCommas(p.valueMax)} diamonds</div>`;
    } else {
      tdVal.innerHTML = `<div class="value">${formatNum(p.value)}</div><div class="kilo muted">${numberWithCommas(p.value)} diamonds</div>`;
    }
    tr.appendChild(tdName);
    tr.appendChild(tdVal);
    tbody.appendChild(tr);
  }
}

// initial render
renderList('desc', ()=>true, '');

// interactions
let timeout;
searchEl.addEventListener('input', () => {
  clearTimeout(timeout);
  timeout = setTimeout(()=>{
    renderList(sortEl.value, currentFilter, searchEl.value.trim());
  }, 120);
});

sortEl.addEventListener('change', () => {
  renderList(sortEl.value, currentFilter, searchEl.value.trim());
});

let currentFilter = ()=>true;
document.querySelectorAll('.pill').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.pill').forEach(p=>p.style.outline='none');
    btn.style.outline = '2px solid rgba(124,58,237,0.25)';

    const f = btn.dataset.filter;
    if (f === 'all'){ currentFilter = ()=>true; }
    else if (f === 'low'){ currentFilter = (p)=> !p.isRange && (p.value ?? Infinity) < 1000; }
    else if (f === '>=1000'){ currentFilter = (p)=> p.isRange ? (p.valueMax >= 1000) : (p.value >= 1000); }
    else if (f === '>=50000'){ currentFilter = (p)=> p.isRange ? (p.valueMax >= 50000) : (p.value >= 50000); }
    else currentFilter = ()=>true;

    renderList(sortEl.value, currentFilter, searchEl.value.trim());
  });
});

downloadBtn.addEventListener('click', ()=>{
  const rows = [];
  rows.push(['Pet','Value (display)','Value (raw)','Notes']);
  for (const p of pets){
    if (p.isRange){
      rows.push([p.name, `${numberWithCommas(p.valueMin)} — ${numberWithCommas(p.valueMax)}`, `${p.valueMin}-${p.valueMax}`, 'category range']);
    } else {
      rows.push([p.name, numberWithCommas(p.value) + ' diamonds', p.value, 'pet']);
    }
  }
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'tap-n-hatch-values.csv';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

// keyboard shortcut: "/" focuses search
window.addEventListener('keydown', (e)=>{
  if (e.key === '/' && document.activeElement !== searchEl){
    e.preventDefault(); searchEl.focus(); searchEl.select();
  }
});
