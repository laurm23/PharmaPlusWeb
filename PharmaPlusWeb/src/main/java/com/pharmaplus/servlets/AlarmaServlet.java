package com.pharmaplus.servlets;

import java.io.IOException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.pharmaplus.modelo.Alarma;
import com.pharmaplus.util.GestorAlarmas;

/**
 * Servlet para gestionar alarmas (mostrar, completar, marcar como leída)
 */
public class AlarmaServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    /**
     * GET → Mostrar página de alarmas
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession();

        // Generar alarmas automáticamente antes de mostrar
        GestorAlarmas.generarAlarmas(session);

        // Redirigir al JSP de alarmas
        request.getRequestDispatcher("/alarmas.jsp").forward(request, response);
    }

    /**
     * POST → Completar o marcar alarmas como leídas
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String accion = request.getParameter("accion");
        String alarmaIdTexto = request.getParameter("alarmaId");

        if (accion == null || alarmaIdTexto == null) {
            response.sendRedirect(request.getContextPath() + "/alarmas.jsp");
            return;
        }

        Long alarmaId;
        try {
            alarmaId = Long.parseLong(alarmaIdTexto);
        } catch (NumberFormatException e) {
            response.sendRedirect(request.getContextPath() + "/alarmas.jsp");
            return;
        }

        HttpSession session = request.getSession();

        @SuppressWarnings("unchecked")
        List<Alarma> alarmas = (List<Alarma>) session.getAttribute("alarmas");

        if (alarmas != null) {
            for (Alarma alarma : alarmas) {
                if (alarma != null && alarma.getId().equals(alarmaId)) {

                    if ("completar".equals(accion)) {
                        alarma.setCompletada(true);

                    } else if ("marcar-leida".equals(accion)) {
                        alarma.setLeida(!alarma.isLeida());
                    }

                    break;
                }
            }

            // Guardar cambios en sesión
            session.setAttribute("alarmas", alarmas);
        }

        // Redirigir nuevamente a la página de alarmas
        response.sendRedirect(request.getContextPath() + "/alarmas.jsp");
    }
}
