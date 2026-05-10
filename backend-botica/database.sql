-- ============================================
-- BASE DE DATOS: Botica Nova Salud
-- ============================================
CREATE DATABASE IF NOT EXISTS botica_nova_salud;
USE botica_nova_salud;

CREATE TABLE Laboratorios (
    id_laboratorio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(15),
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE Categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE Presentaciones (
    id_presentacion INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE Cargos (
    id_cargo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cargo VARCHAR(50) NOT NULL
);

CREATE TABLE Empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    dni CHAR(8) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    id_cargo INT,
    FOREIGN KEY (id_cargo) REFERENCES Cargos(id_cargo)
);

CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    id_empleado INT UNIQUE,
    FOREIGN KEY (id_empleado) REFERENCES Empleados(id_empleado)
);

CREATE TABLE Productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_laboratorio INT,
    id_categoria INT,
    id_presentacion INT,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 20,
    fecha_vencimiento DATE,
    estado VARCHAR(20) DEFAULT 'Disponible',
    FOREIGN KEY (id_laboratorio) REFERENCES Laboratorios(id_laboratorio),
    FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria),
    FOREIGN KEY (id_presentacion) REFERENCES Presentaciones(id_presentacion)
);

CREATE TABLE Clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento VARCHAR(10) NOT NULL,
    numero_documento VARCHAR(11) UNIQUE,
    nombre_razon_social VARCHAR(150) NOT NULL
);

CREATE TABLE Tipos_Comprobantes (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    serie CHAR(4) NOT NULL,
    correlativo_actual INT DEFAULT 0
);

CREATE TABLE Ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo_comprobante INT,
    serie CHAR(4),
    correlativo VARCHAR(10),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    forma_pago VARCHAR(20) DEFAULT 'Contado',
    id_cliente INT,
    id_usuario INT,
    subtotal DECIMAL(10,2) NOT NULL,
    igv DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Activa',
    FOREIGN KEY (id_tipo_comprobante) REFERENCES Tipos_Comprobantes(id_tipo),
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

CREATE TABLE Detalle_Ventas (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT,
    id_producto INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

CREATE TABLE Devoluciones (
    id_devolucion INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT,
    id_producto INT,
    cantidad INT NOT NULL,
    motivo TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

CREATE TABLE Reclamaciones (
    id_reclamacion INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT,
    motivo TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta)
);

-- ============================================
-- DATOS INICIALES
-- ============================================
INSERT INTO Laboratorios (nombre) VALUES ('Pharma'),('Portugal'),('Hersil'),('Abott');
INSERT INTO Categorias (nombre) VALUES ('Analgésico'),('Antibiótico'),('Antiinflamatorio'),('Antialérgico'),('Gastrointestinal'),('Vitaminas');
INSERT INTO Presentaciones (nombre) VALUES ('Pastilla'),('Cápsula'),('Jarabe'),('Inyectable'),('Inhalador');
INSERT INTO Tipos_Comprobantes (nombre, serie, correlativo_actual) VALUES ('BOLETA','B001',0),('FACTURA','F001',0);
INSERT INTO Cargos (nombre_cargo) VALUES ('Administrador'),('Vendedor'),('Almacenero');

-- Empleado y usuario admin (password: 123456 con bcrypt)
INSERT INTO Empleados (dni, nombres, apellidos, id_cargo) VALUES ('12345678','Admin','Sistema',1);
INSERT INTO Usuarios (username, password_hash, id_empleado) VALUES
('admin','$2b$10$rOzJqQ1V5v5zQ1V5v5zQ1.rOzJqQ1V5v5zQ1V5v5zQ1V5v5zQ1V5',1);

INSERT INTO Productos (nombre, id_laboratorio, id_categoria, id_presentacion, precio, stock, stock_minimo, fecha_vencimiento, estado) VALUES
('Paracetamol 500mg', 2, 1, 1, 1.20, 80,  20, '2026-08-15', 'Disponible'),
('Amoxicilina 500mg', 1, 2, 2, 0.85, 8,   20, '2025-12-01', 'Stock Bajo'),
('Ibuprofeno 400mg',  3, 1, 1, 1.50, 45,  20, '2027-03-20', 'Disponible'),
('Diclofenaco Iny.',  1, 3, 4, 2.30, 3,   15, '2025-11-10', 'Por Vencer'),
('Paracetamol Jrb.',  2, 1, 3, 8.50, 12,  15, '2026-01-05', 'Stock Bajo');
