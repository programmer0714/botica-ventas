// inventario.js — Módulo de Inventario

// ─── DATOS SIMULADOS ───────────────────────────────────────────────────────
let productos = [
  { id: 1,  nombre: 'Amoxicilina 500mg',         lab: 'Hersil',   categoria: 'Antibióticos',    presentacion: 'Cápsula',    stockActual: 8,   stockMinimo: 20 },
  { id: 2,  nombre: 'Paracetamol 120mg/5mL',     lab: 'Portugal', categoria: 'Analgésicos',      presentacion: 'Jarabe',     stockActual: 5,   stockMinimo: 20 },
  { id: 3,  nombre: 'Diclofenaco 75mg/3mL',      lab: 'Pharma',   categoria: 'Antiinflamatorios',presentacion: 'Inyectable', stockActual: 12,  stockMinimo: 20 },
  { id: 4,  nombre: 'Ibuprofeno 400mg',           lab: 'Abott',    categoria: 'Analgésicos',      presentacion: 'Tableta',    stockActual: 85,  stockMinimo: 30 },
  { id: 5,  nombre: 'Loratadina 10mg',            lab: 'Hersil',   categoria: 'Antialérgicos',    presentacion: 'Tableta',    stockActual: 60,  stockMinimo: 25 },
  { id: 6,  nombre: 'Omeprazol 20mg',             lab: 'Portugal', categoria: 'Gastrointestinal', presentacion: 'Cápsula',    stockActual: 110, stockMinimo: 40 },
  { id: 7,  nombre: 'Metformina 850mg',           lab: 'Abott',    categoria: 'Antidiabéticos',   presentacion: 'Tableta',    stockActual: 75,  stockMinimo: 30 },
  { id: 8,  nombre: 'Atorvastatina 20mg',         lab: 'Pharma',   categoria: 'Cardiovascular',   presentacion: 'Tableta',    stockActual: 45,  stockMinimo: 20 },
  { id: 9,  nombre: 'Salbutamol 100mcg',          lab: 'Hersil',   categoria: 'Respiratorio',     presentacion: 'Inhalador',  stockActual: 18,  stockMinimo: 15 },
  { id: 10, nombre: 'Vitamina C 1000mg',          lab: 'Portugal', categoria: 'Vitaminas',        presentacion: 'Tableta',    stockActual: 200, stockMinimo: 50 },
];

let productoEditando = null;

// ─── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  renderUserInfo();
  renderTabla();
  setupFiltro();
  setupModal();
});

// ─── RENDER TABLA ─────────────────────────────────────────────────────────
function renderTabla(filtro = '') {
  const tbody = document.getElementById('inv-tbody');
  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.lab.toLowerCase().includes(filtro.toLowerCase()) ||
    p.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  if (filtrados.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">No se encontraron productos.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtrados.map(p => {
    const bajo = p.stockActual < p.stockMinimo;
    const stockClass = bajo ? 'stock-low' : 'stock-ok';
    const badgeTipo = bajo
      ? `<span class="badge badge-danger" style="font-size:10px;">Stock bajo</span>`
      : `<span class="badge badge-success" style="font-size:10px;">Normal</span>`;

    return `
      <tr>
        <td><span style="font-family:'JetBrains Mono',monospace;color:#718096;">#${String(p.id).padStart(3,'0')}</span></td>
        <td>
          <div style="font-weight:600;color:#1a202c;">${p.nombre}</div>
          <div style="font-size:11px;color:#718096;">${p.presentacion}</div>
        </td>
        <td>${p.lab}</td>
        <td>${p.categoria}</td>
        <td>
          <span class="${stockClass}" style="font-family:'JetBrains Mono',monospace;font-size:15px;">${p.stockActual}</span>
          ${badgeTipo}
        </td>
        <td style="color:#718096;">${p.stockMinimo}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="abrirModalStock(${p.id})">
            ✏️ Editar Stock
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Actualizar contador
  const contEl = document.getElementById('total-productos');
  if (contEl) contEl.textContent = filtrados.length + ' producto' + (filtrados.length !== 1 ? 's' : '');
}

// ─── FILTRO ────────────────────────────────────────────────────────────────
function setupFiltro() {
  const input = document.getElementById('filtro-buscar');
  if (!input) return;
  input.addEventListener('input', () => renderTabla(input.value));
}

// ─── MODAL EDITAR STOCK ────────────────────────────────────────────────────
function setupModal() {
  document.getElementById('modal-cancelar').addEventListener('click', cerrarModal);
  document.getElementById('modal-guardar').addEventListener('click', guardarStock);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) cerrarModal();
  });
  document.getElementById('modal-nuevo-stock').addEventListener('keydown', e => {
    if (e.key === 'Enter') guardarStock();
  });
}

function abrirModalStock(id) {
  productoEditando = productos.find(p => p.id === id);
  if (!productoEditando) return;

  document.getElementById('modal-producto-nombre').textContent = productoEditando.nombre;
  document.getElementById('modal-stock-actual').textContent = productoEditando.stockActual;
  document.getElementById('modal-nuevo-stock').value = productoEditando.stockActual;
  document.getElementById('modal-error').style.display = 'none';
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('modal-nuevo-stock').focus(), 100);
}

function cerrarModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  productoEditando = null;
}

function guardarStock() {
  const input = document.getElementById('modal-nuevo-stock');
  const errorEl = document.getElementById('modal-error');
  const nuevoStock = parseInt(input.value);

  if (isNaN(nuevoStock) || nuevoStock < 0) {
    errorEl.textContent = 'Por favor ingresa un número válido (≥ 0).';
    errorEl.style.display = 'block';
    return;
  }

  // Actualizar datos
  const idx = productos.findIndex(p => p.id === productoEditando.id);
  if (idx !== -1) {
    productos[idx].stockActual = nuevoStock;
  }

  cerrarModal();
  const filtro = document.getElementById('filtro-buscar')?.value || '';
  renderTabla(filtro);

  // Toast de confirmación
  mostrarToast('✔ Stock actualizado correctamente');
}

// ─── TOAST ─────────────────────────────────────────────────────────────────
function mostrarToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed; bottom:28px; right:28px; z-index:999;
      background:#0f4c81; color:#fff;
      padding:12px 22px; border-radius:10px;
      font-size:13px; font-weight:600;
      box-shadow:0 6px 24px rgba(15,76,129,0.35);
      transition: opacity 0.4s; opacity:0;
      font-family:'Sora',sans-serif;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 2800);
}
