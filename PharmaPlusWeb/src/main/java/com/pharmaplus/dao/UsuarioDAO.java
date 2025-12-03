package com.pharmaplus.dao;

import java.sql.*;
import org.mindrot.jbcrypt.BCrypt;

import java.util.ArrayList;
import java.util.List;
import com.pharmaplus.modelo.Usuario;
import com.pharmaplus.util.ConexionDB;

/**
 * DAO para gestionar operaciones CRUD de Usuario
 */
public class UsuarioDAO {
    
    private Connection connection;
    
    public UsuarioDAO() {
        try {
            this.connection = ConexionDB.getInstance().getConnection();
        } catch (SQLException e) {
            System.err.println("[UsuarioDAO ERROR] No se pudo obtener conexión: " + e.getMessage());
        }
    }
    
    /**
     * Autentica un usuario por email y contraseña
     */
    public Usuario autenticar(String email, String password) throws SQLException {
    	System.out.println("=== VERIFICACIÓN DETALLADA ===");
        System.out.println("Email recibido: [" + email + "]");
        System.out.println("Contraseña recibida: [" + password + "]");
        System.out.println("Longitud contraseña: " + password.length());
        System.out.println("Bytes contraseña: " + java.util.Arrays.toString(password.getBytes()));
        System.out.println("===============================");
    	
    	String sql = "SELECT * FROM usuarios WHERE email = ? AND activo = TRUE";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, email);
            
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                String storedPassword = rs.getString("password");
                
                // *** AGREGAR ESTOS LOGS DE DEPURACIÓN ***
                System.out.println("=== DEBUG AUTENTICACIÓN ===");
                System.out.println("Email encontrado: " + email);
                System.out.println("Hash almacenado: " + storedPassword);
                System.out.println("Contraseña ingresada: " + password);
                System.out.println("BCrypt checkpw resultado: " + BCrypt.checkpw(password, storedPassword));
                System.out.println("==========================");
                
                if (BCrypt.checkpw(password, storedPassword)) {
                    Usuario usuario = new Usuario();
                    usuario.setId(rs.getLong("id"));
                    usuario.setEmail(rs.getString("email"));
                    usuario.setNombre(rs.getString("nombre"));
                    usuario.setRol(rs.getString("rol"));
                    usuario.setActivo(rs.getBoolean("activo"));
                    usuario.setFechaCreacion(rs.getTimestamp("fecha_creacion"));
                    
                    actualizarUltimoAcceso(usuario.getId());
                    
                    return usuario;
                } else {
                    System.out.println("ERROR: Contraseña incorrecta");
                }
            } else {
                System.out.println("ERROR: Email no encontrado en la base de datos");
            }
        }
        
        return null;
    }
    
    /**
     * Actualiza la fecha de último acceso
     */
    private void actualizarUltimoAcceso(Long usuarioId) throws SQLException {
        String sql = "UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, usuarioId);
            ps.executeUpdate();
        }
    }
    
    /**
     * Crear nuevo usuario
     */
    public boolean crear(Usuario usuario) throws SQLException {
        String sql = "INSERT INTO usuarios (email, password, nombre, rol, activo) VALUES (?, ?, ?, ?, ?)";
        
        try (PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, usuario.getEmail());
            ps.setString(2, usuario.getPassword());
            ps.setString(3, usuario.getNombre());
            ps.setString(4, usuario.getRol());
            ps.setBoolean(5, usuario.isActivo());
            
            int resultado = ps.executeUpdate();
            
            if (resultado > 0) {
                ResultSet rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    usuario.setId(rs.getLong(1));
                }
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Obtener usuario por ID
     */
    public Usuario obtenerPorId(Long id) throws SQLException {
        String sql = "SELECT * FROM usuarios WHERE id = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, id);
            
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                Usuario usuario = new Usuario();
                usuario.setId(rs.getLong("id"));
                usuario.setEmail(rs.getString("email"));
                usuario.setPassword(rs.getString("password"));
                usuario.setNombre(rs.getString("nombre"));
                usuario.setRol(rs.getString("rol"));
                usuario.setActivo(rs.getBoolean("activo"));
                usuario.setFechaCreacion(rs.getTimestamp("fecha_creacion"));
                usuario.setUltimoAcceso(rs.getTimestamp("ultimo_acceso"));
                
                return usuario;
            }
        }
        
        return null;
    }
    
    /**
     * Listar todos los usuarios
     */
    public List<Usuario> listarTodos() throws SQLException {
        List<Usuario> usuarios = new ArrayList<>();
        String sql = "SELECT * FROM usuarios ORDER BY nombre";
        
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Usuario usuario = new Usuario();
                usuario.setId(rs.getLong("id"));
                usuario.setEmail(rs.getString("email"));
                usuario.setNombre(rs.getString("nombre"));
                usuario.setRol(rs.getString("rol"));
                usuario.setActivo(rs.getBoolean("activo"));
                usuario.setFechaCreacion(rs.getTimestamp("fecha_creacion"));
                usuario.setUltimoAcceso(rs.getTimestamp("ultimo_acceso"));
                
                usuarios.add(usuario);
            }
        }
        
        return usuarios;
    }
    
    /**
     * Actualizar usuario
     */
    public boolean actualizar(Usuario usuario) throws SQLException {
        String sql = "UPDATE usuarios SET email = ?, password = ?, nombre = ?, rol = ?, activo = ? WHERE id = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, usuario.getEmail());
            ps.setString(2, usuario.getPassword());
            ps.setString(3, usuario.getNombre());
            ps.setString(4, usuario.getRol());
            ps.setBoolean(5, usuario.isActivo());
            ps.setLong(6, usuario.getId());
            
            return ps.executeUpdate() > 0;
        }
    }
    
    /**
     * Eliminar usuario
     */
    public boolean eliminar(Long id) throws SQLException {
        String sql = "DELETE FROM usuarios WHERE id = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, id);
            return ps.executeUpdate() > 0;
        }
    }
    
    /**
     * Verificar si existe un email
     */
    public boolean existeEmail(String email) throws SQLException {
        String sql = "SELECT COUNT(*) FROM usuarios WHERE email = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, email);
            
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        }
        
        return false;
    }
}