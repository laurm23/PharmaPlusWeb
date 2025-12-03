package com.pharmaplus.servlets;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/*@WebServlet("/inicio")*/
public class InicioServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        System.out.println("=== INICIO SERVLET ===");
        
        HttpSession session = request.getSession();
        
        if (session.getAttribute("usuarioEmail") == null) {
            System.out.println("No hay sesion, redirigiendo a login");
            response.sendRedirect(request.getContextPath() + "/login.jsp");
            return;
        }
        
        System.out.println("Sesion OK, mostrando inicio.jsp");
        
        // Calcular metricas (valores por defecto)
        request.setAttribute("totalProductos", 0);
        request.setAttribute("productosAgotados", 0);
        request.setAttribute("productosStockBajo", 0);
        request.setAttribute("productosProximosVencer", 0);
        
        request.getRequestDispatcher("/inicio.jsp").forward(request, response);
    }
}