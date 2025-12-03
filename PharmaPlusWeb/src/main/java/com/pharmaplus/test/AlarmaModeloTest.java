package com.pharmaplus.test;

import org.junit.*;
import static org.junit.Assert.*;

import com.pharmaplus.modelo.Alarma;

/**
 * Pruebas unitarias para el modelo Alarma
 */
public class AlarmaTest {
    
    private Alarma alarma;
    
    @Before
    public void setUp() {
        alarma = new Alarma();
    }
    
    @Test
    public void testConstructorDefecto() {
        System.out.println("Ejecutando: testConstructorDefecto");
        
        assertNotNull("El ID debe generarse", alarma.getId());
        assertFalse("Debe iniciar como no leída", alarma.isLeida());
        assertFalse("Debe iniciar como no completada", alarma.isCompletada());
        assertTrue("Debe tener fecha de creación", 
                   alarma.getFechaCreacion() > 0);
        assertEquals("La fecha de completado debe ser 0", 
                    0, 
                    alarma.getFechaCompletada());
    }
    
    @Test
    public void testConstructorConParametros() {
        System.out.println("Ejecutando: testConstructorConParametros");
        
        Alarma alarmaConDatos = new Alarma("stock-bajo", 1L, null);
        
        assertNotNull("El ID debe generarse", alarmaConDatos.getId());
        assertEquals("El tipo debe ser stock-bajo", 
                    "stock-bajo", 
                    alarmaConDatos.getTipo());
        assertEquals("El productoId debe ser 1", 
                    Long.valueOf(1L), 
                    alarmaConDatos.getProductoId());
        assertNull("El proveedorId debe ser null", 
                  alarmaConDatos.getProveedorId());
    }
    
    @Test
    public void testCompletar() {
        System.out.println("Ejecutando: testCompletar");
        
        alarma.completar();
        
        assertTrue("Debe estar completada", alarma.isCompletada());
        assertTrue("Debe tener fecha de completado", 
                   alarma.getFechaCompletada() > 0);
    }
    
    @Test
    public void testToggleLeida() {
        System.out.println("Ejecutando: testToggleLeida");
        
        boolean estadoInicial = alarma.isLeida();
        alarma.toggleLeida();
        
        assertNotEquals("El estado debe cambiar", 
                       estadoInicial, 
                       alarma.isLeida());
        
        alarma.toggleLeida();
        
        assertEquals("Debe volver al estado inicial", 
                    estadoInicial, 
                    alarma.isLeida());
    }
    
    @Test
    public void testSetCompletadaEstableceFecha() {
        System.out.println("Ejecutando: testSetCompletadaEstableceFecha");
        
        alarma.setCompletada(true);
        
        assertTrue("Debe estar completada", alarma.isCompletada());
        assertTrue("Debe establecer fecha de completado automáticamente", 
                   alarma.getFechaCompletada() > 0);
    }
}