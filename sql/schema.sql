-- PHARMAPLUS DATABASE SCHEMA LIMPIADO Y CORREGIDO

-- ====================================
-- LIMPIEZA PREVIA (para evitar errores)
-- ====================================

DROP VIEW IF EXISTS vista_alarmas_activas;
DROP VIEW IF EXISTS vista_productos_completa;

DROP TRIGGER IF EXISTS trg_producto_after_update;
DROP TRIGGER IF EXISTS trg_producto_after_insert;

DROP PROCEDURE IF EXISTS sp_generar_alarmas;
DROP PROCEDURE IF EXISTS sp_registrar_auditoria;

-- ====================================
-- TABLAS
-- ====================================

-- TABLA: USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'Hash BCrypt de la contraseña',
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'Usuario' COMMENT 'Administrador, Farmaceutico, Usuario',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: PROVEEDORES
CREATE TABLE IF NOT EXISTS proveedores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_proveedor VARCHAR(150) NOT NULL,
    nit VARCHAR(50) NOT NULL UNIQUE,
    ciudad VARCHAR(100) NOT NULL,
    pais VARCHAR(100) NOT NULL DEFAULT 'Colombia',
    direccion VARCHAR(255) NOT NULL,
    fecha_fin_contrato DATE NULL,
    estado_proveedor VARCHAR(20) NOT NULL DEFAULT 'activo',
    nombre_contacto VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(10) NULL,
    numero_identificacion VARCHAR(50) NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    notas TEXT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nit (nit),
    INDEX idx_estado (estado_proveedor),
    INDEX idx_nombre (nombre_proveedor),
    INDEX idx_fecha_contrato (fecha_fin_contrato)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(150) NOT NULL,
    concentracion_cantidad VARCHAR(20) NOT NULL,
    concentracion_unidad VARCHAR(10) NOT NULL COMMENT 'mg, ml, g',
    categoria VARCHAR(100) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    numero_lote VARCHAR(50) NOT NULL,
    proveedor_id BIGINT NOT NULL,
    laboratorio VARCHAR(100) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_inicial INT NOT NULL,
    ubicacion VARCHAR(50) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    fecha_registro DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_nombre (nombre_producto),
    INDEX idx_codigo (codigo),
    INDEX idx_categoria (categoria),
    INDEX idx_proveedor (proveedor_id),
    INDEX idx_stock (stock),
    INDEX idx_fecha_vencimiento (fecha_vencimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: ALARMAS
CREATE TABLE IF NOT EXISTS alarmas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    producto_id BIGINT NULL,
    proveedor_id BIGINT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    completada BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_completada TIMESTAMP NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_tipo (tipo),
    INDEX idx_producto (producto_id),
    INDEX idx_proveedor (proveedor_id),
    INDEX idx_completada (completada),
    INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: AUDITORIA
CREATE TABLE IF NOT EXISTS auditoria (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    accion VARCHAR(50) NOT NULL,
    tabla_afectada VARCHAR(50) NOT NULL,
    registro_id BIGINT NULL,
    datos_anteriores TEXT NULL,
    datos_nuevos TEXT NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50) NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_accion (accion),
    INDEX idx_tabla (tabla_afectada),
    INDEX idx_fecha (fecha_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- VISTAS
-- ====================================

CREATE OR REPLACE VIEW vista_productos_completa AS
SELECT 
    p.id,
    p.nombre_producto,
    p.concentracion_cantidad,
    p.concentracion_unidad,
    CONCAT(p.nombre_producto, ' ', p.concentracion_cantidad, p.concentracion_unidad) AS nombre_completo,
    p.categoria,
    p.codigo,
    p.numero_lote,
    p.laboratorio,
    p.stock,
    p.stock_inicial,
    ROUND((p.stock / p.stock_inicial) * 100, 2) AS porcentaje_stock,
    CASE 
        WHEN p.stock = 0 THEN 'agotado'
        WHEN (p.stock / p.stock_inicial) <= 0.33 THEN 'bajo'
        WHEN (p.stock / p.stock_inicial) <= 0.66 THEN 'medio'
        ELSE 'alto'
    END AS estado_stock,
    p.ubicacion,
    p.precio,
    p.fecha_registro,
    p.fecha_vencimiento,
    DATEDIFF(p.fecha_vencimiento, CURDATE()) AS dias_para_vencer,
    prov.id AS proveedor_id,
    prov.nombre_proveedor,
    prov.telefono AS proveedor_telefono,
    prov.correo AS proveedor_correo,
    p.fecha_creacion,
    p.fecha_actualizacion
FROM productos p
INNER JOIN proveedores prov ON p.proveedor_id = prov.id;

CREATE OR REPLACE VIEW vista_alarmas_activas AS
SELECT 
    a.id,
    a.tipo,
    a.leida,
    a.completada,
    a.fecha_creacion,
    CASE 
        WHEN a.producto_id IS NOT NULL THEN p.nombre_producto
        WHEN a.proveedor_id IS NOT NULL THEN prov.nombre_proveedor
    END AS nombre_referencia,
    CASE 
        WHEN a.producto_id IS NOT NULL THEN p.codigo
        WHEN a.proveedor_id IS NOT NULL THEN prov.nit
    END AS codigo_referencia,
    p.stock AS stock_actual,
    p.stock_inicial,
    p.fecha_vencimiento,
    prov.fecha_fin_contrato,
    prov.correo AS correo_proveedor
FROM alarmas a
LEFT JOIN productos p ON a.producto_id = p.id
LEFT JOIN proveedores prov ON a.proveedor_id = prov.id
WHERE a.completada = FALSE
ORDER BY a.fecha_creacion DESC;

-- ====================================
-- PROCEDIMIENTOS
-- ====================================

DELIMITER //

CREATE PROCEDURE sp_generar_alarmas()
BEGIN
    -- Alarmas de stock agotado
    INSERT INTO alarmas (tipo, producto_id, leida, completada)
    SELECT DISTINCT 'stock-agotado', p.id, FALSE, FALSE
    FROM productos p
    WHERE p.stock = 0
    AND NOT EXISTS (
        SELECT 1 FROM alarmas a 
        WHERE a.producto_id = p.id 
        AND a.tipo = 'stock-agotado' 
        AND a.completada = FALSE
    );
    
    -- Alarmas de stock bajo
    INSERT INTO alarmas (tipo, producto_id, leida, completada)
    SELECT DISTINCT 'stock-bajo', p.id, FALSE, FALSE
    FROM productos p
    WHERE p.stock > 0 
    AND p.stock_inicial > 0
    AND (p.stock / p.stock_inicial) <= 0.33
    AND NOT EXISTS (
        SELECT 1 FROM alarmas a 
        WHERE a.producto_id = p.id 
        AND a.tipo = 'stock-bajo' 
        AND a.completada = FALSE
    );

    -- Productos próximos a vencer
    INSERT INTO alarmas (tipo, producto_id, leida, completada)
    SELECT DISTINCT 'proximo-vencer', p.id, FALSE, FALSE
    FROM productos p
    WHERE DATEDIFF(p.fecha_vencimiento, CURDATE()) BETWEEN 0 AND 30
    AND NOT EXISTS (
        SELECT 1 FROM alarmas a 
        WHERE a.producto_id = p.id 
        AND a.tipo = 'proximo-vencer' 
        AND a.completada = FALSE
    );

    -- Contratos próximos a vencer
    INSERT INTO alarmas (tipo, proveedor_id, leida, completada)
    SELECT DISTINCT 'contrato-vencer', prov.id, FALSE, FALSE
    FROM proveedores prov
    WHERE prov.fecha_fin_contrato IS NOT NULL
    AND DATEDIFF(prov.fecha_fin_contrato, CURDATE()) BETWEEN 0 AND 30
    AND NOT EXISTS (
        SELECT 1 FROM alarmas a 
        WHERE a.proveedor_id = prov.id 
        AND a.tipo = 'contrato-vencer' 
        AND a.completada = FALSE
    );

    -- Limpiar alarmas obsoletas
    UPDATE alarmas a
    INNER JOIN productos p ON a.producto_id = p.id
    SET a.completada = TRUE
    WHERE a.tipo = 'stock-agotado' AND p.stock > 0 AND a.completada = FALSE;

    UPDATE alarmas a
    INNER JOIN productos p ON a.producto_id = p.id
    SET a.completada = TRUE
    WHERE a.tipo = 'stock-bajo' 
    AND (p.stock = 0 OR (p.stock / p.stock_inicial) > 0.33)
    AND a.completada = FALSE;
END //

CREATE PROCEDURE sp_registrar_auditoria(
    IN p_usuario_id BIGINT,
    IN p_accion VARCHAR(50),
    IN p_tabla VARCHAR(50),
    IN p_registro_id BIGINT,
    IN p_datos_anteriores TEXT,
    IN p_datos_nuevos TEXT,
    IN p_ip VARCHAR(50)
)
BEGIN
    INSERT INTO auditoria (
        usuario_id,
        accion,
        tabla_afectada,
        registro_id,
        datos_anteriores,
        datos_nuevos,
        ip_address
    ) VALUES (
        p_usuario_id,
        p_accion,
        p_tabla,
        p_registro_id,
        p_datos_anteriores,
        p_datos_nuevos,
        p_ip
    );
END //

DELIMITER ;

-- ====================================
-- TRIGGERS
-- ====================================

DELIMITER //

CREATE TRIGGER trg_producto_after_update
AFTER UPDATE ON productos
FOR EACH ROW
BEGIN
    IF OLD.stock != NEW.stock THEN
        CALL sp_generar_alarmas();
    END IF;
END //

CREATE TRIGGER trg_producto_after_insert
AFTER INSERT ON productos
FOR EACH ROW
BEGIN
    CALL sp_generar_alarmas();
END //

DELIMITER ;
