package com.pharmaplus.servlets;

import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import com.pharmaplus.dao.UsuarioDAO;
import com.pharmaplus.modelo.Usuario;

/**
 * Servlet para autenticación de usuarios con base de datos
 */
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private UsuarioDAO usuarioDAO;
    
    @Override
    public void init() throws ServletException {
        super.init();
        usuarioDAO = new UsuarioDAO();
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String email = request.getParameter("email");
        String contrasena = request.getParameter("contrasena");
        
        System.out.println("=== LOGIN DEBUG ===");
        System.out.println("Email: " + email);
        
        // Validación de campos
        if (email == null || email.trim().isEmpty() || 
            contrasena == null || contrasena.trim().isEmpty()) {
            
            System.out.println("Validación fallida: campos vacíos");
            request.setAttribute("error", "Completa todos los campos");
            request.getRequestDispatcher("/login.jsp").forward(request, response);
            return;
        }
        
        try {
            // Autenticar usuario con la base de datos
            Usuario usuario = usuarioDAO.autenticar(email, contrasena);
            
            if (usuario != null) {
                // Usuario autenticado exitosamente
                HttpSession session = request.getSession();
                session.setAttribute("usuarioId", usuario.getId());
                session.setAttribute("usuarioEmail", usuario.getEmail());
                session.setAttribute("usuarioNombre", usuario.getNombre());
                session.setAttribute("usuarioRol", usuario.getRol());
                
                System.out.println("Login exitoso: " + usuario.getNombre());
                System.out.println("Rol: " + usuario.getRol());
                
                // Registrar en auditoría (opcional)
                // auditarAccion(usuario.getId(), "LOGIN", request.getRemoteAddr());
                
                // Redirigir al inicio
                String redirectURL = request.getContextPath() + "/inicio";
                System.out.println("Redirect URL: " + redirectURL);
                response.sendRedirect(redirectURL);
                
            } else {
                // Credenciales incorrectas
                System.out.println("Autenticación fallida: credenciales incorrectas");
                request.setAttribute("error", "Email o contraseña incorrectos");
                request.getRequestDispatcher("/login.jsp").forward(request, response);
            }
            
        } catch (SQLException e) {
            System.err.println("Error en login: " + e.getMessage());
            e.printStackTrace();
            
            request.setAttribute("error", "Error en el sistema. Intenta más tarde.");
            request.getRequestDispatcher("/login.jsp").forward(request, response);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // Si alguien accede a /login por GET, redirigir al formulario
        response.sendRedirect(request.getContextPath() + "/login.jsp");
    }
}