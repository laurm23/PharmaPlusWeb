package com.pharmaplus.test;

import org.junit.*;
import static org.junit.Assert.*;
import java.sql.SQLException;
import java.util.List;

import com.pharmaplus.dao.UsuarioDAO;
import com.pharmaplus.modelo.Usuario;

/**
 * Pruebas unitarias para UsuarioDAO
 */
public class UsuarioDAOTest {
    
    private static UsuarioDAO usuarioDAO;
    private Usuario usuarioPrueba;
    
    @BeforeClass
    public static void configurarClase() {
        usuarioDAO = new UsuarioDAO();
        System.out.println("Iniciando pruebas de UsuarioDAO");
    }
    
    @Before
    public void setUp() {
        usuarioPrueba = new Usuario();
        usuarioPrueba.setEmail("test" + System.currentTimeMillis() + "@test.com");
        usuarioPrueba.setPassword("$2a$10$N9qo8uLOickgx2ZMRZoMye7r9JOE/YF4h2FLwKj1lBXc8jKGVPf7y");
        usuarioPrueba.setNombre("Usuario Test");
        usuarioPrueba.setRol("Usuario");
        usuarioPrueba.setActivo(true);
    }
    
    @Test
    public void testCrearUsuario() throws SQLException {
        System.out.println("Ejecutando: testCrearUsuario");
        
        boolean resultado = usuarioDAO.crear(usuarioPrueba);
        
        assertTrue("El usuario debe crearse correctamente", resultado);
        assertNotNull("El ID debe asignarse automáticamente", usuarioPrueba.getId());
        assertTrue("El ID debe ser mayor a 0", usuarioPrueba.getId() > 0);
    }
    
    @Test
    public void testObtenerUsuarioPorId() throws SQLException {
        System.out.println("Ejecutando: testObtenerUsuarioPorId");
        
        usuarioDAO.crear(usuarioPrueba);
        Long idCreado = usuarioPrueba.getId();
        
        Usuario usuarioRecuperado = usuarioDAO.obtenerPorId(idCreado);
        
        assertNotNull("El usuario debe existir", usuarioRecuperado);
        assertEquals("El email debe coincidir", 
                     usuarioPrueba.getEmail(), 
                     usuarioRecuperado.getEmail());
        assertEquals("El nombre debe coincidir", 
                     usuarioPrueba.getNombre(), 
                     usuarioRecuperado.getNombre());
    }
    
    @Test
    public void testListarTodosUsuarios() throws SQLException {
        System.out.println("Ejecutando: testListarTodosUsuarios");
        
        usuarioDAO.crear(usuarioPrueba);
        
        List<Usuario> usuarios = usuarioDAO.listarTodos();
        
        assertNotNull("La lista no debe ser nula", usuarios);
        assertTrue("Debe haber al menos un usuario", usuarios.size() > 0);
    }
    
    @Test
    public void testActualizarUsuario() throws SQLException {
        System.out.println("Ejecutando: testActualizarUsuario");
        
        usuarioDAO.crear(usuarioPrueba);
        
        usuarioPrueba.setNombre("Nombre Actualizado");
        boolean resultado = usuarioDAO.actualizar(usuarioPrueba);
        
        assertTrue("La actualización debe ser exitosa", resultado);
        
        Usuario usuarioActualizado = usuarioDAO.obtenerPorId(usuarioPrueba.getId());
        assertEquals("El nombre debe estar actualizado", 
                     "Nombre Actualizado", 
                     usuarioActualizado.getNombre());
    }
    
    @Test
    public void testEliminarUsuario() throws SQLException {
        System.out.println("Ejecutando: testEliminarUsuario");
        
        usuarioDAO.crear(usuarioPrueba);
        Long idCreado = usuarioPrueba.getId();
        
        boolean resultado = usuarioDAO.eliminar(idCreado);
        
        assertTrue("La eliminación debe ser exitosa", resultado);
        
        Usuario usuarioEliminado = usuarioDAO.obtenerPorId(idCreado);
        assertNull("El usuario no debe existir después de eliminarlo", usuarioEliminado);
    }
    
    @Test
    public void testExisteEmail() throws SQLException {
        System.out.println("Ejecutando: testExisteEmail");
        
        usuarioDAO.crear(usuarioPrueba);
        
        boolean existe = usuarioDAO.existeEmail(usuarioPrueba.getEmail());
        assertTrue("El email debe existir", existe);
        
        boolean noExiste = usuarioDAO.existeEmail("emailinexistente@test.com");
        assertFalse("El email no debe existir", noExiste);
    }
    
    @Test
    public void testAutenticarUsuarioValido() throws SQLException {
        System.out.println("Ejecutando: testAutenticarUsuarioValido");
        
        Usuario usuario = usuarioDAO.autenticar("admin@pharmaplus.com", "admin123");
        
        assertNotNull("La autenticación debe ser exitosa", usuario);
        assertEquals("El email debe coincidir", 
                     "admin@pharmaplus.com", 
                     usuario.getEmail());
    }
    
    @Test
    public void testAutenticarUsuarioInvalido() throws SQLException {
        System.out.println("Ejecutando: testAutenticarUsuarioInvalido");
        
        Usuario usuario = usuarioDAO.autenticar("admin@pharmaplus.com", "passwordincorrecto");
        
        assertNull("La autenticación debe fallar con password incorrecto", usuario);
    }
    
    @After
    public void tearDown() throws SQLException {
        if (usuarioPrueba.getId() != null) {
            try {
                usuarioDAO.eliminar(usuarioPrueba.getId());
            } catch (Exception e) {
                // Ignorar errores de limpieza
            }
        }
    }
    
    @AfterClass
    public static void limpiarClase() {
        System.out.println("Pruebas de UsuarioDAO finalizadas\n");
    }
}