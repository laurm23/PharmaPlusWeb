package com.pharmaplus.servlets;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import com.pharmaplus.modelo.Producto;
import com.pharmaplus.util.GestorAlarmas;

/* Servlet que maneja todas las operaciones sobre productos:
   Crear, Leer, Actualizar, Eliminar */
/*@WebServlet("/productos")*/
public class ProductoServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    /* GET: Listar productos */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        
        // Obtener lista de productos de la sesion (simula base de datos)
        @SuppressWarnings("unchecked")
        List<Producto> productos = (List<Producto>) session.getAttribute("productos");
        
        if (productos == null) {
            productos = new ArrayList<>();
            session.setAttribute("productos", productos);
        }
        
        // Pasar la lista al JSP
        request.setAttribute("listaProductos", productos);
        request.getRequestDispatcher("inventario.jsp").forward(request, response);
    }
    
    /* POST: Crear nuevo producto */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Configurar encoding para caracteres especiales
        request.setCharacterEncoding("UTF-8");
        
        HttpSession session = request.getSession();
        
        @SuppressWarnings("unchecked")
        List<Producto> productos = (List<Producto>) session.getAttribute("productos");
        if (productos == null) {
            productos = new ArrayList<>();
        }
        
        // Crear nuevo producto con datos del formulario
        Producto producto = new Producto();
        producto.setNombreProducto(request.getParameter("nombreProducto"));
        producto.setConcentracionCantidad(request.getParameter("concentracionCantidad"));
        producto.setConcentracionUnidad(request.getParameter("concentracionUnidad"));
        producto.setCategoria(request.getParameter("categoria"));
        producto.setCodigo(request.getParameter("codigo"));
        producto.setNumeroLote(request.getParameter("numeroLote"));
        producto.setProveedor(request.getParameter("proveedor"));
        producto.setLaboratorio(request.getParameter("laboratorio"));
        producto.setStock(Integer.parseInt(request.getParameter("stock")));
        producto.setStockInicial(Integer.parseInt(request.getParameter("stock")));
        producto.setUbicacion(request.getParameter("ubicacion"));
        producto.setPrecio(Double.parseDouble(request.getParameter("precio")));
        producto.setFechaRegistro(request.getParameter("fechaRegistro"));
        producto.setFechaVencimiento(request.getParameter("fechaVencimiento"));
        
        // Agregar a la lista
        productos.add(producto);
        session.setAttribute("productos", productos);
        
        // Generar alarmas automaticamente
        GestorAlarmas.generarAlarmas(session);
        
        // Redirigir de vuelta al inventario
        response.sendRedirect("productos");
    }
    
    /* PUT: Actualizar producto existente */
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        
        Long id = Long.parseLong(request.getParameter("id"));
        HttpSession session = request.getSession();
        
        @SuppressWarnings("unchecked")
        List<Producto> productos = (List<Producto>) session.getAttribute("productos");
        
        if (productos != null) {
            for (Producto p : productos) {
                if (p.getId().equals(id)) {
                    // Actualizar campos
                    p.setNombreProducto(request.getParameter("nombreProducto"));
                    p.setConcentracionCantidad(request.getParameter("concentracionCantidad"));
                    p.setConcentracionUnidad(request.getParameter("concentracionUnidad"));
                    p.setCategoria(request.getParameter("categoria"));
                    p.setCodigo(request.getParameter("codigo"));
                    p.setNumeroLote(request.getParameter("numeroLote"));
                    p.setLaboratorio(request.getParameter("laboratorio"));
                    p.setStock(Integer.parseInt(request.getParameter("stock")));
                    p.setUbicacion(request.getParameter("ubicacion"));
                    p.setPrecio(Double.parseDouble(request.getParameter("precio")));
                    p.setFechaRegistro(request.getParameter("fechaRegistro"));
                    p.setFechaVencimiento(request.getParameter("fechaVencimiento"));
                    break;
                }
            }
            
            session.setAttribute("productos", productos);
            GestorAlarmas.generarAlarmas(session);
        }
        
        response.sendRedirect("productos");
    }
    
    /* DELETE: Eliminar producto */
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        Long id = Long.parseLong(request.getParameter("id"));
        HttpSession session = request.getSession();
        
        @SuppressWarnings("unchecked")
        List<Producto> productos = (List<Producto>) session.getAttribute("productos");
        
        if (productos != null) {
            productos.removeIf(p -> p.getId().equals(id));
            session.setAttribute("productos", productos);
            GestorAlarmas.generarAlarmas(session);
        }
        
        response.sendRedirect("productos");
    }
}
