package com.pharmaplus.test;

import org.junit.*;
import static org.junit.Assert.*;
import java.sql.SQLException;
import java.util.List;

import com.pharmaplus.dao.AlarmaDAO;
import com.pharmaplus.modelo.Alarma;

/**
 * Pruebas unitarias para AlarmaDAO
 */
public class AlarmaDAOTest {
    
    private static AlarmaDAO alarmaDAO;
    private Alarma alarmaPrueba;
    
    @BeforeClass
    public static void configurarClase() {
        alarmaDAO = new AlarmaDAO();
        System.out.println("Iniciando pruebas de AlarmaDAO");
    }
    
    @Before
    public void setUp() {
        alarmaPrueba = new Alarma();
        alarmaPrueba.setTipo("stock-bajo");
        alarmaPrueba.setProductoId(1L);
        alarmaPrueba.setLeida(false);
        alarmaPrueba.setCompletada(false);
    }
    
    @Test
    public void testCrearAlarma() throws SQLException {
        System.out.println("Ejecutando: testCrearAlarma");
        
        boolean resultado = alarmaDAO.crear(alarmaPrueba);
        
        assertTrue("La alarma debe crearse correctamente", resultado);
        assertNotNull("El ID debe asignarse", alarmaPrueba.getId());
    }
    
    @Test
    public void testObtenerAlarmaPorId() throws SQLException {
        System.out.println("Ejecutando: testObtenerAlarmaPorId");
        
        alarmaDAO.crear(alarmaPrueba);
        
        Alarma alarmaRecuperada = alarmaDAO.obtenerPorId(alarmaPrueba.getId());
        
        assertNotNull("La alarma debe existir", alarmaRecuperada);
        assertEquals("El tipo debe coincidir", 
                     alarmaPrueba.getTipo(), 
                     alarmaRecuperada.getTipo());
    }
    
    @Test
    public void testListarAlarmasActivas() throws SQLException {
        System.out.println("Ejecutando: testListarAlarmasActivas");
        
        alarmaDAO.crear(alarmaPrueba);
        
        List<Alarma> alarmas = alarmaDAO.listarActivas();
        
        assertNotNull("La lista no debe ser nula", alarmas);
        assertTrue("Debe haber al menos una alarma", alarmas.size() > 0);
        
        for (Alarma a : alarmas) {
            assertFalse("Todas las alarmas deben estar incompletas", a.isCompletada());
        }
    }
    
    @Test
    public void testListarPorTipo() throws SQLException {
        System.out.println("Ejecutando: testListarPorTipo");
        
        alarmaDAO.crear(alarmaPrueba);
        
        List<Alarma> alarmas = alarmaDAO.listarPorTipo("stock-bajo");
        
        assertNotNull("La lista no debe ser nula", alarmas);
        
        for (Alarma a : alarmas) {
            assertEquals("Todas deben ser del tipo solicitado", 
                        "stock-bajo", 
                        a.getTipo());
        }
    }
    
    @Test
    public void testMarcarComoLeida() throws SQLException {
        System.out.println("Ejecutando: testMarcarComoLeida");
        
        alarmaDAO.crear(alarmaPrueba);
        
        boolean resultado = alarmaDAO.marcarComoLeida(alarmaPrueba.getId(), true);
        
        assertTrue("La operación debe ser exitosa", resultado);
        
        Alarma alarmaActualizada = alarmaDAO.obtenerPorId(alarmaPrueba.getId());
        assertTrue("La alarma debe estar marcada como leída", 
                   alarmaActualizada.isLeida());
    }
    
    @Test
    public void testCompletarAlarma() throws SQLException {
        System.out.println("Ejecutando: testCompletarAlarma");
        
        alarmaDAO.crear(alarmaPrueba);
        
        boolean resultado = alarmaDAO.completar(alarmaPrueba.getId());
        
        assertTrue("La operación debe ser exitosa", resultado);
        
        Alarma alarmaCompletada = alarmaDAO.obtenerPorId(alarmaPrueba.getId());
        assertTrue("La alarma debe estar completada", 
                   alarmaCompletada.isCompletada());
        assertNotEquals("Debe tener fecha de completado", 
                       0, 
                       alarmaCompletada.getFechaCompletada());
    }
    
    @Test
    public void testContarAlarmasActivas() throws SQLException {
        System.out.println("Ejecutando: testContarAlarmasActivas");
        
        int contador = alarmaDAO.contarActivas();
        
        assertTrue("El contador debe ser mayor o igual a 0", contador >= 0);
    }
    
    @Test
    public void testEliminarAlarma() throws SQLException {
        System.out.println("Ejecutando: testEliminarAlarma");
        
        alarmaDAO.crear(alarmaPrueba);
        Long idCreado = alarmaPrueba.getId();
        
        boolean resultado = alarmaDAO.eliminar(idCreado);
        
        assertTrue("La eliminación debe ser exitosa", resultado);
    }
    
    @After
    public void tearDown() throws SQLException {
        if (alarmaPrueba.getId() != null) {
            try {
                alarmaDAO.eliminar(alarmaPrueba.getId());
            } catch (Exception e) {
                // Ignorar errores
            }
        }
    }
    
    @AfterClass
    public static void limpiarClase() {
        System.out.println("Pruebas de AlarmaDAO finalizadas\n");
    }
}