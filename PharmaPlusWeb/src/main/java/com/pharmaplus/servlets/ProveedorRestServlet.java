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
import com.pharmaplus.modelo.Proveedor;
import com.pharmaplus.util.GestorAlarmas;

/**
 * API REST para gestionar proveedores
 */
@WebServlet("/api/proveedores/*")
public class ProveedorRestServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private Gson gson = new Gson();
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        HttpSession session = request.getSession();
        
        @SuppressWarnings("unchecked")
        List<Proveedor> proveedores = (List<Proveedor>) session.getAttribute("proveedores");
        if (proveedores == null) {
            proveedores = new ArrayList<>();
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo != null && !pathInfo.equals("/")) {
            try {
                Long id = Long.parseLong(pathInfo.substring(1));
                Proveedor proveedor = proveedores.stream()
                    .filter(p -> p.getId().equals(id))
                    .findFirst()
                    .orElse(null);
                
                if (proveedor != null) {
                    out.print(gson.toJson(proveedor));
                    response.setStatus(HttpServletResponse.SC_OK);
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.print("{\"error\":\"Proveedor no encontrado\"}");
                }
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"error\":\"ID inválido\"}");
            }
        } else {
            out.print(gson.toJson(proveedores));
            response.setStatus(HttpServletResponse.SC_OK);
        }
        
        out.flush();
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        request.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                sb.append(line);
            }
            
            Proveedor proveedor = gson.fromJson(sb.toString(), Proveedor.class);
            
            if (proveedor.getNombreProveedor() == null || proveedor.getNombreProveedor().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"error\":\"El nombre del proveedor es requerido\"}");
                out.flush();
                return;
            }
            
            HttpSession session = request.getSession();
            @SuppressWarnings("unchecked")
            List<Proveedor> proveedores = (List<Proveedor>) session.getAttribute("proveedores");
            if (proveedores == null) {
                proveedores = new ArrayList<>();
            }
            
            proveedores.add(proveedor);
            session.setAttribute("proveedores", proveedores);
            
            // Generar alarmas automáticamente
            GestorAlarmas.generarAlarmas(session);
            
            response.setStatus(HttpServletResponse.SC_CREATED);
            out.print(gson.toJson(proveedor));
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Error al procesar el proveedor: " + e.getMessage() + "\"}");
        }
        
        out.flush();
    }
    
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
            out.print("{\"error\":\"ID de proveedor requerido\"}");
            out.flush();
            return;
        }
        
        try {
            Long id = Long.parseLong(pathInfo.substring(1));
            
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                sb.append(line);
            }
            
            Proveedor proveedorActualizado = gson.fromJson(sb.toString(), Proveedor.class);
            
            HttpSession session = request.getSession();
            @SuppressWarnings("unchecked")
            List<Proveedor> proveedores = (List<Proveedor>) session.getAttribute("proveedores");
            
            if (proveedores == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"No hay proveedores registrados\"}");
                out.flush();
                return;
            }
            
            boolean encontrado = false;
            for (Proveedor p : proveedores) {
                if (p.getId().equals(id)) {
                    p.setNombreProveedor(proveedorActualizado.getNombreProveedor());
                    p.setNit(proveedorActualizado.getNit());
                    p.setCiudad(proveedorActualizado.getCiudad());
                    p.setPais(proveedorActualizado.getPais());
                    p.setDireccion(proveedorActualizado.getDireccion());
                    p.setFechaFinContrato(proveedorActualizado.getFechaFinContrato());
                    p.setEstadoProveedor(proveedorActualizado.getEstadoProveedor());
                    p.setNombreContacto(proveedorActualizado.getNombreContacto());
                    p.setTipoDocumento(proveedorActualizado.getTipoDocumento());
                    p.setNumeroIdentificacion(proveedorActualizado.getNumeroIdentificacion());
                    p.setTelefono(proveedorActualizado.getTelefono());
                    p.setCorreo(proveedorActualizado.getCorreo());
                    p.setNotas(proveedorActualizado.getNotas());
                    
                    encontrado = true;
                    session.setAttribute("proveedores", proveedores);
                    
                    // Generar alarmas automáticamente
                    GestorAlarmas.generarAlarmas(session);
                    
                    response.setStatus(HttpServletResponse.SC_OK);
                    out.print(gson.toJson(p));
                    break;
                }
            }
            
            if (!encontrado) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"Proveedor no encontrado\"}");
            }
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Error al actualizar: " + e.getMessage() + "\"}");
        }
        
        out.flush();
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"ID de proveedor requerido\"}");
            out.flush();
            return;
        }
        
        try {
            Long id = Long.parseLong(pathInfo.substring(1));
            
            HttpSession session = request.getSession();
            @SuppressWarnings("unchecked")
            List<Proveedor> proveedores = (List<Proveedor>) session.getAttribute("proveedores");
            
            if (proveedores == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"No hay proveedores registrados\"}");
                out.flush();
                return;
            }
            
            boolean eliminado = proveedores.removeIf(p -> p.getId().equals(id));
            
            if (eliminado) {
                session.setAttribute("proveedores", proveedores);
                response.setStatus(HttpServletResponse.SC_OK);
                out.print("{\"message\":\"Proveedor eliminado exitosamente\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"Proveedor no encontrado\"}");
            }
            
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"ID inválido\"}");
        }
        
        out.flush();
    }
}