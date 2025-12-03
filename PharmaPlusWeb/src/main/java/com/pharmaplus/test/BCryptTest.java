package com.pharmaplus.test;

import org.mindrot.jbcrypt.BCrypt;

public class BCryptTest {
    
    public static void main(String[] args) {
        String password = "admin123";
        
        System.out.println("=== GENERANDO HASH PARA: " + password + " ===\n");
        
        // Generar hash con BCrypt
        String hashGenerado = BCrypt.hashpw(password, BCrypt.gensalt(10));
        
        System.out.println("Hash generado:");
        System.out.println(hashGenerado);
        System.out.println();
        
        // Verificar que el hash funciona
        boolean verificacion = BCrypt.checkpw(password, hashGenerado);
        System.out.println("Verificación: " + (verificacion ? "✓ CORRECTO" : "✗ ERROR"));
        System.out.println();
        
        // Generar el SQL para actualizar
        System.out.println("=== COPIA Y EJECUTA ESTE SQL EN PHPMYADMIN ===\n");
        System.out.println("UPDATE usuarios");
        System.out.println("SET password = '" + hashGenerado + "'");
        System.out.println("WHERE email = 'admin@pharmaplus.com';\n");
        
        // Verificar que se puede leer correctamente
        System.out.println("=== PRUEBA DE LECTURA ===");
        System.out.println("Si copias este hash: " + hashGenerado);
        System.out.println("Y verificas con 'admin123': " + BCrypt.checkpw(password, hashGenerado));
    }
}