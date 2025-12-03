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
import com.pharmaplus.modelo.Alarma;

/**
 * API REST para gestionar alarmas
 */
@WebServlet("/api/alarmas/*")
public class AlarmaRestServlet extends HttpServlet {
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
        List<Alarma> alarmas = (List<Alarma>) session.getAttribute("alarmas");
        if (alarmas == null) {
            alarmas = new ArrayList<>();
        }
        
        // Filtrar alarmas no completadas
        List<Alarma> alarmasActivas = new ArrayList<>();
        for (Alarma a : alarmas) {
            if (!a.isCompletada()) {
                alarmasActivas.add(a);
            }
        }
        
        out.print(gson.toJson(alarmasActivas));
        response.setStatus(HttpServletResponse.SC_OK);
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
            
            Alarma alarma = gson.fromJson(sb.toString(), Alarma.class);
            
            HttpSession session = request.getSession();
            @SuppressWarnings("unchecked")
            List<Alarma> alarmas = (List<Alarma>) session.getAttribute("alarmas");
            if (alarmas == null) {
                alarmas = new ArrayList<>();
            }
            
            alarmas.add(alarma);
            session.setAttribute("alarmas", alarmas);
            
            response.setStatus(HttpServletResponse.SC_CREATED);
            out.print(gson.toJson(alarma));
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Error al procesar la alarma: " + e.getMessage() + "\"}");
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
            out.print("{\"error\":\"ID de alarma requerido\"}");
            out.flush();
            return;
        }
        
        try {
            String[] parts = pathInfo.substring(1).split("/");
            Long id = Long.parseLong(parts[0]);
            String accion = parts.length > 1 ? parts[1] : null;
            
            HttpSession session = request.getSession();
            @SuppressWarnings("unchecked")
            List<Alarma> alarmas = (List<Alarma>) session.getAttribute("alarmas");
            
            if (alarmas == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"No hay alarmas registradas\"}");
                out.flush();
                return;
            }
            
            boolean encontrado = false;
            for (Alarma a : alarmas) {
                if (a.getId().equals(id)) {
                    if ("completar".equals(accion)) {
                        a.setCompletada(true);
                    } else if ("leer".equals(accion)) {
                        a.setLeida(!a.isLeida());
                    }
                    
                    encontrado = true;
                    session.setAttribute("alarmas", alarmas);
                    response.setStatus(HttpServletResponse.SC_OK);
                    out.print(gson.toJson(a));
                    break;
                }
            }
            
            if (!encontrado) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"Alarma no encontrada\"}");
            }
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Error al actualizar: " + e.getMessage() + "\"}");
        }
        
        out.flush();
    }
}