# Backend — Botica Nova Salud

API REST con Node.js + Express + MySQL

## Instalación

```bash
npm install
```

## Configuración

Edita el archivo `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=botica_nova_salud
JWT_SECRET=botica_nova_salud_secret_2025
```

## Base de datos

1. Importa el script SQL:
```bash
mysql -u root -p < database.sql
```

2. Genera el hash de la contraseña admin:
```bash
node generar-hash.js
```

3. Copia el SQL que muestra y ejecútalo en MySQL.

## Ejecutar

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor corre en: `http://localhost:4000`

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/ventas/dashboard | Datos del dashboard |
| GET | /api/productos | Listar productos |
| GET | /api/productos/buscar?q= | Buscar productos |
| GET | /api/productos/stock-bajo | Productos con stock bajo |
| PUT | /api/productos/:id/stock | Actualizar stock |
| POST | /api/productos | Crear producto |
| GET | /api/ventas | Historial de ventas |
| POST | /api/ventas | Registrar venta |
| GET | /api/clientes?doc= | Buscar cliente |
| POST | /api/clientes | Crear cliente |
| GET | /api/devoluciones | Listar devoluciones |
| POST | /api/devoluciones | Registrar devolución |
| GET | /api/reclamaciones | Listar reclamaciones |
| POST | /api/reclamaciones | Registrar reclamación |

## Autenticación

Todos los endpoints (excepto login) requieren token JWT en el header:
```
Authorization: Bearer <token>
```
