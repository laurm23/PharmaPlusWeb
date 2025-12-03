<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.List, java.util.ArrayList" %>
<%@ page import="java.time.LocalDate, java.time.temporal.ChronoUnit" %>
<%@ page import="com.pharmaplus.modelo.Producto, com.pharmaplus.modelo.Proveedor, com.pharmaplus.modelo.Alarma" %>

<%
    // Verificar sesión
    if (session.getAttribute("usuarioEmail") == null) {
        response.sendRedirect(request.getContextPath() + "/login.jsp");
        return;
    }

    // Obtener datos de sesión
    @SuppressWarnings("unchecked")
    List<Alarma> alarmas = (List<Alarma>) session.getAttribute("alarmas");
    if (alarmas == null) alarmas = new ArrayList<>();
    
    @SuppressWarnings("unchecked")
    List<Producto> productos = (List<Producto>) session.getAttribute("productos");
    if (productos == null) productos = new ArrayList<>();
    
    @SuppressWarnings("unchecked")
    List<Proveedor> proveedores = (List<Proveedor>) session.getAttribute("proveedores");
    if (proveedores == null) proveedores = new ArrayList<>();

    // Calcular contadores
    long contadorTodas = alarmas.stream().filter(a -> !a.isCompletada()).count();
    long contadorAgotado = alarmas.stream().filter(a -> !a.isCompletada() && "stock-agotado".equals(a.getTipo())).count();
    long contadorBajo = alarmas.stream().filter(a -> !a.isCompletada() && "stock-bajo".equals(a.getTipo())).count();
    long contadorVencer = alarmas.stream().filter(a -> !a.isCompletada() && "proximo-vencer".equals(a.getTipo())).count();
    long contadorContrato = alarmas.stream().filter(a -> !a.isCompletada() && "contrato-vencer".equals(a.getTipo())).count();
%>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Alarmas - Notificaciones</title>
    <link rel="shortcut icon" href="${pageContext.request.contextPath}/images/logo2.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;500" rel="stylesheet">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/alarmas.css">
</head>

<body>
  <div class="app">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <img src="${pageContext.request.contextPath}/images/logo.png" alt="Logo" class="logo" />
    
      <div class="sidebar-seccion">MENU</div>
      <nav class="sidebar-nav">
        <a class="sidebar-link" href="${pageContext.request.contextPath}/inicio.jsp">
          <span class="material-symbols-outlined">grid_view</span>
          Inicio
        </a>
      </nav>
    
      <div class="sidebar-seccion">GESTIÓN</div>
      <nav class="sidebar-nav">
        <a class="sidebar-link" href="${pageContext.request.contextPath}/productos">
          <span class="material-symbols-outlined">inventory_2</span>
          Inventario
        </a>
        <a class="sidebar-link" href="${pageContext.request.contextPath}/proveedores.jsp">
          <span class="material-symbols-outlined">groups</span>
          Proveedores
        </a>
      </nav>
    
      <button class="cerrar-sesion">
        <span class="material-symbols-outlined">logout</span>
        Cerrar Sesión
      </button>
    </aside>

    <!-- MAIN -->
    <main class="main">
      <div class="contenido">
        <!-- TOPBAR -->
        <div class="topbar">
          <div class="envoltorio-titulo">
            <h1 class="titulo">Alarmas - Notificaciones</h1>
          </div>

          <div class="acciones">
            <button class="btn-icono" id="btnNotificacion" aria-label="Notifications">
              <span class="material-symbols-outlined">notifications</span>
              <span class="punto-insignia"></span>

              <!-- Mini Panel -->
              <div class="panel-notificaciones" id="panelNotificaciones">
                <div class="panel-header">
                  <div class="panel-titulo">
                    <span class="material-symbols-outlined">notifications</span>
                    Notificaciones (<span id="contadorPanel">0</span>)
                  </div>
                </div>
                <div class="panel-lista" id="listaPanel"></div>
                <div class="panel-footer" style="cursor: pointer;">
  					<a href="${pageContext.request.contextPath}/alarmas.jsp" class="panel-enlace" id="btnVerTodos" style="pointer-events: none;">Ver más</a>
				</div>
              </div>
            </button>

            <span class="divisor"></span>

            <div class="bloque-usuario">
              <img class="avatar" src="https://shorturl.at/iBeGE" alt="Usuario" />
              <div class="meta-usuario">
                <div class="nombre-usuario"><%= session.getAttribute("usuarioNombre") != null ? session.getAttribute("usuarioNombre") : "Usuario" %></div>
                <div class="rol-usuario"><%= session.getAttribute("usuarioRol") != null ? session.getAttribute("usuarioRol") : "Administrador" %></div>
              </div>
            </div>
          </div>
        </div>

        <!-- LAYOUT DE NOTIFICACIONES -->
        <div class="disposicion-notificaciones">
          <!-- FILTROS -->
          <div class="tarjeta-filtros">
            <div class="grupo-filtros" id="grupoFiltros">
              <div class="elemento-filtro active" data-filter="todas">
                <span class="material-symbols-outlined icono-filtro">notifications</span>
                <span class="etiqueta-filtro">Todas</span>
                <span class="contador-filtro" id="contador-todas"><%= contadorTodas %></span>
              </div>
              <div class="elemento-filtro" data-filter="stock-agotado">
                <span class="material-symbols-outlined icono-filtro">error</span>
                <span class="etiqueta-filtro">Stock Agotado</span>
                <span class="contador-filtro" id="contador-stock-agotado"><%= contadorAgotado %></span>
              </div>
              <div class="elemento-filtro" data-filter="stock-bajo">
                <span class="material-symbols-outlined icono-filtro">warning</span>
                <span class="etiqueta-filtro">Stock Bajo</span>
                <span class="contador-filtro" id="contador-stock-bajo"><%= contadorBajo %></span>
              </div>
              <div class="elemento-filtro" data-filter="proximo-vencer">
                <span class="material-symbols-outlined icono-filtro">schedule</span>
                <span class="etiqueta-filtro">Próximo a Vencer</span>
                <span class="contador-filtro" id="contador-proximo-vencer"><%= contadorVencer %></span>
              </div>
              <div class="elemento-filtro" data-filter="contrato-vencer">
                <span class="material-symbols-outlined icono-filtro">description</span>
                <span class="etiqueta-filtro">Contrato por Vencer</span>
                <span class="contador-filtro" id="contador-contrato-vencer"><%= contadorContrato %></span>
              </div>
            </div>
          </div>

          <!-- LISTA DE NOTIFICACIONES -->
          <div class="lista-notificaciones" id="listaNotificaciones">
            <%
            boolean hayAlarmas = false;
            for (Alarma alarma : alarmas) {
                if (alarma.isCompletada()) continue;
                hayAlarmas = true;

                String icono = "notifications";
                String severidad = "informacion";
                String titulo = "Alarma";
                String subtitulo = "";
                String detallesHtml = "";
                String emailProveedor = "";
                long proveedorId = 0;

                // Procesar alarmas de PRODUCTO
                if (alarma.getProductoId() != null) {
                    Producto producto = null;
                    for (Producto p : productos) {
                        if (p.getId().equals(alarma.getProductoId())) {
                            producto = p;
                            break;
                        }
                    }

                    if (producto != null) {
                        // Buscar proveedor
                        for (Proveedor prov : proveedores) {
                            if (prov.getNombreProveedor() != null && 
                                prov.getNombreProveedor().equalsIgnoreCase(producto.getProveedor())) {
                                emailProveedor = prov.getCorreo() != null ? prov.getCorreo() : "";
                                proveedorId = prov.getId();
                                break;
                            }
                        }

                        String nombreCompleto = producto.getNombreProducto() + " " + 
                                               producto.getConcentracionCantidad() + 
                                               producto.getConcentracionUnidad();

                        if ("stock-agotado".equals(alarma.getTipo())) {
                            icono = "error";
                            severidad = "critica";
                            titulo = "Stock agotado";
                            subtitulo = "El producto " + nombreCompleto + " se ha agotado completamente";
                            detallesHtml = String.format(
                                "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Producto</span><span class=\"valor-detalle\">%s</span></div>" +
                                "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Lote</span><span class=\"valor-detalle\">%s</span></div>" +
                                "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Proveedor</span><span class=\"valor-detalle\">%s</span></div>" +
                                "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Stock actual</span><span class=\"valor-detalle\">0 unidades</span></div>",
                                nombreCompleto, producto.getNumeroLote(), producto.getProveedor()
                            );
                        } 
                        else if ("stock-bajo".equals(alarma.getTipo())) {
                            int porcentaje = (int)((double)producto.getStock() / producto.getStockInicial() * 100);
                            icono = "warning";
                            severidad = "advertencia";
                            titulo = "Stock bajo";
                            subtitulo = "El producto " + nombreCompleto + " tiene menos del 33% de stock";
                            detallesHtml = String.format(
                                "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Producto</span><span class=\"valor-detalle\">%s</span></div>" +
                                "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Lote</span><span class=\"valor-detalle\">%s</span></div>" +
                                "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Proveedor</span><span class=\"valor-detalle\">%s</span></div>" +
                                "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Stock actual</span><span class=\"valor-detalle\">%d unidades (%d%%)</span></div>",
                                nombreCompleto, producto.getNumeroLote(), producto.getProveedor(), producto.getStock(), porcentaje
                            );
                        }
                        else if ("proximo-vencer".equals(alarma.getTipo())) {
                            long diasRestantes = 0;
                            try {
                                LocalDate fechaVenc = LocalDate.parse(producto.getFechaVencimiento());
                                diasRestantes = ChronoUnit.DAYS.between(LocalDate.now(), fechaVenc);
                            } catch (Exception e) {}
                            
                            icono = "schedule";
                            severidad = "informacion";
                            titulo = "Próximo a vencer";
                            subtitulo = "El producto " + nombreCompleto + " vence en " + diasRestantes + " días";
                            detallesHtml = String.format(
                                "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Producto</span><span class=\"valor-detalle\">%s</span></div>" +
                                "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Lote</span><span class=\"valor-detalle\">%s</span></div>" +
                                "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Proveedor</span><span class=\"valor-detalle\">%s</span></div>" +
                                "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Fecha vencimiento</span><span class=\"valor-detalle\">%s</span></div>",
                                nombreCompleto, producto.getNumeroLote(), producto.getProveedor(), producto.getFechaVencimiento()
                            );
                        }
                    }
                }
                
                // Procesar alarmas de PROVEEDOR
                else if (alarma.getProveedorId() != null && "contrato-vencer".equals(alarma.getTipo())) {
                    Proveedor proveedor = null;
                    for (Proveedor p : proveedores) {
                        if (p.getId().equals(alarma.getProveedorId())) {
                            proveedor = p;
                            break;
                        }
                    }

                    if (proveedor != null) {
                        emailProveedor = proveedor.getCorreo() != null ? proveedor.getCorreo() : "";
                        proveedorId = proveedor.getId();
                        
                        long diasRestantes = 0;
                        try {
                            LocalDate fechaFin = LocalDate.parse(proveedor.getFechaFinContrato());
                            diasRestantes = ChronoUnit.DAYS.between(LocalDate.now(), fechaFin);
                        } catch (Exception e) {}
                        
                        icono = "description";
                        severidad = "informacion";
                        titulo = "Contrato por vencer";
                        subtitulo = "El contrato con " + proveedor.getNombreProveedor() + " vence en " + diasRestantes + " días";
                        detallesHtml = String.format(
                            "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Proveedor</span><span class=\"valor-detalle\">%s</span></div>" +
                            "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Contacto</span><span class=\"valor-detalle\">%s</span></div>" +
                            "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Email</span><span class=\"valor-detalle\">%s</span></div>" +
                            "<div class=\"elemento-detalle\"><span class=\"etiqueta-detalle\">Fin contrato</span><span class=\"valor-detalle\">%s</span></div>",
                            proveedor.getNombreProveedor(), proveedor.getNombreContacto(), proveedor.getCorreo(), proveedor.getFechaFinContrato()
                        );
                    }
                }

                // Calcular tiempo transcurrido
                long diferencia = System.currentTimeMillis() - alarma.getFechaCreacion();
                long minutos = diferencia / 60000;
                long horas = diferencia / 3600000;
                long dias = diferencia / 86400000;
                String tiempoTranscurrido;
                if (minutos < 60) {
                    tiempoTranscurrido = minutos <= 1 ? "Hace 1 min" : "Hace " + minutos + " min";
                } else if (horas < 24) {
                    tiempoTranscurrido = horas == 1 ? "Hace 1 hora" : "Hace " + horas + " h";
                } else {
                    tiempoTranscurrido = dias == 1 ? "Hace 1 día" : "Hace " + dias + " d";
                }
            %>

            <!-- Tarjeta de Alarma -->
            <div class="tarjeta-notificacion <%= alarma.isLeida() ? "" : "no-leida" %>" data-tipo="<%= alarma.getTipo() %>">
              <form action="<%= request.getContextPath() %>/alarmas" method="post" style="display:inline;">
                <input type="hidden" name="alarmaId" value="<%= alarma.getId() %>">
                <button type="submit" name="accion" value="completar" class="btn-completar" title="Completar">
                  <span class="material-symbols-outlined">check_circle</span>
                </button>
              </form>

              <div class="encabezado-notificacion">
                <div class="icono-notificacion <%= severidad %>">
                  <span class="material-symbols-outlined"><%= icono %></span>
                </div>
                <div class="principal-notificacion">
                  <div class="titulo-notificacion"><%= titulo %></div>
                  <div class="subtitulo-notificacion"><%= subtitulo %></div>
                  <div class="tiempo-notificacion">
                    <span class="material-symbols-outlined">schedule</span>
                    <%= tiempoTranscurrido %>
                  </div>
                </div>
              </div>

              <div class="detalles-notificacion">
                <div class="cuadricula-detalles">
                  <%= detallesHtml %>
                </div>
              </div>

              <div class="acciones-notificacion">
                <form action="<%= request.getContextPath() %>/alarmas" method="post" style="display:inline;">
                  <input type="hidden" name="alarmaId" value="<%= alarma.getId() %>">
                  <button type="submit" name="accion" value="marcar-leida" class="btn-notif btn-secundario-notif">
                    <span class="material-symbols-outlined"><%= alarma.isLeida() ? "mark_email_unread" : "mark_email_read" %></span>
                    <%= alarma.isLeida() ? "Marcar como no leído" : "Marcar como leído" %>
                  </button>
                </form>

                <% if (!emailProveedor.isEmpty()) { %>
                <button class="btn-notif btn-primario-notif btn-enviar-email" 
                        data-proveedor-id="<%= proveedorId %>" 
                        data-tipo="<%= alarma.getTipo() %>"
                        data-email="<%= emailProveedor %>"
                        data-titulo="<%= titulo %>"
                        data-subtitulo="<%= subtitulo.replace("\"", "&quot;") %>">
                  <span class="material-symbols-outlined">send</span>
                  Enviar email
                </button>
                <% } %>
              </div>
            </div>

            <%
            } // fin for

            if (!hayAlarmas) {
            %>
            <div class="estado-vacio">
              <div class="icono-vacio">
                <span class="material-symbols-outlined">notifications_off</span>
              </div>
              <h3 class="titulo-vacio">No hay notificaciones</h3>
              <p class="texto-vacio">No tienes alertas pendientes en este momento.</p>
            </div>
            <%
            }
            %>
          </div>
        </div>

        <!-- Modal genérico de confirmación -->
        <div id="modalConfirmar" class="superposicion-modal" style="display:none;">
          <div class="modal-confirmar">
            <h3 id="tituloConfirmar">Confirmar acción</h3>
            <p id="mensajeConfirmar">¿Está seguro?</p>
            <div class="acciones-confirmar">
              <button id="btnConfirmarSi" class="btn-confirmar si">Sí</button>
              <button id="btnConfirmarNo" class="btn-confirmar no">No</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- MODAL DE EMAIL -->
  <div class="superposicion-modal-email" id="modalEmail">
    <div class="modal-email">
      <div class="modal-header-email">
        <h2 class="modal-titulo-email">Enviar correo a proveedor</h2>
        <button class="modal-cerrar-email" id="cerrarModal">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="modal-cuerpo-email">
        <form id="formularioEmail">
          <div class="grupo-formulario-email">
            <label class="etiqueta-formulario-email">De:</label>
            <input type="email" class="entrada-formulario-email" value="farmacia@pharmaplus.com" readonly>
          </div>
          <div class="grupo-formulario-email">
            <label class="etiqueta-formulario-email">Para:</label>
            <input type="email" class="entrada-formulario-email" id="emailPara" required>
          </div>
          <div class="grupo-formulario-email">
            <label class="etiqueta-formulario-email">Asunto:</label>
            <input type="text" class="entrada-formulario-email" id="emailAsunto" required>
          </div>
          <div class="grupo-formulario-email">
            <label class="etiqueta-formulario-email">Mensaje:</label>
            <textarea class="entrada-formulario-email textarea-formulario-email" id="emailMensaje" required></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer-email">
        <button class="btn-email btn-secundario-email" id="cancelarEmail">Cancelar</button>
        <button class="btn-email btn-primario-email" id="enviarEmail">
          <span class="material-symbols-outlined">send</span>
          Enviar Email
        </button>
      </div>
    </div>
  </div>
  
  <script>
    var contextPath = '<%= request.getContextPath() %>';
  </script>
  
  <!-- SCRIPTS EXTERNOS -->
  <script src="${pageContext.request.contextPath}/js/clases_comun.js"></script>
  <script src="${pageContext.request.contextPath}/js/helpers_utils.js"></script>
  <script src="${pageContext.request.contextPath}/js/cierre_sesion.js"></script>
  <script src="${pageContext.request.contextPath}/js/notificaciones_global.js"></script>
  <script src="${pageContext.request.contextPath}/js/alarmas_script.js"></script>
</body>
</html>