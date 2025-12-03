package com.pharmaplus.test;

import org.junit.*;
import static org.junit.Assert.*;

import com.pharmaplus.modelo.Proveedor;

/**
 * Pruebas unitarias para el modelo Proveedor
 */
public class ProveedorTest {
    
    private Proveedor proveedor;
    
    @Before
    public void setUp() {
        proveedor = new Proveedor();
    }
    
    @Test
    public void testAgregarProducto() {
        System.out.println("Ejecutando: testAgregarProducto");
        
        proveedor.agregarProducto(1L);
        proveedor.agregarProducto(2L);
        
        assertEquals("Debe tener 2 productos", 2, proveedor.getTotalProductos());
        assertTrue("Debe contener el producto 1", 
                   proveedor.getProductosIds().contains(1L));
        assertTrue("Debe contener el producto 2", 
                   proveedor.getProductosIds().contains(2L));
    }
    
    @Test
    public void testEliminarProducto() {
        System.out.println("Ejecutando: testEliminarProducto");
        
        proveedor.agregarProducto(1L);
        proveedor.agregarProducto(2L);
        proveedor.eliminarProducto(1L);
        
        assertEquals("Debe tener 1 producto", 1, proveedor.getTotalProductos());
        assertFalse("No debe contener el producto 1", 
                    proveedor.getProductosIds().contains(1L));
        assertTrue("Debe contener el producto 2", 
                   proveedor.getProductosIds().contains(2L));
    }
    
    @Test
    public void testPrevenirDuplicados() {
        System.out.println("Ejecutando: testPrevenirDuplicados");
        
        proveedor.agregarProducto(1L);
        proveedor.agregarProducto(1L);
        
        assertEquals("Solo debe contar 1 producto", 
                     1, 
                     proveedor.getTotalProductos());
    }
    
    @Test
    public void testCapitalizacionNombre() {
        System.out.println("Ejecutando: testCapitalizacionNombre");
        
        proveedor.setNombreProveedor("farmalab");
        
        assertEquals("El nombre debe capitalizarse", 
                     "Farmalab", 
                     proveedor.getNombreProveedor());
    }
    
    @Test
    public void testEstadoInicial() {
        System.out.println("Ejecutando: testEstadoInicial");
        
        assertEquals("El estado inicial debe ser activo", 
                     "activo", 
                     proveedor.getEstadoProveedor());
        assertEquals("El total de productos inicial debe ser 0", 
                     0, 
                     proveedor.getTotalProductos());
    }
}