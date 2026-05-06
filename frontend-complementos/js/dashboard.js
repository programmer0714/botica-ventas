// dashboard.js — Lógica del Dashboard

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  renderUserInfo();
  initChart();
  renderStockAlerts();
  animateCounters();
});

// ─── GRÁFICO DE VENTAS (últimos 7 días) ────────────────────────────────────
function initChart() {
  const ctx = document.getElementById('salesChart').getContext('2d');

  const labels = getLastSevenDays();
  const data   = [850, 920, 1100, 1300, 1450, 1600, 1250];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Ventas (S/)',
        data,
        backgroundColor: data.map((_, i) =>
          i === data.length - 1
            ? 'rgba(0,201,167,0.85)'
            : 'rgba(15,76,129,0.70)'
        ),
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: data.map((_, i) =>
          i === data.length - 1 ? '#00c9a7' : '#1a6abf'
        )
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` S/ ${ctx.parsed.y.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
          },
          backgroundColor: '#0f4c81',
          titleColor: '#fff',
          bodyColor: '#a8cce8',
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Sora', size: 12 }, color: '#718096' }
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
          ticks: {
            font: { family: 'JetBrains Mono', size: 11 },
            color: '#718096',
            callback: v => 'S/ ' + v.toLocaleString('es-PE')
          }
        }
      }
    }
  });
}

function getLastSevenDays() {
  const days = [];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(dayNames[d.getDay()] + ' ' + d.getDate());
  }
  return days;
}

// ─── ALERTAS DE STOCK BAJO ─────────────────────────────────────────────────
const stockAlerts = [
  { nombre: 'Amoxicilina 500mg', lab: 'Hersil', stock: 8, minimo: 20 },
  { nombre: 'Paracetamol 120mg/5mL', lab: 'Portugal', stock: 5, minimo: 20 },
  { nombre: 'Diclofenaco 75mg', lab: 'Pharma', stock: 12, minimo: 20 },
];

function renderStockAlerts() {
  const container = document.getElementById('stock-alerts');
  if (!container) return;

  container.innerHTML = stockAlerts.map(item => `
    <div class="stock-alert-item">
      <div>
        <div class="stock-alert-name">${item.nombre}</div>
        <div class="stock-alert-lab">${item.lab}</div>
      </div>
      <div class="stock-alert-qty">${item.stock} uds</div>
    </div>
  `).join('');
}

// ─── ANIMACIÓN DE CONTADORES ───────────────────────────────────────────────
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(el => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const isDecimal = String(target).includes('.');
    let current = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = prefix + (isDecimal
        ? current.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : Math.floor(current).toLocaleString('es-PE')) + suffix;
    }, 30);
  });
}
