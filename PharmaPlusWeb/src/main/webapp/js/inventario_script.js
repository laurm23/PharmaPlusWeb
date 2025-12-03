// INVENTARIO - VERSIÓN FUNCIONAL

class GestorInventario {
  constructor() {
    this.productos = [];
    this.proveedores = [];
    this.paginaActual = 1;
    this.productosPorPagina = 11;
    this.filtroActual = 'todos';
    this.busquedaActual = '';
    this.productoTemporal = null;
    this.modoEdicion = false;
    this.productoEditandoId = null;
    
    this.cargarDatos();
    this.inicializarEventos();
    this.renderizarTabla();
  }

  cargarDatos() {
    const productosGuardados = localStorage.getItem('productos');
    const proveedoresGuardados = localStorage.getItem('proveedores');

    if (productosGuardados) {
      const productosData = JSON.parse(productosGuardados);
      this.productos = productosData.map(p => {
        const producto = new Producto(p);
        producto.stockInicial = p.stockInicial;
        producto.fechaCreacion = p.fechaCreacion || 0;
        return producto;
      });
    }

    if (proveedoresGuardados) {
      const proveedoresData = JSON.parse(proveedoresGuardados);
      this.proveedores = proveedoresData.map(prov => {
        const proveedor = new Proveedor(prov);
        proveedor.productosIds = prov.productosIds || [];
        return proveedor;
      });
    }
  }

  guardarEnStorage() {
    localStorage.setItem('productos', JSON.stringify(this.productos));
    localStorage.setItem('proveedores', JSON.stringify(this.proveedores));
    
    if (window.SistemaNotificaciones) {
      window.SistemaNotificaciones.actualizar();
    }
  }

  inicializarEventos() {
    // Botón añadir producto
    const btnAgregar = document.querySelector('.btn-agregar');
    if (btnAgregar) {
      btnAgregar.addEventListener('click', () => {
        this.abrirModalProducto();
      });
    }

    // Cerrar modal producto
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    if (btnCerrarModal) {
      btnCerrarModal.addEventListener('click', () => {
        this.cancelarModalProducto();
      });
    }

    const btnCancelarAgregar = document.getElementById('btnCancelarAgregar');
    if (btnCancelarAgregar) {
      btnCancelarAgregar.addEventListener('click', () => {
        this.cancelarModalProducto();
      });
    }

    // Cerrar modal proveedor - VERIFICAR QUE EXISTA
    const btnCerrarProveedor = document.getElementById('btnCerrarProveedor');
    if (btnCerrarProveedor) {
      btnCerrarProveedor.addEventListener('click', () => {
        this.cancelarModalProveedor();
      });
    }

    const btnCancelarProveedor = document.getElementById('btnCancelarProveedor');
    if (btnCancelarProveedor) {
      btnCancelarProveedor.addEventListener('click', () => {
        this.cancelarModalProveedor();
      });
    }

    // Submit formularios
    const formProducto = document.getElementById('formularioAgregarProducto');
    if (formProducto) {
      formProducto.addEventListener('submit', (e) => {
        e.preventDefault();
        this.procesarFormularioProducto(e);
      });
    }

    const formProveedor = document.getElementById('formularioAgregarProveedor');
    if (formProveedor) {
      formProveedor.addEventListener('submit', (e) => {
        e.preventDefault();
        this.procesarFormularioProveedor(e);
      });
    }

    // Búsqueda y filtros
    const buscador = document.getElementById('buscador');
    if (buscador) {
      buscador.addEventListener('input', (e) => {
        this.busquedaActual = e.target.value;
        this.paginaActual = 1;
        this.renderizarTabla();
      });
    }

    const filtro = document.getElementById('filtroBusqueda');
    if (filtro) {
      filtro.addEventListener('change', (e) => {
        this.filtroActual = e.target.value;
        this.paginaActual = 1;
        this.renderizarTabla();
      });
    }

    // Capitalización automática
    configurarCapitalizacion([
      'nombreProducto', 'categoria', 'proveedor', 'laboratorio',
      'nombreProveedor', 'ciudad', 'pais', 'nombreContacto'
    ]);
  }

  abrirModalProducto(producto = null) {
    const modal = document.getElementById('modalAgregarProducto');
    const form = document.getElementById('formularioAgregarProducto');
    const titulo = modal.querySelector('.modal-titulo');
    
    this.restaurarFormularioProducto();
    
    const hoy = new Date().toISOString().split('T')[0];
    const fechaRegistro = document.getElementById('fechaRegistro');
    const fechaVencimiento = document.getElementById('fechaVencimiento');
    
    if (fechaRegistro) fechaRegistro.max = hoy;
    if (fechaVencimiento) fechaVencimiento.min = hoy;
    
    if (producto) {
      this.modoEdicion = true;
      this.productoEditandoId = producto.id;
      titulo.textContent = 'Editar producto';
      llenarFormulario(form, producto);
      
      const inputProveedor = document.getElementById('proveedor');
      if (inputProveedor) {
        inputProveedor.readOnly = true;
        inputProveedor.style.backgroundColor = '#f5f5f5';
        inputProveedor.style.cursor = 'not-allowed';
      }
    } else {
      this.modoEdicion = false;
      this.productoEditandoId = null;
      titulo.textContent = 'Añadir producto';
    }
    
    modal.style.display = 'flex';
  }

  cancelarModalProducto() {
    cerrarModal('modalAgregarProducto');
    this.restaurarFormularioProducto();
    this.productoTemporal = null;
    this.modoEdicion = false;
    this.productoEditandoId = null;
  }

  restaurarFormularioProducto() {
    const form = document.getElementById('formularioAgregarProducto');
    form.reset();
    limpiarErrores(form);
    
    const campos = form.querySelectorAll('input, select');
    campos.forEach(input => {
      input.readOnly = false;
      input.disabled = false;
      input.style.backgroundColor = '';
      input.style.cursor = '';
    });
    
    const acciones = form.querySelector('.acciones-formulario');
    if (acciones) acciones.style.display = 'flex';
  }

  procesarFormularioProducto(e) {
    if (!validarFormulario('formularioAgregarProducto')) {
      return;
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (this.modoEdicion) {
      this.editarProducto(data);
    } else {
      this.guardarNuevoProducto(data);
    }
  }

  guardarNuevoProducto(data) {
    const nombreProveedor = capitalizar(data.proveedor);
    
    const proveedorExiste = this.proveedores.some(p => 
      p.nombreProveedor.toLowerCase() === nombreProveedor.toLowerCase()
    );

    if (!proveedorExiste) {
      // Guardar temporalmente y abrir modal de proveedor
      this.productoTemporal = data;
      cerrarModal('modalAgregarProducto');
      this.abrirModalProveedor(nombreProveedor);
    } else {
      // Guardar directamente
      this.finalizarGuardadoProducto(data);
    }
  }

  finalizarGuardadoProducto(data) {
    const producto = new Producto(data);
    this.productos.push(producto);

    const proveedor = this.proveedores.find(p => 
      p.nombreProveedor.toLowerCase() === capitalizar(data.proveedor).toLowerCase()
    );
    
    if (proveedor) {
      proveedor.agregarProducto(producto.id);
    }

    this.guardarEnStorage();
    cerrarModal('modalAgregarProducto');
    this.productoTemporal = null;
    this.paginaActual = 1;
    this.renderizarTabla();
  }

  editarProducto(data) {
    mostrarConfirmacion(
      'Confirmar cambios',
      '¿Está seguro de guardar los cambios realizados?',
      () => {
        const producto = this.productos.find(p => p.id === this.productoEditandoId);
        
        if (producto) {
          producto.nombreProducto = capitalizar(data.nombreProducto);
          producto.concentracionCantidad = data.concentracionCantidad;
          producto.concentracionUnidad = data.concentracionUnidad;
          producto.categoria = capitalizar(data.categoria);
          producto.codigo = data.codigo;
          producto.numeroLote = data.numeroLote;
          producto.laboratorio = capitalizar(data.laboratorio);
          producto.stock = parseInt(data.stock);
          producto.ubicacion = data.ubicacion;
          producto.precio = parseFloat(data.precio);
          producto.fechaRegistro = data.fechaRegistro;
          producto.fechaVencimiento = data.fechaVencimiento;
        }

        this.guardarEnStorage();
        this.cancelarModalProducto();
        this.renderizarTabla();
      }
    );
  }

  verProducto(producto) {
    const modal = document.getElementById('modalAgregarProducto');
    const form = document.getElementById('formularioAgregarProducto');
    
    this.restaurarFormularioProducto();
    modal.querySelector('.modal-titulo').textContent = 'Ver producto';
    llenarFormulario(form, producto);
    
    const campos = form.querySelectorAll('input, select');
    campos.forEach(input => {
      input.readOnly = true;
      input.disabled = true;
      input.style.backgroundColor = '#f5f5f5';
      input.style.cursor = 'not-allowed';
    });
    
    const acciones = form.querySelector('.acciones-formulario');
    if (acciones) acciones.style.display = 'none';
    
    modal.style.display = 'flex';
  }

  eliminarProducto(producto) {
    mostrarConfirmacion(
      'Eliminar producto',
      '¿Está seguro de eliminar este producto? Esta acción no se puede deshacer.',
      () => {
        this.productos = this.productos.filter(p => p.id !== producto.id);
        
        eliminarAlarmasProducto(producto.id);
        
        const proveedor = this.proveedores.find(p => 
          p.nombreProveedor.toLowerCase() === producto.proveedor.toLowerCase()
        );
        
        if (proveedor) {
          proveedor.eliminarProducto(producto.id);
          
          if (proveedor.productosIds.length === 0) {
            this.proveedores = this.proveedores.filter(prov => prov.id !== proveedor.id);
            eliminarAlarmasProveedor(proveedor.id);
          }
        }

        this.guardarEnStorage();
        this.ajustarPaginaDespuesEliminar();
        this.renderizarTabla();
      }
    );
  }

  ajustarPaginaDespuesEliminar() {
    const productosFiltrados = this.filtrarProductos();
    const productosAgrupados = this.agruparPorProveedor(productosFiltrados);
    const totalPaginas = Math.ceil(productosAgrupados.length / this.productosPorPagina);

    if (this.paginaActual > totalPaginas && totalPaginas > 0) {
      this.paginaActual = totalPaginas;
    }
    
    if (productosAgrupados.length === 0) {
      this.paginaActual = 1;
    }
  }

  abrirModalProveedor(nombreProveedor) {
    const modal = document.getElementById('modalAgregarProveedor');
    const form = document.getElementById('formularioAgregarProveedor');
    
    if (!modal || !form) {
      console.error('Modal de proveedor no encontrado en el HTML');
      return;
    }
    
    form.reset();
    limpiarErrores(form);
    
    const hoy = new Date().toISOString().split('T')[0];
    const fechaFinContrato = document.getElementById('fechaFinContrato');
    if (fechaFinContrato) {
      fechaFinContrato.min = hoy;
    }
    
    const inputNombre = document.getElementById('nombreProveedor');
    if (inputNombre) {
      inputNombre.value = nombreProveedor;
      inputNombre.readOnly = true;
      inputNombre.style.backgroundColor = '#f5f5f5';
      inputNombre.style.cursor = 'not-allowed';
    }
    
    const estadoProveedor = document.getElementById('estadoProveedor');
    if (estadoProveedor) {
      estadoProveedor.value = 'activo';
    }
    
    modal.style.display = 'flex';
  }

  cancelarModalProveedor() {
    cerrarModal('modalAgregarProveedor');
    this.productoTemporal = null;
  }

  procesarFormularioProveedor(e) {
    if (!validarFormulario('formularioAgregarProveedor')) {
      return;
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const proveedor = new Proveedor(data);
    this.proveedores.push(proveedor);

    if (this.productoTemporal) {
      this.finalizarGuardadoProducto(this.productoTemporal);
      this.productoTemporal = null;
    }

    this.guardarEnStorage();
    cerrarModal('modalAgregarProveedor');
    this.renderizarTabla();
  }

  renderizarTabla() {
    const tbody = document.getElementById('tablaProductos');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    const productosFiltrados = this.filtrarProductos();
    const productosOrdenados = productosFiltrados.sort((a, b) => {
      return b.fechaCreacion - a.fechaCreacion;
    });

    const productosAgrupados = this.agruparPorProveedor(productosOrdenados);

    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;
    const productosPagina = productosAgrupados.slice(inicio, fin);

    if (productosPagina.length === 0) {
      tbody.innerHTML = `
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
      `;
    } else {
      productosPagina.forEach(grupo => {
        if (grupo.productos.length === 1) {
          this.renderizarFilaCompleta(tbody, grupo.productos[0]);
        } else {
          this.renderizarGrupoConSublista(tbody, grupo);
        }
      });
    }

    this.actualizarPaginacion(productosAgrupados.length);
  }

  agruparPorProveedor(productos) {
    const grupos = {};

    productos.forEach(p => {
      // Agrupar por NOMBRE DE PRODUCTO (sin concentración)
      const nombreKey = p.nombreProducto.toLowerCase();
      
      if (!grupos[nombreKey]) {
        grupos[nombreKey] = {
          nombreProducto: p.nombreProducto,
          categoria: p.categoria,
          productos: [],
          fechaCreacionGrupo: p.fechaCreacion
        };
      }
      
      grupos[nombreKey].productos.push(p);
    });

    return Object.values(grupos);
  }

  renderizarFilaCompleta(tbody, producto) {
    const tr = document.createElement('tr');
    const estado = producto.obtenerEstado();

    tr.innerHTML = `
      <td></td>
      <td><input type="checkbox" /></td>
      <td>${producto.obtenerNombreCompleto()}</td>
      <td>${producto.categoria}</td>
      <td>${producto.numeroLote}</td>
      <td>${producto.proveedor}</td>
      <td>${producto.laboratorio}</td>
      <td>${producto.stock}</td>
      <td>${producto.ubicacion}</td>
      <td>$${producto.precio.toLocaleString('es-CO')}</td>
      <td><div class="circulo-estado ${estado}"></div></td>
      <td class="celda-mas">
        <div class="envoltorio-mas">
          <span class="material-symbols-outlined">more_vert</span>
        </div>
        <div class="envoltorio-acciones">
          <span class="material-symbols-outlined accion" data-accion="ver" data-id="${producto.id}">visibility</span>
          <span class="material-symbols-outlined accion" data-accion="editar" data-id="${producto.id}">edit</span>
          <span class="material-symbols-outlined accion" data-accion="eliminar" data-id="${producto.id}">delete</span>
        </div>
      </td>
    `;

    this.configurarEventosAcciones(tr);
    tbody.appendChild(tr);
  }

  renderizarGrupoConSublista(tbody, grupo) {
    // Fila principal: solo nombre de producto y categoría
    const trPrincipal = document.createElement('tr');
    
    trPrincipal.innerHTML = `
      <td><span class="material-symbols-outlined flecha-expandir" style="cursor: pointer;">chevron_right</span></td>
      <td><input type="checkbox" /></td>
      <td>${grupo.nombreProducto}</td>
      <td>${grupo.categoria}</td>
      <td colspan="8"></td>
    `;

    tbody.appendChild(trPrincipal);

    const subfilas = [];

    grupo.productos.forEach(producto => {
      const subfila = document.createElement('tr');
      subfila.classList.add('subfila');
      
      const estado = producto.obtenerEstado();
      
      subfila.innerHTML = `
        <td></td>
        <td><input type="checkbox" /></td>
        <td>${producto.obtenerNombreCompleto()} - ${producto.stock} ${producto.concentracionUnidad}</td>
        <td>${producto.categoria}</td>
        <td>${producto.numeroLote}</td>
        <td>${producto.proveedor}</td>
        <td>${producto.laboratorio}</td>
        <td>${producto.stock}</td>
        <td>${producto.ubicacion}</td>
        <td>${producto.precio.toLocaleString('es-CO')}</td>
        <td><div class="circulo-estado ${estado}"></div></td>
        <td class="celda-mas">
          <div class="envoltorio-mas">
            <span class="material-symbols-outlined">more_vert</span>
          </div>
          <div class="envoltorio-acciones">
            <span class="material-symbols-outlined accion" data-accion="ver" data-id="${producto.id}">visibility</span>
            <span class="material-symbols-outlined accion" data-accion="editar" data-id="${producto.id}">edit</span>
            <span class="material-symbols-outlined accion" data-accion="eliminar" data-id="${producto.id}">delete</span>
          </div>
        </td>
      `;

      this.configurarEventosAcciones(subfila);
      tbody.appendChild(subfila);
      subfilas.push(subfila);
    });

    const chevron = trPrincipal.querySelector('.flecha-expandir');
    if (chevron) {
      chevron.addEventListener('click', () => {
        const estaExpandido = chevron.textContent === 'expand_more';
        
        if (estaExpandido) {
          chevron.textContent = 'chevron_right';
          subfilas.forEach(sf => sf.classList.remove('visible'));
        } else {
          chevron.textContent = 'expand_more';
          subfilas.forEach(sf => sf.classList.add('visible'));
        }
      });
    }
  }

  configurarEventosAcciones(fila) {
    const celdaMas = fila.querySelector('.celda-mas');
    if (celdaMas) {
      configurarEventosCelda(celdaMas);

      const acciones = fila.querySelectorAll('.accion');
      acciones.forEach(btn => {
        btn.addEventListener('click', () => {
          const accion = btn.dataset.accion;
          const id = parseFloat(btn.dataset.id);
          const prod = this.productos.find(p => p.id === id);
          
          if (prod) {
            if (accion === 'ver') {
              this.verProducto(prod);
            } else if (accion === 'editar') {
              this.abrirModalProducto(prod);
            } else if (accion === 'eliminar') {
              this.eliminarProducto(prod);
            }
          }
        });
      });
    }
  }

  filtrarProductos() {
    let productos = this.productos.slice();

    if (!this.busquedaActual) {
      return productos;
    }

    const busqueda = this.busquedaActual.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return productos.filter(p => {
      let coincide = false;

      if (this.filtroActual === 'medicamento') {
        const nombre = p.obtenerNombreCompleto().toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        coincide = nombre.includes(busqueda);
        
      } else if (this.filtroActual === 'categoria') {
        const categoria = p.categoria.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        coincide = categoria.includes(busqueda);
        
      } else if (this.filtroActual === 'proveedor') {
        const proveedor = p.proveedor.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        coincide = proveedor.includes(busqueda);
        
      } else if (this.filtroActual === 'lote') {
        const lote = p.numeroLote.toLowerCase();
        coincide = lote.includes(busqueda);
        
      } else {
        const textoCompleto = (
          p.obtenerNombreCompleto() + ' ' + 
          p.categoria + ' ' + 
          p.proveedor + ' ' + 
          p.numeroLote + ' ' + 
          p.laboratorio
        ).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        coincide = textoCompleto.includes(busqueda);
      }

      return coincide;
    });
  }

  actualizarPaginacion(totalGrupos) {
    const paginacion = document.querySelector('.paginacion');
    if (!paginacion) return;
    
    const botonesExistentes = paginacion.querySelectorAll('.btn-pagina:not([aria-label])');
    botonesExistentes.forEach(btn => btn.remove());

    paginacion.style.display = 'flex';

    const totalPaginas = Math.max(1, Math.ceil(totalGrupos / this.productosPorPagina));

    let inicio = Math.max(1, this.paginaActual - 2);
    let fin = Math.min(totalPaginas, inicio + 4);

    if (fin - inicio < 4) {
      inicio = Math.max(1, fin - 4);
    }

    const btnSiguiente = paginacion.querySelector('[aria-label="Siguiente"]');

    for (let i = inicio; i <= fin; i++) {
      const btn = document.createElement('button');
      btn.className = 'btn-pagina';
      btn.textContent = i;
      
      if (i === this.paginaActual) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {
        if (totalGrupos > 0) {
          this.paginaActual = i;
          this.renderizarTabla();
        }
      });

      paginacion.insertBefore(btn, btnSiguiente);
    }

    const btnAnterior = paginacion.querySelector('[aria-label="Anterior"]');
    
    if (btnAnterior) {
      btnAnterior.onclick = () => {
        if (this.paginaActual > 1 && totalGrupos > 0) {
          this.paginaActual--;
          this.renderizarTabla();
        }
      };
    }

    if (btnSiguiente) {
      btnSiguiente.onclick = () => {
        if (this.paginaActual < totalPaginas && totalGrupos > 0) {
          this.paginaActual++;
          this.renderizarTabla();
        }
      };
    }
  }
}

// INICIALIZAR
let gestorInventario;

document.addEventListener('DOMContentLoaded', () => {
  gestorInventario = new GestorInventario();
});