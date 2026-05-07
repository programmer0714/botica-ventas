# 🏥 Botica Nova Salud — Frontend

Sistema de Ventas para Botica Nova Salud  
**Carrera:** Ingeniería de Software con IA — SENATI

---

## 🛠️ Stack Tecnológico
- **React 18** + Vite
- **HTML5 + CSS3** (CSS Modules + Variables CSS)
- **JavaScript ES6+**
- **React Router v6** — Navegación entre páginas
- **Recharts** — Gráficos del dashboard y reportes
- **Axios** — Conexión con el backend (API REST)

---

## 📁 Estructura del Proyecto

```
botica-frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   ├── images/     ← 🖼️ Colocar imágenes aquí (ver README)
│   │   └── icons/      ← 🖼️ Colocar íconos SVG aquí (ver README)
│   ├── components/
│   │   ├── Layout.jsx       ← Estructura general (sidebar + topbar)
│   │   ├── Sidebar.jsx      ← Menú lateral
│   │   └── TopBar.jsx       ← Barra superior
│   ├── pages/
│   │   ├── Login.jsx         ← Pantalla de acceso
│   │   ├── Dashboard.jsx     ← Inicio con estadísticas
│   │   ├── Ventas.jsx        ← Boleta y Factura
│   │   ├── Inventario.jsx    ← Gestión de productos
│   │   ├── Reclamaciones.jsx ← Libro de reclamaciones
│   │   ├── Devoluciones.jsx  ← Devoluciones de productos
│   │   ├── Caja.jsx          ← Apertura y cierre de caja
│   │   └── Reportes.jsx      ← Gráficos y estadísticas
│   ├── styles/
│   │   ├── variables.css    ← Colores rgba + gradientes
│   │   └── global.css       ← Estilos base reutilizables
│   ├── App.jsx              ← Rutas principales
│   └── main.jsx             ← Punto de entrada
├── package.json
└── vite.config.js
```

---

## 🚀 Cómo ejecutar

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo
npm run dev

# 3. Abrir en el navegador
http://localhost:3000
```

---

## 🎨 Colores del Sistema
Todos los colores están en **rgba con gradientes** en `src/styles/variables.css`

| Variable               | Color                          |
|------------------------|--------------------------------|
| `--color-primary`      | rgba(13, 122, 95, 1) — Verde   |
| `--color-danger`       | rgba(192, 57, 43, 1) — Rojo    |
| `--color-accent`       | rgba(240, 165, 0, 1) — Amarillo|
| `--color-info`         | rgba(26, 111, 168, 1) — Azul   |
| `--gradient-primary`   | Verde oscuro → Verde           |
| `--gradient-sidebar`   | Verde muy oscuro degradado     |

---

## 📌 Módulos del Sistema
| Módulo           | Ruta             | Descripción                          |
|------------------|------------------|--------------------------------------|
| Login            | /login           | Acceso al sistema                    |
| Dashboard        | /dashboard       | Resumen del día con gráficos         |
| Ventas           | /ventas          | Emisión de Boleta y Factura          |
| Inventario       | /inventario      | Control de stock y productos         |
| Reclamaciones    | /reclamaciones   | Libro de reclamaciones (Ley peruana) |
| Devoluciones     | /devoluciones    | Gestión de devoluciones              |
| Caja             | /caja            | Apertura y cierre de turno           |
| Reportes         | /reportes        | Análisis y estadísticas              |
