// PROVEEDORES - SCRIPT CORREGIDO

class GestorProveedores {
  constructor() {
    this.productos = [];
    this.proveedores = [];
    this.paginaActual = 1;
    this.proveedoresPorPagina = 11;
    this.filtroActual = 'todos';
    this.busquedaActual = '';
    this.modoEdicion = false;
    this.proveedorEditandoId = null;
    
    this.cargarDatos();
    this.inicializarEventos();
    this.renderizarTabla();
  }

  cargarDatos() {
    const prod = localStorage.getItem('productos');
    const prov = localStorage.getItem('proveedores');

    if (prod) {
      this.productos = JSON.parse(prod).map(p => {
        const producto = new Producto(p);
        producto.stockInicial = p.stockInicial;
        producto.fechaCreacion = p.fechaCreacion || 0;
        return producto;
      });
    }

    if (prov) {
      this.proveedores = JSON.parse(prov).map(prov => {
        const proveedor = new Proveedor(prov);
        proveedor.productosIds = prov.productosIds || [];
        return proveedor;
      });
    }
  }

  guardarEnStorage() {
    localStorage.setItem('productos', JSON.stringify(this.productos));
    localStorage.setItem('proveedores', JSON.stringify(this.proveedores));
    
    // Actualizar sistema de notificaciones
    if (window.SistemaNotificaciones) {
      window.SistemaNotificaciones.actualizar();
    }
  }

  inicializarEventos() {
    // Cerrar modales
    document.getElementById('btnCerrarModal').addEventListener('click', () => {
      this.cancelarModalProveedor();
    });

    document.getElementById('btnCancelarProveedor').addEventListener('click', () => {
      this.cancelarModalProveedor();
    });

    // Submit formulario
    const form = document.getElementById('formularioAgregarProveedor');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.procesarFormularioProveedor(e);
    });

    // Búsqueda y filtros
    document.getElementById('buscador').addEventListener('input', (e) => {
      this.busquedaActual = e.target.value;
      this.paginaActual = 1;
      this.renderizarTabla();
    });

    document.getElementById('filtroBusqueda').addEventListener('change', (e) => {
      this.filtroActual = e.target.value;
      this.paginaActual = 1;
      this.renderizarTabla();
    });

    // Capitalización automática
    configurarCapitalizacion(['nombreProveedor', 'ciudad', 'pais', 'nombreContacto']);
  }

  // MODAL PROVEEDOR
  abrirModalProveedor(proveedor) {
    const modal = document.getElementById('modalAgregarProveedor');
    const form = document.getElementById('formularioAgregarProveedor');
    
    this.restaurarFormulario();
    
    this.modoEdicion = true;
    this.proveedorEditandoId = proveedor.id;
    
    modal.querySelector('.modal-titulo').textContent = 'Editar proveedor';
    document.getElementById('fechaFinContrato').min = new Date().toISOString().split('T')[0];
    llenarFormulario(form, proveedor);
    
    // Configurar icono de productos suministrados
    this.configurarIconoProductos(proveedor);
    
    modal.style.display = 'flex';
  }

  verProveedor(proveedor) {
    const modal = document.getElementById('modalAgregarProveedor');
    const form = document.getElementById('formularioAgregarProveedor');
    
    form.reset();
    modal.querySelector('.modal-titulo').textContent = 'Ver proveedor';
    llenarFormulario(form, proveedor);
    this.configurarIconoProductos(proveedor);
    
    // Bloquear todos los campos
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.readOnly = true;
      input.disabled = true;
      input.style.cssText = 'background:#f5f5f5;cursor:not-allowed;';
    });
    
    form.querySelector('.acciones-formulario').style.display = 'none';
    modal.style.display = 'flex';
  }

  cancelarModalProveedor() {
    cerrarModal('modalAgregarProveedor');
    this.restaurarFormulario();
    this.modoEdicion = false;
    this.proveedorEditandoId = null;
  }

  restaurarFormulario() {
    const form = document.getElementById('formularioAgregarProveedor');
    const modal = document.getElementById('modalAgregarProveedor');
    
    form.reset();
    limpiarErrores(form);
    modal.querySelector('.modal-titulo').textContent = 'Registrar Proveedor';
    
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.readOnly = false;
      input.disabled = false;
      input.style.cssText = '';
    });
    
    form.querySelector('.acciones-formulario').style.display = 'flex';
  }

  configurarIconoProductos(proveedor) {
    const inputProductos = document.getElementById('tipoProductos');
    if (!inputProductos) return;
    
    const contenedor = document.createElement('div');
    contenedor.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;';
    
    const texto = document.createElement('span');
    texto.textContent = `${proveedor.productosIds.length} producto(s) suministrado(s)`;
    texto.style.cssText = 'font-size:13px;color:#6b7280;';
    
    const icono = document.createElement('span');
    icono.className = 'material-symbols-outlined';
    icono.textContent = 'open_in_new';
    icono.style.cssText = 'font-size:18px;color:#1976d2;cursor:pointer;';
    icono.title = 'Ver productos suministrados';
    icono.addEventListener('click', () => this.abrirModalProductos(proveedor));
    
    contenedor.appendChild(texto);
    contenedor.appendChild(icono);
    inputProductos.parentNode.replaceChild(contenedor, inputProductos);
  }

  procesarFormularioProveedor(e) {
    if (!validarFormulario('formularioAgregarProveedor')) {
      return;
    }

    if (this.modoEdicion) {
      this.editarProveedor(e);
    }
  }

  editarProveedor(e) {
    mostrarConfirmacion(
      'Confirmar cambios',
      '¿Está seguro de guardar los cambios realizados?',
      () => {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        const proveedor = this.proveedores.find(p => p.id === this.proveedorEditandoId);
        
        if (proveedor) {
          const nombreAnterior = proveedor.nombreProveedor;
          
          // Actualizar datos del proveedor
          proveedor.nombreProveedor = capitalizar(data.nombreProveedor);
          proveedor.nit = data.nit;
          proveedor.ciudad = capitalizar(data.ciudad);
          proveedor.pais = capitalizar(data.pais);
          proveedor.direccion = data.direccion;
          proveedor.fechaFinContrato = data.fechaFinContrato;
          proveedor.estadoProveedor = data.estadoProveedor;
          proveedor.nombreContacto = capitalizar(data.nombreContacto);
          proveedor.tipoDocumento = data.tipoDocumento;
          proveedor.numeroIdentificacion = data.numeroIdentificacion;
          proveedor.telefono = data.telefono;
          proveedor.correo = data.correo;
          proveedor.notas = data.notas;
          
          // Si cambió el nombre, actualizar en productos
          if (nombreAnterior.toLowerCase() !== proveedor.nombreProveedor.toLowerCase()) {
            this.productos.forEach(producto => {
              if (producto.proveedor.toLowerCase() === nombreAnterior.toLowerCase()) {
                producto.proveedor = proveedor.nombreProveedor;
              }
            });
          }
        }

        this.guardarEnStorage();
        this.cancelarModalProveedor();
        this.renderizarTabla();
      }
    );
  }

  eliminarProveedor(proveedor) {
    const cantidadProductos = proveedor.productosIds.length;
    const mensaje = cantidadProductos > 0 
      ? `¿Está seguro de eliminar este proveedor? Se eliminarán también ${cantidadProductos} producto(s) asociado(s). Esta acción no se puede deshacer.`
      : '¿Está seguro de eliminar este proveedor? Esta acción no se puede deshacer.';

    mostrarConfirmacion(
      'Eliminar proveedor', 
      mensaje, 
      () => {
        // Eliminar alarmas de productos asociados
        proveedor.productosIds.forEach(productoId => {
          eliminarAlarmasProducto(productoId);
        });
        
        // Eliminar alarmas del proveedor
        eliminarAlarmasProveedor(proveedor.id);
        
        // Eliminar productos asociados
        this.productos = this.productos.filter(p => !proveedor.productosIds.includes(p.id));
        
        // Eliminar proveedor
        this.proveedores = this.proveedores.filter(p => p.id !== proveedor.id);

        this.guardarEnStorage();
        this.ajustarPaginaDespuesEliminar();
        this.renderizarTabla();
      }
    );
  }

  ajustarPaginaDespuesEliminar() {
    const filtrados = this.filtrarProveedores();
    const totalPaginas = Math.ceil(filtrados.length / this.proveedoresPorPagina);
    
    if (this.paginaActual > totalPaginas && totalPaginas > 0) {
      this.paginaActual = totalPaginas;
    }
    
    if (filtrados.length === 0) {
      this.paginaActual = 1;
    }
  }

  // MODAL PRODUCTOS SUMINISTRADOS
  abrirModalProductos(proveedor) {
    const productosProveedor = this.productos.filter(p => 
      proveedor.productosIds.includes(p.id)
    );

    if (productosProveedor.length === 0) {
      alert('Este proveedor no tiene productos suministrados.');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'superposicion-modal-productos';
    modal.innerHTML = `
      <div class="contenido-modal-productos" style="max-width:900px;width:90%;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;">
        <div class="modal-header" style="flex-shrink:0;">
          <span class="modal-titulo">Productos suministrados por ${proveedor.nombreProveedor}</span>
          <span class="modal-cerrar" style="cursor:pointer;font-size:20px;">&times;</span>
        </div>
        <hr style="border:none;border-bottom:1px solid #ccc;margin:10px 0;flex-shrink:0;">
        <div style="flex:1;overflow-y:auto;min-height:0;">
          <table class="modal-productos" id="tablaProductosModal" style="width:100%;">
            <thead style="position:sticky;top:0;background:#f4f4f4;z-index:10;">
              <tr>
                <th style="width:40px;"></th>
                <th>Producto</th>
                <th>Lote</th>
                <th>Laboratorio</th>
                <th style="width:80px;">Stock</th>
                <th style="width:80px;">Estado</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.renderizarProductosModal(productosProveedor);

    // Eventos de cierre
    modal.querySelector('.modal-cerrar').onclick = () => document.body.removeChild(modal);
    modal.onclick = (e) => { 
      if (e.target === modal) document.body.removeChild(modal); 
    };
    
    const cerrarEsc = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', cerrarEsc);
      }
    };
    document.addEventListener('keydown', cerrarEsc);
  }

  renderizarProductosModal(productos) {
    const tbody = document.querySelector('#tablaProductosModal tbody');
    tbody.innerHTML = '';

    // Agrupar por nombre de producto
    const grupos = {};
    productos.forEach(p => {
      if (!grupos[p.nombreProducto]) {
        grupos[p.nombreProducto] = [];
      }
      grupos[p.nombreProducto].push(p);
    });

    Object.values(grupos).forEach(grupo => {
      if (grupo.length === 1) {
        // Un solo producto
        const p = grupo[0];
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td></td>
          <td>${p.obtenerNombreCompleto()}</td>
          <td>${p.numeroLote}</td>
          <td>${p.laboratorio}</td>
          <td>${p.stock}</td>
          <td><div class="circulo-estado ${p.obtenerEstado()}"></div></td>
        `;
        tbody.appendChild(tr);
      } else {
        // Múltiples productos: crear sublista
        const trPrincipal = document.createElement('tr');
        trPrincipal.className = 'producto-principal';
        trPrincipal.style.cursor = 'pointer';
        trPrincipal.innerHTML = `
          <td><span class="material-symbols-outlined chevron" style="font-size:14px;">chevron_right</span></td>
          <td colspan="5">${grupo[0].nombreProducto}</td>
        `;
        tbody.appendChild(trPrincipal);

        const subfilas = [];
        grupo.forEach(p => {
          const trSub = document.createElement('tr');
          trSub.className = 'sublista';
          trSub.style.display = 'none';
          trSub.innerHTML = `
            <td></td>
            <td>${p.obtenerNombreCompleto()}</td>
            <td>${p.numeroLote}</td>
            <td>${p.laboratorio}</td>
            <td>${p.stock}</td>
            <td><div class="circulo-estado ${p.obtenerEstado()}"></div></td>
          `;
          tbody.appendChild(trSub);
          subfilas.push(trSub);
        });

        trPrincipal.onclick = () => {
          const chevron = trPrincipal.querySelector('.chevron');
          const expandido = chevron.textContent === 'expand_more';
          chevron.textContent = expandido ? 'chevron_right' : 'expand_more';
          subfilas.forEach(sf => sf.style.display = expandido ? 'none' : 'table-row');
        };
      }
    });
  }

  // RENDERIZADO
  renderizarTabla() {
    const tbody = document.getElementById('tablaProductos');
    tbody.innerHTML = '';

    const filtrados = this.filtrarProveedores();
    const inicio = (this.paginaActual - 1) * this.proveedoresPorPagina;
    const pagina = filtrados.slice(inicio, inicio + this.proveedoresPorPagina);

    pagina.forEach(prov => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td></td>
        <td><input type="checkbox" /></td>
        <td>${prov.nombreProveedor}</td>
        <td>${prov.nombreContacto}</td>
        <td>${prov.correo}</td>
        <td>${prov.pais}</td>
        <td style="text-align:center;">
          <span class="material-symbols-outlined abrir-productos" data-id="${prov.id}" style="cursor:pointer;color:#1976d2;">open_in_new</span>
        </td>
        <td>${prov.fechaFinContrato || 'N/A'}</td>
        <td style="text-align:center;">
          ${prov.estadoProveedor === 'activo' 
            ? '<span style="color:green;font-size:18px;">●</span> Activo' 
            : '<span style="color:red;font-size:18px;">●</span> Inactivo'}
        </td>
        <td class="celda-mas">
          <div class="envoltorio-mas"><span class="material-symbols-outlined">more_vert</span></div>
          <div class="envoltorio-acciones">
            <span class="material-symbols-outlined accion" data-accion="ver" data-id="${prov.id}">visibility</span>
            <span class="material-symbols-outlined accion" data-accion="editar" data-id="${prov.id}">edit</span>
            <span class="material-symbols-outlined accion" data-accion="eliminar" data-id="${prov.id}">delete</span>
          </div>
        </td>
      `;

      // Evento abrir productos
      tr.querySelector('.abrir-productos').onclick = () => this.abrirModalProductos(prov);
      
      // Eventos de celda de acciones
      const celdaMas = tr.querySelector('.celda-mas');
      configurarEventosCelda(celdaMas);
      
      const acciones = tr.querySelectorAll('.accion');
      acciones.forEach(btn => {
        btn.addEventListener('click', () => {
          const accion = btn.dataset.accion;
          
          if (accion === 'ver') {
            this.verProveedor(prov);
          } else if (accion === 'editar') {
            this.abrirModalProveedor(prov);
          } else if (accion === 'eliminar') {
            this.eliminarProveedor(prov);
          }
        });
      });

      tbody.appendChild(tr);
    });

    this.actualizarPaginacion(filtrados.length);
  }

  // FILTRADO
  filtrarProveedores() {
    if (!this.busquedaActual) {
      return this.proveedores.slice();
    }

    const busq = this.busquedaActual.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    return this.proveedores.filter(prov => {
      if (this.filtroActual === 'proveedor') {
        const nombre = prov.nombreProveedor.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return nombre.includes(busq);
        
      } else if (this.filtroActual === 'contacto') {
        const contacto = prov.nombreContacto.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return contacto.includes(busq);
        
      } else if (this.filtroActual === 'producto') {
        const productosAsociados = this.productos.filter(p => 
          prov.productosIds.includes(p.id)
        );
        return productosAsociados.some(p => {
          const nombreProd = p.obtenerNombreCompleto().toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return nombreProd.includes(busq);
        });
        
      } else {
        // Filtro "todos"
        const texto = (
          prov.nombreProveedor + ' ' + 
          prov.nombreContacto + ' ' + 
          prov.correo + ' ' + 
          prov.pais
        ).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return texto.includes(busq);
      }
    });
  }

  // PAGINACIÓN
  actualizarPaginacion(total) {
    const pag = document.querySelector('.paginacion');
    pag.querySelectorAll('.btn-pagina:not([aria-label])').forEach(btn => btn.remove());
    pag.style.display = 'flex';

    const totalPags = Math.max(1, Math.ceil(total / this.proveedoresPorPagina));
    let inicio = Math.max(1, this.paginaActual - 2);
    let fin = Math.min(totalPags, inicio + 4);
    
    if (fin - inicio < 4) {
      inicio = Math.max(1, fin - 4);
    }

    const btnSig = pag.querySelector('[aria-label="Siguiente"]');

    for (let i = inicio; i <= fin; i++) {
      const btn = document.createElement('button');
      btn.className = 'btn-pagina';
      btn.textContent = i;
      if (i === this.paginaActual) btn.classList.add('active');
      
      btn.onclick = () => { 
        if (total > 0) { 
          this.paginaActual = i; 
          this.renderizarTabla(); 
        } 
      };
      
      pag.insertBefore(btn, btnSig);
    }

    const btnAnt = pag.querySelector('[aria-label="Anterior"]');
    btnAnt.onclick = () => { 
      if (this.paginaActual > 1 && total > 0) { 
        this.paginaActual--; 
        this.renderizarTabla(); 
      } 
    };
    
    btnSig.onclick = () => { 
      if (this.paginaActual < totalPags && total > 0) { 
        this.paginaActual++; 
        this.renderizarTabla(); 
      } 
    };
  }
}

// INICIALIZAR
let gestorProveedores;

document.addEventListener('DOMContentLoaded', () => {
  gestorProveedores = new GestorProveedores();
});