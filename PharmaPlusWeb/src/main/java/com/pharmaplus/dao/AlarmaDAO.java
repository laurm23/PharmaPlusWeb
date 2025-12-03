package com.pharmaplus.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.pharmaplus.modelo.Alarma;
import com.pharmaplus.util.ConexionDB;

/**
 * DAO para gestionar operaciones CRUD de Alarma
 */
public class AlarmaDAO {
    
    private Connection connection;
    
    public AlarmaDAO() {
        try {
            this.connection = ConexionDB.getInstance().getConnection();
        } catch (SQLException e) {
            System.err.println("[AlarmaDAO ERROR] No se pudo obtener conexión: " + e.getMessage());
        }
    }
    
    /**
     * Crear nueva alarma
     */
    public boolean crear(Alarma alarma) throws SQLException {
        String sql = "INSERT INTO alarmas (tipo, producto_id, proveedor_id, leida, completada) " +
                     "VALUES (?, ?, ?, ?, ?)";
        
        try (PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, alarma.getTipo());
            
            if (alarma.getProductoId() != null) {
                ps.setLong(2, alarma.getProductoId());
            } else {
                ps.setNull(2, Types.BIGINT);
            }
            
            if (alarma.getProveedorId() != null) {
                ps.setLong(3, alarma.getProveedorId());
            } else {
                ps.setNull(3, Types.BIGINT);
            }
            
            ps.setBoolean(4, alarma.isLeida());
            ps.setBoolean(5, alarma.isCompletada());
            
            int resultado = ps.executeUpdate();
            
            if (resultado > 0) {
                ResultSet rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    alarma.setId(rs.getLong(1));
                }
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Obtener alarma por ID
     */
    public Alarma obtenerPorId(Long id) throws SQLException {
        String sql = "SELECT * FROM alarmas WHERE id = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, id);
            
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                return mapearAlarma(rs);
            }
        }
        
        return null;
    }
    
    /**
     * Listar todas las alarmas activas (no completadas)
     */
    public List<Alarma> listarActivas() throws SQLException {
        List<Alarma> alarmas = new ArrayList<>();
        String sql = "SELECT * FROM alarmas WHERE completada = FALSE ORDER BY fecha_creacion DESC";
        
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                alarmas.add(mapearAlarma(rs));
            }
        }
        
        return alarmas;
    }
    
    /**
     * Listar alarmas por tipo
     */
    public List<Alarma> listarPorTipo(String tipo) throws SQLException {
        List<Alarma> alarmas = new ArrayList<>();
        String sql = "SELECT * FROM alarmas WHERE tipo = ? AND completada = FALSE ORDER BY fecha_creacion DESC";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, tipo);
            
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                alarmas.add(mapearAlarma(rs));
            }
        }
        
        return alarmas;
    }
    
    /**
     * Listar alarmas no leídas
     */
    public List<Alarma> listarNoLeidas() throws SQLException {
        List<Alarma> alarmas = new ArrayList<>();
        String sql = "SELECT * FROM alarmas WHERE leida = FALSE AND completada = FALSE ORDER BY fecha_creacion DESC";
        
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                alarmas.add(mapearAlarma(rs));
            }
        }
        
        return alarmas;
    }
    
    /**
     * Actualizar estado de alarma (leída/completada)
     */
    public boolean actualizar(Alarma alarma) throws SQLException {
        String sql = "UPDATE alarmas SET leida = ?, completada = ?, fecha_completada = ? WHERE id = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setBoolean(1, alarma.isLeida());
            ps.setBoolean(2, alarma.isCompletada());
            
            if (alarma.isCompletada()) {
                ps.setTimestamp(3, new Timestamp(System.currentTimeMillis()));
            } else {
                ps.setNull(3, Types.TIMESTAMP);
            }
            
            ps.setLong(4, alarma.getId());
            
            return ps.executeUpdate() > 0;
        }
    }
    
    /**
     * Marcar alarma como leída
     */
    public boolean marcarComoLeida(Long id, boolean leida) throws SQLException {
        String sql = "UPDATE alarmas SET leida = ? WHERE id = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setBoolean(1, leida);
            ps.setLong(2, id);
            
            return ps.executeUpdate() > 0;
        }
    }
    
    /**
     * Completar alarma
     */
    public boolean completar(Long id) throws SQLException {
        String sql = "UPDATE alarmas SET completada = TRUE, fecha_completada = CURRENT_TIMESTAMP WHERE id = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, id);
            return ps.executeUpdate() > 0;
        }
    }
    
    /**
     * Eliminar alarma
     */
    public boolean eliminar(Long id) throws SQLException {
        String sql = "DELETE FROM alarmas WHERE id = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, id);
            return ps.executeUpdate() > 0;
        }
    }
    
    /**
     * Eliminar alarmas de un producto
     */
    public boolean eliminarPorProducto(Long productoId) throws SQLException {
        String sql = "DELETE FROM alarmas WHERE producto_id = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, productoId);
            return ps.executeUpdate() > 0;
        }
    }
    
    /**
     * Eliminar alarmas de un proveedor
     */
    public boolean eliminarPorProveedor(Long proveedorId) throws SQLException {
        String sql = "DELETE FROM alarmas WHERE proveedor_id = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, proveedorId);
            return ps.executeUpdate() > 0;
        }
    }
    
    /**
     * Generar alarmas automáticamente (llamar al procedimiento almacenado)
     */
    public void generarAlarmas() throws SQLException {
        String sql = "{CALL sp_generar_alarmas()}";
        
        try (CallableStatement cs = connection.prepareCall(sql)) {
            cs.execute();
            System.out.println("[AlarmaDAO] Alarmas generadas automáticamente");
        }
    }
    
    /**
     * Verificar si existe una alarma similar activa
     */
    public boolean existeAlarmaActiva(String tipo, Long productoId, Long proveedorId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM alarmas " +
                     "WHERE tipo = ? AND completada = FALSE ";
        
        if (productoId != null) {
            sql += "AND producto_id = ? ";
        }
        if (proveedorId != null) {
            sql += "AND proveedor_id = ? ";
        }
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            int index = 1;
            ps.setString(index++, tipo);
            
            if (productoId != null) {
                ps.setLong(index++, productoId);
            }
            if (proveedorId != null) {
                ps.setLong(index++, proveedorId);
            }
            
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        }
        
        return false;
    }
    
    /**
     * Contar alarmas activas por tipo
     */
    public int contarPorTipo(String tipo) throws SQLException {
        String sql = "SELECT COUNT(*) FROM alarmas WHERE tipo = ? AND completada = FALSE";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, tipo);
            
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1);
            }
        }
        
        return 0;
    }
    
    /**
     * Contar total de alarmas activas
     */
    public int contarActivas() throws SQLException {
        String sql = "SELECT COUNT(*) FROM alarmas WHERE completada = FALSE";
        
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            if (rs.next()) {
                return rs.getInt(1);
            }
        }
        
        return 0;
    }
    
    /**
     * Mapear ResultSet a objeto Alarma
     */
    private Alarma mapearAlarma(ResultSet rs) throws SQLException {
        Alarma alarma = new Alarma();
        alarma.setId(rs.getLong("id"));
        alarma.setTipo(rs.getString("tipo"));
        
        long productoId = rs.getLong("producto_id");
        if (!rs.wasNull()) {
            alarma.setProductoId(productoId);
        }
        
        long proveedorId = rs.getLong("proveedor_id");
        if (!rs.wasNull()) {
            alarma.setProveedorId(proveedorId);
        }
        
        alarma.setLeida(rs.getBoolean("leida"));
        alarma.setCompletada(rs.getBoolean("completada"));
        alarma.setFechaCreacion(rs.getTimestamp("fecha_creacion").getTime());
        
        Timestamp fechaCompletada = rs.getTimestamp("fecha_completada");
        if (fechaCompletada != null) {
            alarma.setFechaCompletada(fechaCompletada.getTime());
        }
        
        return alarma;
    }
}