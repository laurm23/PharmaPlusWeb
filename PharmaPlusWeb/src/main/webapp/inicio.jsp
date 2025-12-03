<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Inicio - Dashboard</title>
  <link rel="shortcut icon" href="${pageContext.request.contextPath}/images/logo2.png" type="image/x-icon">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;500" rel="stylesheet" />
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/inicio.css" />
</head>

<body>
  <div class="app">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <img src="${pageContext.request.contextPath}/images/logo.png" alt="Logo" class="logo" />

      <div class="sidebar-seccion">MENU</div>
      <nav class="sidebar-nav">
        <a class="sidebar-link active" href="${pageContext.request.contextPath}/inicio.jsp">
          <span class="material-symbols-outlined">grid_view</span>
          Inicio
          <span class="linea-active" aria-hidden="true"></span>
        </a>
      </nav>

      <div class="sidebar-seccion">GESTIÓN</div>
      <nav class="sidebar-nav">
        <a class="sidebar-link" href="${pageContext.request.contextPath}/inventario.jsp">
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
            <h1 class="titulo">Inicio</h1>
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
                <!-- Obtenemos el nombre del usuario desde la sesión -->
                <div class="nombre-usuario">
                  <% 
                    String nombreUsuario = (String) session.getAttribute("usuario");
                    out.print(nombreUsuario != null ? nombreUsuario : "Usuario");
                  %>
                </div>
                <div class="rol-usuario">
                  <% 
                    String rolUsuario = (String) session.getAttribute("rol");
                    out.print(rolUsuario != null ? rolUsuario : "Usuario");
                  %>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MÉTRICAS PRINCIPALES -->
        <div class="cuadricula-metricas">
          <div class="tarjeta-metrica agotado">
            <div class="icono-metrica">
              <span class="material-symbols-outlined">error</span>
            </div>
            <div class="contenido-metrica">
              <div class="valor-metrica" id="metricaAgotado">0</div>
              <div class="etiqueta-metrica">Agotados</div>
            </div>
          </div>

          <div class="tarjeta-metrica stock-bajo">
            <div class="icono-metrica">
              <span class="material-symbols-outlined">warning</span>
            </div>
            <div class="contenido-metrica">
              <div class="valor-metrica" id="metricaBajo">0</div>
              <div class="etiqueta-metrica">Stock Bajo</div>
            </div>
          </div>

          <div class="tarjeta-metrica vencido">
            <div class="icono-metrica">
              <span class="material-symbols-outlined">schedule</span>
            </div>
            <div class="contenido-metrica">
              <div class="valor-metrica" id="metricaVencer">0</div>
              <div class="etiqueta-metrica">Por Vencer</div>
            </div>
          </div>

          <div class="tarjeta-metrica total-productos">
            <div class="icono-metrica">
              <span class="material-symbols-outlined">inventory_2</span>
            </div>
            <div class="contenido-metrica">
              <div class="valor-metrica" id="metricaTotal">0</div>
              <div class="etiqueta-metrica">Total Productos</div>
            </div>
          </div>
        </div>

        <!-- GRID PRINCIPAL -->
        <div class="cuadricula-tablero">

          <!-- TAREAS PENDIENTES -->
          <div class="tarjeta-tablero tarjeta-tareas">
            <div class="tarjeta-header">
              <h3 class="tarjeta-titulo">
                <span class="material-symbols-outlined">notifications_active</span>
                Tareas Pendientes
              </h3>
              <span class="contador-tareas" id="contadorTareas">0</span>
            </div>
            <div class="tarjeta-contenido" id="listaTareas">
              <!-- Se llena con JS -->
            </div>
          </div>

          <!-- ESTADO DE INVENTARIO -->
          <div class="tarjeta-tablero tarjeta-inventario">
            <div class="tarjeta-header">
              <h3 class="tarjeta-titulo">
                <span class="material-symbols-outlined">inventory</span>
                Estado de Inventario
              </h3>
              <div class="fichas-filtro" id="filtrosStock">
                <button class="ficha active" data-filter="bajo">
                  <span class="punto-ficha bajo"></span>
                  Bajo
                </button>
                <button class="ficha" data-filter="medio">
                  <span class="punto-ficha medio"></span>
                  Medio
                </button>
                <button class="ficha" data-filter="alto">
                  <span class="punto-ficha alto"></span>
                  Alto
                </button>
              </div>
            </div>
            <div class="tarjeta-contenido" id="listaInventario">
              <!-- Se llena con JS -->
            </div>
          </div>

          <!-- PRÓXIMOS A VENCER -->
          <div class="tarjeta-tablero tarjeta-vencimiento">
            <div class="tarjeta-header">
              <h3 class="tarjeta-titulo">
                <span class="material-symbols-outlined">event_busy</span>
                Próximos a Vencer
              </h3>
            </div>
            <div class="tarjeta-contenido" id="listaVencimientos">
              <!-- Se llena con JS -->
            </div>
          </div>

          <!-- CONTRATOS PROVEEDORES -->
          <div class="tarjeta-tablero tarjeta-contratos">
            <div class="tarjeta-header">
              <h3 class="tarjeta-titulo">
                <span class="material-symbols-outlined">description</span>
                Contratos por Vencer
              </h3>
            </div>
            <div class="tarjeta-contenido" id="listaContratos">
              <!-- Se llena con JS -->
            </div>
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
  
  <script>
    var contextPath = '<%= request.getContextPath() %>';
  </script>
  <!-- SCRIPTS -->
  <script src="${pageContext.request.contextPath}/js/clases_comun.js"></script>
  <script src="${pageContext.request.contextPath}/js/helpers_utils.js"></script>
  <script src="${pageContext.request.contextPath}/js/cierre_sesion.js"></script>
  <script src="${pageContext.request.contextPath}/js/notificaciones_global.js"></script>
  <script src="${pageContext.request.contextPath}/js/inicio_script.js"></script>
</body>

</html>