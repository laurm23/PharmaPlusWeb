package com.pharmaplus.filtros;

import java.io.IOException;
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Filtro para verificar autenticación en todas las páginas protegidas
 * Redirige al login si el usuario no tiene sesión activa
 */
@WebFilter(filterName = "FiltroAutenticacion", urlPatterns = {
    "/inicio",
    "/inicio.jsp",
    "/productos",
    "/inventario.jsp",
    "/proveedores.jsp",
    "/alarmas",
    "/alarmas.jsp",
    "/api/*"
})
public class FiltroAutenticacion implements Filter {
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("[FiltroAutenticacion] Filtro de autenticación inicializado");
    }
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        HttpSession session = httpRequest.getSession(false);
        
        String loginURI = httpRequest.getContextPath() + "/login.jsp";
        String requestURI = httpRequest.getRequestURI();
        
        boolean isLoggedIn = (session != null && session.getAttribute("usuarioEmail") != null);
        boolean isLoginRequest = requestURI.equals(loginURI);
        boolean isLoginPage = requestURI.endsWith("login.jsp");
        boolean isLoginServlet = requestURI.endsWith("/login");
        
        // Permitir acceso a recursos públicos
        if (isLoggedIn || isLoginRequest || isLoginPage || isLoginServlet) {
            // Usuario autenticado o intentando acceder al login
            chain.doFilter(request, response);
        } else {
            // Usuario no autenticado, redirigir al login
            System.out.println("[FiltroAutenticacion] Acceso denegado a: " + requestURI);
            httpResponse.sendRedirect(loginURI);
        }
    }
    
    @Override
    public void destroy() {
        System.out.println("[FiltroAutenticacion] Filtro de autenticación destruido");
    }
}