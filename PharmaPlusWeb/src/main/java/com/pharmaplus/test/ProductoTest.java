package com.pharmaplus.test;

import org.junit.*;
import static org.junit.Assert.*;

import com.pharmaplus.modelo.Producto;

/**
 * Pruebas unitarias para el modelo Producto
 */
public class ProductoTest {
    
    private Producto producto;
    
    @Before
    public void setUp() {
        producto = new Producto();
    }
    
    @Test
    public void testConstructorVacio() {
        System.out.println("Ejecutando: testConstructorVacio");
        
        assertNotNull("El ID debe generarse", producto.getId());
        assertTrue("La fecha de creación debe establecerse", 
                   producto.getFechaCreacion() > 0);
    }
    
    @Test
    public void testObtenerNombreCompleto() {
        System.out.println("Ejecutando: testObtenerNombreCompleto");
        
        producto.setNombreProducto("Paracetamol");
        producto.setConcentracionCantidad("500");
        producto.setConcentracionUnidad("mg");
        
        String nombreCompleto = producto.obtenerNombreCompleto();
        
        assertEquals("El nombre completo debe formarse correctamente", 
                     "Paracetamol 500mg", 
                     nombreCompleto);
    }
    
    @Test
    public void testObtenerEstadoStockAlto() {
        System.out.println("Ejecutando: testObtenerEstadoStockAlto");
        
        producto.setStock(80);
        producto.setStockInicial(100);
        
        assertEquals("El estado debe ser alto", 
                     "alto", 
                     producto.obtenerEstado());
    }
    
    @Test
    public void testObtenerEstadoStockMedio() {
        System.out.println("Ejecutando: testObtenerEstadoStockMedio");
        
        producto.setStock(50);
        producto.setStockInicial(100);
        
        assertEquals("El estado debe ser medio", 
                     "medio", 
                     producto.obtenerEstado());
    }
    
    @Test
    public void testObtenerEstadoStockBajo() {
        System.out.println("Ejecutando: testObtenerEstadoStockBajo");
        
        producto.setStock(20);
        producto.setStockInicial(100);
        
        assertEquals("El estado debe ser bajo", 
                     "bajo", 
                     producto.obtenerEstado());
    }
    
    @Test
    public void testCapitalizacionNombre() {
        System.out.println("Ejecutando: testCapitalizacionNombre");
        
        producto.setNombreProducto("paracetamol");
        
        assertEquals("El nombre debe capitalizarse", 
                     "Paracetamol", 
                     producto.getNombreProducto());
    }
    
    @Test
    public void testCapitalizacionCategoria() {
        System.out.println("Ejecutando: testCapitalizacionCategoria");
        
        producto.setCategoria("analgesico");
        
        assertEquals("La categoría debe capitalizarse", 
                     "Analgesico", 
                     producto.getCategoria());
    }
}