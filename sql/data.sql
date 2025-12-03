-- DATOS INICIALES PHARMAPLUS

-- USUARIOS INICIALES (EJEMPLO)
-- Contraseña: admin123 (BCrypt hash)
INSERT INTO usuarios (email, password, nombre, rol, activo) VALUES
('admin@pharmaplus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7r9JOE/YF4h2FLwKj1lBXc8jKGVPf7y', 'Administrador Principal', 'Administrador', TRUE),
('oliver@pharmaplus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7r9JOE/YF4h2FLwKj1lBXc8jKGVPf7y', 'Oliver Hernandez', 'Administrador', TRUE),
('farmaceutico@pharmaplus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7r9JOE/YF4h2FLwKj1lBXc8jKGVPf7y', 'Juan Pérez', 'Farmaceutico', TRUE);

-- PROVEEDORES DE EJEMPLO
INSERT INTO proveedores (
    nombre_proveedor, nit, ciudad, pais, direccion, 
    fecha_fin_contrato, estado_proveedor, nombre_contacto, 
    tipo_documento, numero_identificacion, telefono, correo, notas
) VALUES
(
    'FarmaLab S.A.S.', 
    '900123456-7', 
    'Bogotá', 
    'Colombia', 
    'Calle 100 #15-20', 
    DATE_ADD(CURDATE(), INTERVAL 25 DAY), 
    'activo', 
    'María González', 
    'CC', 
    '1234567890', 
    '3001234567', 
    'maria.gonzalez@farmalab.com', 
    'Proveedor principal de medicamentos genéricos'
),
(
    'MediSuministros Ltda.', 
    '900234567-8', 
    'Medellín', 
    'Colombia', 
    'Carrera 50 #80-45', 
    DATE_ADD(CURDATE(), INTERVAL 60 DAY), 
    'activo', 
    'Carlos Ramírez', 
    'CC', 
    '9876543210', 
    '3009876543', 
    'carlos.ramirez@medisuministros.com', 
    'Especializado en medicamentos importados'
),
(
    'Distribuidora FarmaPlus', 
    '900345678-9', 
    'Cali', 
    'Colombia', 
    'Avenida 6N #25-30', 
    DATE_ADD(CURDATE(), INTERVAL 90 DAY), 
    'activo', 
    'Ana María Torres', 
    'CC', 
    '5551234567', 
    '3105551234', 
    'ana.torres@farmaplus.com', 
    'Proveedor de insumos médicos'
);

-- PRODUCTOS DE EJEMPLO
INSERT INTO productos (
    nombre_producto, concentracion_cantidad, concentracion_unidad, 
    categoria, codigo, numero_lote, proveedor_id, laboratorio, 
    stock, stock_inicial, ubicacion, precio, 
    fecha_registro, fecha_vencimiento
) VALUES
-- Productos de FarmaLab (Stock bajo - genera alarma)
(
    'Paracetamol', '500', 'mg', 
    'Analgésico', 'PAR-500-001', 'L20241201', 1, 'MK', 
    10, 100, 'A1-E1', 5000.00, 
    CURDATE(), DATE_ADD(CURDATE(), INTERVAL 180 DAY)
),
(
    'Ibuprofeno', '400', 'mg', 
    'Antiinflamatorio', 'IBU-400-001', 'L20241202', 1, 'Genfar', 
    15, 150, 'A1-E2', 8000.00, 
    CURDATE(), DATE_ADD(CURDATE(), INTERVAL 150 DAY)
),
-- Producto agotado (genera alarma de stock agotado)
(
    'Amoxicilina', '500', 'mg', 
    'Antibiótico', 'AMO-500-001', 'L20241203', 1, 'Tecnoquímicas', 
    0, 200, 'A2-E1', 12000.00, 
    CURDATE(), DATE_ADD(CURDATE(), INTERVAL 120 DAY)
),
-- Producto próximo a vencer (genera alarma)
(
    'Omeprazol', '20', 'mg', 
    'Antiácido', 'OME-20-001', 'L20241204', 2, 'Laproff', 
    80, 100, 'A2-E2', 15000.00, 
    CURDATE(), DATE_ADD(CURDATE(), INTERVAL 25 DAY)
),
-- Productos normales
(
    'Losartán', '50', 'mg', 
    'Antihipertensivo', 'LOS-50-001', 'L20241205', 2, 'Bayer', 
    120, 150, 'A3-E1', 18000.00, 
    CURDATE(), DATE_ADD(CURDATE(), INTERVAL 360 DAY)
),
(
    'Metformina', '850', 'mg', 
    'Antidiabético', 'MET-850-001', 'L20241206', 3, 'Sanofi', 
    90, 100, 'A3-E2', 9000.00, 
    CURDATE(), DATE_ADD(CURDATE(), INTERVAL 270 DAY)
),
(
    'Atorvastatina', '20', 'mg', 
    'Hipolipemiante', 'ATO-20-001', 'L20241207', 3, 'Pfizer', 
    70, 100, 'A4-E1', 25000.00, 
    CURDATE(), DATE_ADD(CURDATE(), INTERVAL 300 DAY)
),
-- Más productos con stock bajo
(
    'Acetaminofén', '500', 'mg', 
    'Analgésico', 'ACE-500-001', 'L20241208', 1, 'MK', 
    20, 200, 'A4-E2', 4500.00, 
    CURDATE(), DATE_ADD(CURDATE(), INTERVAL 200 DAY)
),
(
    'Diclofenaco', '50', 'mg', 
    'Antiinflamatorio', 'DIC-50-001', 'L20241209', 2, 'Voltaren', 
    30, 150, 'A5-E1', 10000.00, 
    CURDATE(), DATE_ADD(CURDATE(), INTERVAL 220 DAY)
),
(
    'Loratadina', '10', 'mg', 
    'Antihistamínico', 'LOR-10-001', 'L20241210', 3, 'Laproff', 
    95, 100, 'A5-E2', 7000.00, 
    CURDATE(), DATE_ADD(CURDATE(), INTERVAL 240 DAY)
);

-- GENERAR ALARMAS INICIALES
CALL sp_generar_alarmas();

-- REGISTRAR AUDITORÍA INICIAL
CALL sp_registrar_auditoria(
    1, 
    'INSERT', 
    'usuarios', 
    1, 
    NULL, 
    'Usuario administrador creado', 
    '127.0.0.1'
);


-- CONSULTAS DE VERIFICACIÓN

-- Verificar usuarios creados
SELECT id, email, nombre, rol, activo FROM usuarios;

-- Verificar proveedores creados
SELECT id, nombre_proveedor, nit, correo, estado_proveedor FROM proveedores;

-- Verificar productos creados
SELECT 
    id, 
    nombre_producto, 
    CONCAT(concentracion_cantidad, concentracion_unidad) AS concentracion,
    stock,
    stock_inicial,
    ROUND((stock / stock_inicial) * 100, 2) AS porcentaje_stock
FROM productos;

-- Verificar alarmas generadas
SELECT 
    a.id,
    a.tipo,
    CASE 
        WHEN a.producto_id IS NOT NULL THEN p.nombre_producto
        WHEN a.proveedor_id IS NOT NULL THEN prov.nombre_proveedor
    END AS referencia,
    a.leida,
    a.completada,
    a.fecha_creacion
FROM alarmas a
LEFT JOIN productos p ON a.producto_id = p.id
LEFT JOIN proveedores prov ON a.proveedor_id = prov.id
WHERE a.completada = FALSE
ORDER BY a.fecha_creacion DESC;
