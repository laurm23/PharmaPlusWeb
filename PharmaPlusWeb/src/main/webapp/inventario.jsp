<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.List, java.util.ArrayList" %>
<%@ page import="com.pharmaplus.modelo.Producto" %>

<%
    // Verificar sesión
    if (session.getAttribute("usuarioEmail") == null) {
        response.sendRedirect(request.getContextPath() + "/login.jsp");
        return;
    }

    // Obtener lista de productos
    @SuppressWarnings("unchecked")
    List<Producto> productos = (List<Producto>) session.getAttribute("productos");
    if (productos == null) {
        productos = new ArrayList<>();
    }
%>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Inventario</title>
  <link rel="shortcut icon" href="${pageContext.request.contextPath}/images/logo2.png" type="image/x-icon">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;500" rel="stylesheet" />
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/inventario.css" />
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
        <a class="sidebar-link active" href="${pageContext.request.contextPath}/inventario.jsp">
          <span class="material-symbols-outlined">inventory_2</span>
          Inventario
          <span class="linea-active" aria-hidden="true"></span>
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
        <div class="topbar">
          <div class="envoltorio-titulo">
            <h1 class="titulo">Inventario</h1>
          </div>

          <div class="acciones">
            <button class="btn-icono" id="btnNotificacion" aria-label="Notifications">
              <span class="material-symbols-outlined">notifications</span>
              <span class="punto-insignia"></span>

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

        <div class="barra-filtros">
          <div class="envoltorio-busqueda">
            <select id="filtroBusqueda" class="filtro-busqueda">
              <option value="todos" selected>Todos</option>
              <option value="medicamento">Medicamento</option>
              <option value="categoria">Categoría</option>
              <option value="proveedor">Proveedor</option>
              <option value="lote">Lote</option>
            </select>
            <input type="search" id="buscador" class="entrada-busqueda" placeholder="Buscar..." />
          </div>

          <div class="btn">
            <button class="btn-agregar" id="btnAbrirModal">
              <span class="material-symbols-outlined">add</span>
              Añadir producto
            </button>
          </div>
        </div>

        <div class="contenedor-tabla" id="contenido">
          <table>
            <thead>
              <tr>
                <th><span class="material-symbols-outlined"></span></th>
                <th><input type="checkbox" /></th>
                <th><div class="titulo">Nombre de producto</div></th>
                <th><div class="titulo">Categoría</div></th>
                <th><div class="titulo">Lote</div></th>
                <th><div class="titulo">Proveedor</div></th>
                <th><div class="titulo">Laboratorio</div></th>
                <th><div class="titulo">Stock</div></th>
                <th><div class="titulo">Ubicación</div></th>
                <th><div class="titulo">Precio</div></th>
                <th><div class="titulo">Estado</div></th>
                <th></th>
              </tr>
            </thead>
            <tbody id="tablaProductos">
              <%
                if (productos != null && !productos.isEmpty()) {
                  for (Producto p : productos) {
                    String estadoClase = "alto";
                    if (p.getStock() == 0) {
                      estadoClase = "bajo";
                    } else if (p.getStockInicial() > 0) {
                      double porcentaje = (double) p.getStock() / p.getStockInicial();
                      if (porcentaje <= 0.33) {
                        estadoClase = "bajo";
                      } else if (porcentaje <= 0.66) {
                        estadoClase = "medio";
                      }
                    }
              %>
              <tr data-id="<%= p.getId() %>">
                <td><span class="material-symbols-outlined flecha-expandir">chevron_right</span></td>
                <td><input type="checkbox" /></td>
                <td><%= p.getNombreProducto() %> <%= p.getConcentracionCantidad() %><%= p.getConcentracionUnidad() %></td>
                <td><%= p.getCategoria() %></td>
                <td><%= p.getNumeroLote() %></td>
                <td><%= p.getProveedor() %></td>
                <td><%= p.getLaboratorio() != null ? p.getLaboratorio() : "-" %></td>
                <td><%= p.getStock() %></td>
                <td><%= p.getUbicacion() != null ? p.getUbicacion() : "-" %></td>
                <td>$<%= String.format("%.2f", p.getPrecio()) %></td>
                <td><span class="circulo-estado <%= estadoClase %>"></span></td>
                <td class="celda-mas">
                  <div class="envoltorio-mas">
                    <span class="material-symbols-outlined">more_vert</span>
                  </div>
                  <div class="envoltorio-acciones">
                    <span class="material-symbols-outlined accion accion-ver" title="Ver" data-id="<%= p.getId() %>">visibility</span>
                    <span class="material-symbols-outlined accion accion-editar" title="Editar" data-id="<%= p.getId() %>">edit</span>
                    <span class="material-symbols-outlined accion accion-eliminar" title="Eliminar" data-id="<%= p.getId() %>">delete</span>
                  </div>
                </td>
              </tr>
              <tr class="subfila">
                <td colspan="12" style="padding: 15px 20px; background: #f9fafb;">
                  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; font-size: 11px;">
                    <div><strong>Código:</strong> <%= p.getCodigo() %></div>
                    <div><strong>Fecha Registro:</strong> <%= p.getFechaRegistro() %></div>
                    <div><strong>Fecha Vencimiento:</strong> <%= p.getFechaVencimiento() %></div>
                    <div><strong>Stock Inicial:</strong> <%= p.getStockInicial() %></div>
                  </div>
                </td>
              </tr>
              <%
                  }
                } else {
              %>
              <tr>
                <td colspan="12" style="text-align:center; padding:40px; color:#999;">
                  <div class="estado-vacio">
                    <div class="icono-vacio">
                      <span class="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div class="texto-vacio">No hay productos registrados</div>
                  </div>
                </td>
              </tr>
              <%
                }
              %>
            </tbody>
          </table>
        </div>

        <div class="scrollbar-externo" id="scrollbar">
          <div class="pulgar" id="pulgar"></div>
        </div>

        <div class="paginacion">
          <button class="btn-pagina" aria-label="Anterior">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button class="btn-pagina active">1</button>
          <button class="btn-pagina" aria-label="Siguiente">
            <span class="material-symbols-outlined flecha-expandir">chevron_right</span>
          </button>
        </div>

        <!-- Modal formulario producto -->
        <div id="modalAgregarProducto" class="superposicion-modal" style="display: none;">
          <div class="contenido-modal">
            <div class="modal-header">
              <span class="modal-titulo" id="modalTitulo">Añadir producto</span>
              <span class="modal-cerrar" id="btnCerrarModal">&times;</span>
            </div>
            <hr class="divisor-modal">
            <form id="formularioAgregarProducto" method="POST" action="<%= request.getContextPath() %>/productos">
              <input type="hidden" id="productoId" name="id">
              <input type="hidden" id="modoFormulario" name="modo" value="crear">
              
              <div class="ancho-completo">
                <label for="nombreProducto" data-required="*">Nombre del producto</label>
                <input type="text" id="nombreProducto" name="nombreProducto" class="entrada-ancha" required>
              </div>
              <div>
                <label for="concentracionCantidad" data-required="*">Concentración</label>
                <div class="envoltorio-concentracion">
                  <input type="text" id="concentracionCantidad" name="concentracionCantidad" placeholder="Cantidad" required>
                  <select id="concentracionUnidad" name="concentracionUnidad" required>
                    <option value="">Unidad</option>
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="g">g</option>
                  </select>
                </div>
              </div>
              <div>
                <label for="categoria" data-required="*">Categoría</label>
                <input type="text" id="categoria" name="categoria" required>
              </div>
              <div>
                <label for="codigo" data-required="*">Código</label>
                <input type="text" id="codigo" name="codigo" required>
              </div>
              <div>
                <label for="numeroLote" data-required="*">Número de lote</label>
                <input type="text" id="numeroLote" name="numeroLote" required>
              </div>
              <div>
                <label for="proveedor" data-required="*">Proveedor</label>
                <input type="text" id="proveedor" name="proveedor" required>
              </div>
              <div>
                <label for="laboratorio" data-required="*">Laboratorio</label>
                <input type="text" id="laboratorio" name="laboratorio" required>
              </div>
              <div>
                <label for="stock" data-required="*">Stock</label>
                <input type="number" id="stock" name="stock" min="0" required>
              </div>
              <div>
                <label for="ubicacion" data-required="*">Ubicación</label>
                <input type="text" id="ubicacion" name="ubicacion" required>
              </div>
              <div>
                <label for="precio" data-required="*">Precio</label>
                <input type="number" id="precio" name="precio" min="0" step="0.01" required>
              </div>
              <div>
                <label for="fechaRegistro" data-required="*">Fecha de registro</label>
                <input type="date" id="fechaRegistro" name="fechaRegistro" required>
              </div>
              <div>
                <label for="fechaVencimiento" data-required="*">Fecha de vencimiento</label>
                <input type="date" id="fechaVencimiento" name="fechaVencimiento" required>
              </div>
              <div class="acciones-formulario">
                <button type="button" id="btnCancelarAgregar">Cancelar</button>
                <button type="submit" id="btnGuardar">Guardar</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal confirmación -->
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

        <!-- AGREGAR ESTE MODAL DE PROVEEDOR -->
        <div id="modalAgregarProveedor" class="superposicion-modal" style="display: none;">
          <div class="contenido-modal">
            <div class="modal-header">
              <span class="modal-titulo">Registrar Proveedor</span>
              <span class="modal-cerrar" id="btnCerrarProveedor">&times;</span>
            </div>
            <hr class="divisor-modal">
            <form id="formularioAgregarProveedor">
              
              <div class="ancho-completo">
                <label for="nombreProveedor" data-required="*">Nombre del proveedor</label>
                <input type="text" id="nombreProveedor" name="nombreProveedor" class="entrada-ancha" required>
              </div>

              <div>
                <label for="nit" data-required="*">NIT</label>
                <input type="text" id="nit" name="nit" required>
              </div>
              <div>
                <label for="ciudad" data-required="*">Ciudad</label>
                <input type="text" id="ciudad" name="ciudad" required>
              </div>

              <div>
                <label for="pais">País</label>
                <input type="text" id="pais" name="pais" value="Colombia">
              </div>
              <div>
                <label for="direccion" data-required="*">Dirección</label>
                <input type="text" id="direccion" name="direccion" required>
              </div>

              <div>
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

              <hr class="divisor-modal">

              <div class="nombreContacto_">
                <label for="nombreContacto" data-required="*">Nombre de contacto</label>
                <input type="text" id="nombreContacto" name="nombreContacto" class="entrada-ancha" required>
              </div>

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

              <div>
                <label for="telefono" data-required="*">Teléfono</label>
                <input type="tel" id="telefono" name="telefono" required>
              </div>
              <div>
                <label for="correo" data-required="*">Correo electrónico</label>
                <input type="email" id="correo" name="correo" required>
              </div>

              <hr class="divisor-modal">

              <div class="adicional">
                <label for="notas">Notas / Observaciones</label>
                <textarea id="notas" name="notas" rows="3" placeholder="Detalles adicionales sobre el proveedor..."></textarea>
              </div>

              <div class="acciones-formulario">
                <button type="button" id="btnCancelarProveedor">Cancelar</button>
                <button type="submit">Guardar</button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </main>
  </div>

  <!-- DATOS DEL SERVIDOR (SIN GSON - MANUAL) -->
  <script>
    var productosData = [
      <%
      if (productos != null && !productos.isEmpty()) {
        for (int i = 0; i < productos.size(); i++) {
          Producto p = productos.get(i);
      %>
      {
        id: <%= p.getId() %>,
        nombreProducto: "<%= p.getNombreProducto() %>",
        concentracionCantidad: "<%= p.getConcentracionCantidad() %>",
        concentracionUnidad: "<%= p.getConcentracionUnidad() %>",
        categoria: "<%= p.getCategoria() %>",
        codigo: "<%= p.getCodigo() %>",
        numeroLote: "<%= p.getNumeroLote() %>",
        proveedor: "<%= p.getProveedor() %>",
        laboratorio: "<%= p.getLaboratorio() %>",
        stock: <%= p.getStock() %>,
        stockInicial: <%= p.getStockInicial() %>,
        ubicacion: "<%= p.getUbicacion() %>",
        precio: <%= p.getPrecio() %>,
        fechaRegistro: "<%= p.getFechaRegistro() %>",
        fechaVencimiento: "<%= p.getFechaVencimiento() %>"
      }<%= i < productos.size() - 1 ? "," : "" %>
      <%
        }
      }
      %>
    ];
    var contextPath = '<%= request.getContextPath() %>';
  </script>

  <!-- SCRIPTS EXTERNOS -->
  <script src="${pageContext.request.contextPath}/js/clases_comun.js"></script>
  <script src="${pageContext.request.contextPath}/js/helpers_utils.js"></script>
  <script src="${pageContext.request.contextPath}/js/cierre_sesion.js"></script>
  <script src="${pageContext.request.contextPath}/js/notificaciones_global.js"></script>
  <script src="${pageContext.request.contextPath}/js/inventario_script.js"></script>
</body>
</html>