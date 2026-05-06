// historial.js — Módulo de Historial de Ventas

// ─── DATOS SIMULADOS ───────────────────────────────────────────────────────
const ventasSimuladas = [
  { comprobante: 'B001-00001', fecha: '2025-05-05', cliente: 'Juan Pérez García',       total: 45.50,  tipo: 'Boleta'  },
  { comprobante: 'F001-00001', fecha: '2025-05-05', cliente: 'Empresa ABC S.A.C.',       total: 280.00, tipo: 'Factura' },
  { comprobante: 'B001-00002', fecha: '2025-05-05', cliente: 'María López Ríos',         total: 22.80,  tipo: 'Boleta'  },
  { comprobante: 'B001-00003', fecha: '2025-05-04', cliente: 'Carlos Mendoza',           total: 67.20,  tipo: 'Boleta'  },
  { comprobante: 'F001-00002', fecha: '2025-05-04', cliente: 'Ferretería Unión E.I.R.L.',total: 515.00, tipo: 'Factura' },
  { comprobante: 'B001-00004', fecha: '2025-05-04', cliente: 'Rosa Castillo',            total: 18.50,  tipo: 'Boleta'  },
  { comprobante: 'B001-00005', fecha: '2025-05-03', cliente: 'Pedro Villar',             total: 33.60,  tipo: 'Boleta'  },
  { comprobante: 'F001-00003', fecha: '2025-05-03', cliente: 'Clínica San Marcos',       total: 1250.00,tipo: 'Factura' },
  { comprobante: 'B001-00006', fecha: '2025-05-02', cliente: 'Ana Gutiérrez',            total: 55.00,  tipo: 'Boleta'  },
  { comprobante: 'B001-00007', fecha: '2025-05-02', cliente: 'Luis Ramírez',             total: 29.90,  tipo: 'Boleta'  },
  { comprobante: 'F001-00004', fecha: '2025-05-01', cliente: 'Distribuidora Norte',      total: 780.00, tipo: 'Factura' },
  { comprobante: 'B001-00008', fecha: '2025-05-01', cliente: 'Sofía Torres',             total: 14.20,  tipo: 'Boleta'  },
  { comprobante: 'B001-00009', fecha: '2025-04-30', cliente: 'Inés Flores',              total: 88.00,  tipo: 'Boleta'  },
  { comprobante: 'F001-00005', fecha: '2025-04-30', cliente: 'Corporación Lima S.A.',    total: 2100.00,tipo: 'Factura' },
  { comprobante: 'B001-00010', fecha: '2025-04-29', cliente: 'Martín Rojas',             total: 42.00,  tipo: 'Boleta'  },
];

let ventasFiltradas = [...ventasSimuladas];

// ─── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  renderUserInfo();
  renderTabla(ventasFiltradas);
  calcularResumen(ventasFiltradas);
  setupFiltros();
});

// ─── RENDER TABLA ─────────────────────────────────────────────────────────
function renderTabla(datos) {
  const tbody = document.getElementById('hist-tbody');

  if (datos.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No se encontraron ventas para ese período.</td></tr>`;
    return;
  }

  tbody.innerHTML = datos.map(v => {
    const tipoBadge = v.tipo === 'Factura'
      ? `<span class="badge badge-info">🧾 Factura</span>`
      : `<span class="badge badge-success">📄 Boleta</span>`;
    const fecha = new Date(v.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    const total = v.total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return `
      <tr>
        <td><span style="font-family:'JetBrains Mono',monospace;font-weight:600;color:#0f4c81;">${v.comprobante}</span></td>
        <td>${fecha}</td>
        <td>${v.cliente}</td>
        <td><strong style="font-family:'JetBrains Mono',monospace;">S/ ${total}</strong></td>
        <td>${tipoBadge}</td>
      </tr>
    `;
  }).join('');

  document.getElementById('total-registros').textContent =
    datos.length + ' registro' + (datos.length !== 1 ? 's' : '');
}

// ─── RESUMEN ──────────────────────────────────────────────────────────────
function calcularResumen(datos) {
  const totalMonto = datos.reduce((s, v) => s + v.total, 0);
  const boletas  = datos.filter(v => v.tipo === 'Boleta').length;
  const facturas = datos.filter(v => v.tipo === 'Factura').length;

  const fmt = n => n.toLocaleString('es-PE', { minimumFractionDigits: 2 });

  const elTotal    = document.getElementById('res-total');
  const elBoletas  = document.getElementById('res-boletas');
  const elFacturas = document.getElementById('res-facturas');
  const elCount    = document.getElementById('res-count');

  if (elTotal)    elTotal.textContent    = 'S/ ' + fmt(totalMonto);
  if (elBoletas)  elBoletas.textContent  = boletas;
  if (elFacturas) elFacturas.textContent = facturas;
  if (elCount)    elCount.textContent    = datos.length;
}

// ─── FILTROS ───────────────────────────────────────────────────────────────
function setupFiltros() {
  document.getElementById('btn-filtrar').addEventListener('click', aplicarFiltros);
  document.getElementById('btn-limpiar').addEventListener('click', limpiarFiltros);
}

function aplicarFiltros() {
  const desde = document.getElementById('fecha-desde').value;
  const hasta = document.getElementById('fecha-hasta').value;
  const tipo  = document.getElementById('filtro-tipo').value;

  ventasFiltradas = ventasSimuladas.filter(v => {
    const fecha = v.fecha;
    const cumpleFecha = (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
    const cumpleTipo  = !tipo || v.tipo === tipo;
    return cumpleFecha && cumpleTipo;
  });

  renderTabla(ventasFiltradas);
  calcularResumen(ventasFiltradas);
}

function limpiarFiltros() {
  document.getElementById('fecha-desde').value = '';
  document.getElementById('fecha-hasta').value = '';
  document.getElementById('filtro-tipo').value = '';
  ventasFiltradas = [...ventasSimuladas];
  renderTabla(ventasFiltradas);
  calcularResumen(ventasFiltradas);
}
