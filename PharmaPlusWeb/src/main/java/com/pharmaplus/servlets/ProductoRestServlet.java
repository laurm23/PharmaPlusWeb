package com.pharmaplus.servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import com.google.gson.Gson;
import com.pharmaplus.modelo.Producto;
import com.pharmaplus.modelo.Alarma;
import com.pharmaplus.util.GestorAlarmas;

/**
 * API REST para gestionar productos
 * Devuelve respuestas en formato JSON
 */
@WebServlet("/api/productos/*")
public class ProductoRestServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private Gson gson = new Gson();
    
    /**
     * GET /api/productos - Listar todos los productos
     * GET /api/productos/{id} - Obtener un producto específico
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        HttpSession session = request.getSession();
        
        @SuppressWarnings("unchecked")
        List<Producto> productos = (List<Producto>) session.getAttribute("productos");
        if (productos == null) {
            productos = new ArrayList<>();
        }
        
        String pathInfo = request.getPathInfo();
        
        // GET /api/productos/{id}
        if (pathInfo != null && !pathInfo.equals("/")) {
            try {
                Long id = Long.parseLong(pathInfo.substring(1));
                Producto producto = productos.stream()
                    .filter(p -> p.getId().equals(id))
                    .findFirst()
                    .orElse(null);
                
                if (producto != null) {
                    out.print(gson.toJson(producto));
                    response.setStatus(HttpServletResponse.SC_OK);
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.print("{\"error\":\"Producto no encontrado\"}");
                }
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"error\":\"ID inválido\"}");
            }
        } 
        // GET /api/productos
        else {
            out.print(gson.toJson(productos));
            response.setStatus(HttpServletResponse.SC_OK);
        }
        
        out.flush();
    }
    
    /**
     * POST /api/productos - Crear un nuevo producto
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        request.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            // Leer el cuerpo JSON
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                sb.append(line);
            }
            
            // Convertir JSON a objeto Producto
            Producto producto = gson.fromJson(sb.toString(), Producto.class);
            
            // Validar campos requeridos
            if (producto.getNombreProducto() == null || producto.getNombreProducto().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"error\":\"El nombre del producto es requerido\"}");
                out.flush();
                return;
            }
            
            // Obtener lista de productos
            HttpSession session = request.getSession();
            @SuppressWarnings("unchecked")
            List<Producto> productos = (List<Producto>) session.getAttribute("productos");
            if (productos == null) {
                productos = new ArrayList<>();
            }
            
            // Agregar producto
            productos.add(producto);
            session.setAttribute("productos", productos);
            
            // Generar alarmas automáticamente
            GestorAlarmas.generarAlarmas(session);
            
            // Respuesta exitosa
            response.setStatus(HttpServletResponse.SC_CREATED);
            out.print(gson.toJson(producto));
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Error al procesar el producto: " + e.getMessage() + "\"}");
        }
        
        out.flush();
    }
    
    /**
     * PUT /api/productos/{id} - Actualizar un producto existente
     */
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        request.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"ID de producto requerido\"}");
            out.flush();
            return;
        }
        
        try {
            Long id = Long.parseLong(pathInfo.substring(1));
            
            // Leer el cuerpo JSON
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                sb.append(line);
            }
            
            Producto productoActualizado = gson.fromJson(sb.toString(), Producto.class);
            
            HttpSession session = request.getSession();
            @SuppressWarnings("unchecked")
            List<Producto> productos = (List<Producto>) session.getAttribute("productos");
            
            if (productos == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"No hay productos registrados\"}");
                out.flush();
                return;
            }
            
            boolean encontrado = false;
            for (Producto p : productos) {
                if (p.getId().equals(id)) {
                    // Actualizar campos
                    p.setNombreProducto(productoActualizado.getNombreProducto());
                    p.setConcentracionCantidad(productoActualizado.getConcentracionCantidad());
                    p.setConcentracionUnidad(productoActualizado.getConcentracionUnidad());
                    p.setCategoria(productoActualizado.getCategoria());
                    p.setCodigo(productoActualizado.getCodigo());
                    p.setNumeroLote(productoActualizado.getNumeroLote());
                    p.setProveedor(productoActualizado.getProveedor());
                    p.setLaboratorio(productoActualizado.getLaboratorio());
                    p.setStock(productoActualizado.getStock());
                    p.setUbicacion(productoActualizado.getUbicacion());
                    p.setPrecio(productoActualizado.getPrecio());
                    p.setFechaRegistro(productoActualizado.getFechaRegistro());
                    p.setFechaVencimiento(productoActualizado.getFechaVencimiento());
                    
                    encontrado = true;
                    
                    session.setAttribute("productos", productos);
                    
                    // Generar alarmas automáticamente
                    GestorAlarmas.generarAlarmas(session);
                    
                    response.setStatus(HttpServletResponse.SC_OK);
                    out.print(gson.toJson(p));
                    break;
                }
            }
            
            if (!encontrado) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"Producto no encontrado\"}");
            }
            
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"ID inválido\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Error al actualizar: " + e.getMessage() + "\"}");
        }
        
        out.flush();
    }
    
    /**
     * DELETE /api/productos/{id} - Eliminar un producto
     */
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"ID de producto requerido\"}");
            out.flush();
            return;
        }
        
        try {
            Long id = Long.parseLong(pathInfo.substring(1));
            
            HttpSession session = request.getSession();
            @SuppressWarnings("unchecked")
            List<Producto> productos = (List<Producto>) session.getAttribute("productos");
            
            if (productos == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"No hay productos registrados\"}");
                out.flush();
                return;
            }
            
            boolean eliminado = productos.removeIf(p -> p.getId().equals(id));
            
            if (eliminado) {
                session.setAttribute("productos", productos);
                
                // Generar alarmas automáticamente
                GestorAlarmas.generarAlarmas(session);
                
                response.setStatus(HttpServletResponse.SC_OK);
                out.print("{\"message\":\"Producto eliminado exitosamente\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"Producto no encontrado\"}");
            }
            
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"ID inválido\"}");
        }
        
        out.flush();
    }
}