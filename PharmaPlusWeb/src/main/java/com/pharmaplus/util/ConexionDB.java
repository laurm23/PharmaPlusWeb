package com.pharmaplus.util;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Clase para gestionar la conexión a la base de datos
 * Implementa el patrón Singleton
 */
public class ConexionDB {

    private static ConexionDB instance;
    private Connection connection;

    // Parámetros de conexión
    private String url;
    private String username;
    private String password;
    private String driver;

    /**
     * Constructor privado (Singleton)
     */
    private ConexionDB() {
        try {
            cargarConfiguracion();

            // Cargar el driver JDBC usando el valor de db.properties o por defecto
            Class.forName(driver);

            System.out.println("[ConexionDB] Driver cargado correctamente -> " + driver);

        } catch (ClassNotFoundException e) {
            System.err.println("[ConexionDB ERROR] Driver JDBC no encontrado: " + e.getMessage());
            throw new RuntimeException("Error al cargar driver JDBC", e);
        }
    }

    /**
     * Carga la configuración desde db.properties
     */
    private void cargarConfiguracion() {
        Properties props = new Properties();

        try (InputStream input = getClass().getClassLoader()
                .getResourceAsStream("db.properties")) {

            if (input == null) {
                System.out.println("[ConexionDB] db.properties no encontrado. Usando configuración por defecto.");
                usarConfiguracionPorDefecto();
                return;
            }

            props.load(input);

            this.url = props.getProperty("db.url");
            this.username = props.getProperty("db.username");
            this.password = props.getProperty("db.password");
            this.driver = props.getProperty("db.driver");

            System.out.println("[ConexionDB] Configuración cargada desde db.properties");

        } catch (IOException e) {
            System.err.println("[ConexionDB ERROR] Error al leer db.properties: " + e.getMessage());
            usarConfiguracionPorDefecto();
        }
    }

    /**
     * Configuración por defecto si no existe db.properties
     */
    private void usarConfiguracionPorDefecto() {
        this.url = "jdbc:mariadb://localhost:3306/pharmaplus_db";
        this.username = "root";
        this.password = "";
        this.driver = "org.mariadb.jdbc.Driver";

        System.out.println("[ConexionDB] Usando configuración por defecto (MariaDB)");
    }

    public static ConexionDB getInstance() {
        if (instance == null) {
            synchronized (ConexionDB.class) {
                if (instance == null) {
                    instance = new ConexionDB();
                }
            }
        }
        return instance;
    }

    public Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            connection = DriverManager.getConnection(url, username, password);
            System.out.println("[ConexionDB] Conexión establecida con la base de datos");
        }
        return connection;
    }

    public void cerrarConexion() {
        if (connection != null) {
            try {
                connection.close();
                System.out.println("[ConexionDB] Conexión cerrada");
            } catch (SQLException e) {
                System.err.println("[ConexionDB ERROR] Error al cerrar conexión: " + e.getMessage());
            }
        }
    }

    public boolean esConexionValida() {
        try {
            return connection != null && !connection.isClosed() && connection.isValid(2);
        } catch (SQLException e) {
            return false;
        }
    }

    public static boolean probarConexion() {
        try {
            ConexionDB db = ConexionDB.getInstance();
            Connection conn = db.getConnection();

            if (conn != null && !conn.isClosed()) {
                System.out.println("[ConexionDB] ✓ Prueba de conexión exitosa");
                System.out.println("[ConexionDB] Base de datos: " + conn.getCatalog());
                System.out.println("[ConexionDB] Usuario: " + db.username);
                return true;
            }

            return false;

        } catch (SQLException e) {
            System.err.println("[ConexionDB ERROR] ✗ Prueba de conexión fallida");
            System.err.println("[ConexionDB ERROR] Mensaje: " + e.getMessage());
            return false;
        }
    }

    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("PHARMAPLUS - PRUEBA DE CONEXIÓN BD");
        System.out.println("========================================\n");

        if (probarConexion()) {
            System.out.println("\n✓ Sistema de base de datos funcionando correctamente");
        } else {
            System.out.println("\n✗ Error en el sistema de base de datos");
            System.out.println("Verifica:");
            System.out.println("1. MariaDB está corriendo");
            System.out.println("2. La base de datos 'pharmaplus_db' existe");
            System.out.println("3. Las credenciales en db.properties son correctas");
            System.out.println("4. El driver MariaDB está en el classpath");
        }

        System.out.println("\n========================================");
    }
}
