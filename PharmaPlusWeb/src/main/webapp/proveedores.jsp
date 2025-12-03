<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.List, java.util.ArrayList" %>
<%@ page import="com.pharmaplus.modelo.Proveedor" %>

<%
    // Verificar sesión
    if (session.getAttribute("usuarioEmail") == null) {
        response.sendRedirect(request.getContextPath() + "/login.jsp");
        return;
    }

    // Obtener lista de proveedores
    @SuppressWarnings("unchecked")
    List<Proveedor> proveedores = (List<Proveedor>) session.getAttribute("proveedores");
    if (proveedores == null) {
        proveedores = new ArrayList<>();
    }
%>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Proveedores</title>
  <link rel="shortcut icon" href="${pageContext.request.contextPath}/images/logo2.png" type="image/x-icon">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;500" rel="stylesheet" />
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/proveedores.css" />
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
        <a class="sidebar-link" href="${pageContext.request.contextPath}/inventario.jsp">
          <span class="material-symbols-outlined">inventory_2</span>
          Inventario
        </a>
        <a class="sidebar-link active" href="${pageContext.request.contextPath}/proveedores.jsp">
          <span class="material-symbols-outlined">groups</span>
          Proveedores
          <span class="linea-active" aria-hidden="true"></span>
        </a>
      </nav>

      <button class="cerrar-sesion">
        <span class="material-symbols-outlined">logout</span>
        Cerrar Sesión
      </button>
    </aside>

    <!-- MAIN -->
    <main class="main">
      <!-- CONTENEDOR (sin tarjeta blanca) -->
      <div class="contenido">
        <!-- TOP: TÍTULO Y ACCIONES -->
        <div class="topbar">
          <div class="envoltorio-titulo">
            <h1 class="titulo">Proveedores</h1>
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
                <div class="panel-lista" id="listaPanel">
                  <!-- Se llenarán con JS -->
                </div>
                <div class="panel-footer" style="cursor: pointer;">
  					<a href="${pageContext.request.contextPath}/alarmas.jsp" class="panel-enlace" id="btnVerTodos" style="pointer-events: none;">Ver más</a>
				</div>
              </div>
            </button>

            <span class="divisor"></span>

            <div class="bloque-usuario">
              <img class="avatar" src="https://shorturl.at/iBeGE" alt="Usuario" />
              <div class="meta-usuario">
                <div class="nombre-usuario">Oliver Hernandez</div>
                <div class="rol-usuario">Administrador</div>
              </div>
            </div>
          </div>
        </div>

        <!-- BARRA: SEARCH + TABS EN LA MISMA FILA -->
        <div class="barra-filtros">
          <div class="envoltorio-busqueda">
            <!-- Nuevo filtro de búsqueda -->
            <select id="filtroBusqueda" class="filtro-busqueda">
              <option value="todos" selected>Todos</option>
              <option value="proveedor">Proveedor</option>
              <option value="contacto">Contacto</option>
              <option value="producto">Producto</option>
            </select>
            <input type="search" id="buscador" class="entrada-busqueda" placeholder="Buscar..." />
          </div>

          <!-- Botón añadir producto -->
          <div class="btn" style="display:none;">
            <button class="btn-agregar">
              <span class="material-symbols-outlined">add</span>
              Registrar Proveedor
            </button>
          </div>
        </div>

        <!-- TABLA -->
        <div class="contenedor-tabla" id="contenido">
          <table>
            <thead>
              <tr>
                <th><span class="material-symbols-outlined"></span></th>
                <th><input type="checkbox" /></th>
                <th>
                  <div class="titulo">
                    Nombre de Proveedor
                  </div>
                </th>
                <th>
                  <div class="titulo">
                    Nombre de Contacto
                  </div>
                </th>
                <th>
                  <div class="titulo">
                    Email
                  </div>
                </th>
                <th>
                  <div class="titulo">
                    País
                  </div>
                </th>
                <th>
                  <div class="titulo">
                    Productos Suministrados
                  </div>
                </th>
                <th>
                  <div class="titulo">
                    Fin de Contrato
                  </div>
                </th>
                <th>
                  <div class="titulo">
                    Estado
                  </div>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody id="tablaProductos">
            </tbody>
          </table>
        </div>

        <!-- Scroll externo -->
        <div class="scrollbar-externo" id="scrollbar">
          <div class="pulgar" id="pulgar"></div>
        </div>

        <!-- PAGINACIÓN -->
        <div class="paginacion">
          <button class="btn-pagina" id="btnPaginaAnterior" aria-label="Anterior">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>

          <div id="numerosPagina" style="display:inline-block;"></div>
          <!-- Aquí­ se generan los números de página -->

          <button class="btn-pagina" id="btnPaginaSiguiente" aria-label="Siguiente">
            <span class="material-symbols-outlined flecha-expandir">chevron_right</span>
          </button>
        </div>

        <!-- Modal formulario añadir producto -->
        <div id="modalAgregarProveedor" class="superposicion-modal" style="display: none;">
          <div class="contenido-modal">

            <!-- Mini header -->
            <div class="modal-header">
              <span class="modal-titulo">Registrar Proveedor</span>
              <span class="modal-cerrar" id="btnCerrarModal">&times;</span>

            </div>
            <hr class="divisor-modal">

            <form id="formularioAgregarProveedor">

              <!-- INFORMACIÓN GENERAL -->

              <!-- Fila 1 -->
              <div class="ancho-completo">
                <label for="nombreProveedor" data-required="*">Nombre del proveedor</label>
                <input type="text" id="nombreProveedor" name="nombreProveedor" class="entrada-ancha" required>
              </div>

              <!-- Fila 2 -->
              <div>
                <label for="nit" data-required="*">NIT</label>
                <input type="text" id="nit" name="nit" required>
              </div>
              <div>
                <label for="ciudad" data-required="*">Ciudad</label>
                <input type="text" id="ciudad" name="ciudad" required>
              </div>

              <!-- Fila 3 -->
              <div>
                <label for="pais">País</label>
                <input type="text" id="pais" name="pais" value="Colombia">
              </div>
              <div>
                <label for="direccion" data-required="*">Dirección</label>
                <input type="text" id="direccion" name="direccion" required>
              </div>

              <!-- Fila 6 -->
              <div>
                <label for="tipoProductos">Productos suministrados</label>
                <input type="text" id="tipoProductos" name="tipoProductos" placeholder="Medicamentos, insumos, etc.">
              </div>

              <!-- Fila 4 -->

              <div id="contenedorFechaFinContrato">
                <label for="fechaFinContrato">Fecha de fin de contrato</label>
                <input type="date" id="fechaFinContrato" name="fechaFinContrato">
              </div>

              <div>
                <label for="estadoProveedor">Estado del proveedor</label>
                <select id="estadoProveedor" name="estadoProveedor">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <!-- DATOS DE CONTACTO -->
              <hr class="divisor-modal">
              <!-- Fila 7 -->
              <div class="nombreContacto_">
                <label for="nombreContacto" data-required="*">Nombre de contacto</label>
                <input type="text" id="nombreContacto" name="nombreContacto" class="entrada-ancha" required>
              </div>

              <!-- Fila 8 -->
              <div>
                <label for="tipoDocumento">Tipo de documento</label>
                <select id="tipoDocumento" name="tipoDocumento">
                  <option value="">Seleccionar</option>
                  <option value="CC">Cédula de ciudadanía</option>
                  <option value="CE">Cédula de extranjería</option>
                  <option value="NIT">NIT personal</option>
                  <option value="PAS">Pasaporte</option>
                </select>
              </div>
              <div>
                <label for="numeroIdentificacion">Número de identificación</label>
                <input type="text" id="numeroIdentificacion" name="numeroIdentificacion">
              </div>


              <!-- Fila 9 -->
              <div>
                <label for="telefono" data-required="*">Teléfono</label>
                <input type="tel" id="telefono" name="telefono" required>
              </div>
              <div>
                <label for="correo" data-required="*">Correo electrónico</label>
                <input type="email" id="correo" name="correo" required>
              </div>

              <!-- ADICIONAL -->
              <hr class="divisor-modal">

              <!-- Fila 10 -->
              <div class="adicional">
                <label for="notas">Notas / Observaciones</label>
                <textarea id="notas" name="notas" rows="3"
                  placeholder="Detalles adicionales sobre el proveedor..."></textarea>
              </div>

              <!-- Botones -->
              <div class="acciones-formulario">
                <button type="button" id="btnCancelarProveedor">Cancelar</button>
                <button type="submit">Guardar</button>
              </div>

            </form>
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

  <!-- SCRIPTS EXTERNOS -->
  <script src="${pageContext.request.contextPath}/js/clases_comun.js"></script>
  <script src="${pageContext.request.contextPath}/js/helpers_utils.js"></script>
  <script src="${pageContext.request.contextPath}/js/cierre_sesion.js"></script>
  <script src="${pageContext.request.contextPath}/js/notificaciones_global.js"></script>
  <script src="${pageContext.request.contextPath}/js/proveedores_script.js"></script>
</body>
</html>