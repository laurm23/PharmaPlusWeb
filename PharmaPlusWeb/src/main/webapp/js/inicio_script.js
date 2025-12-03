// INICIO (DASHBOARD) - SCRIPT CORREGIDO

class GestorDashboard {
  constructor() {
    this.productos = [];
    this.proveedores = [];
    this.alarmas = [];
    this.filtroStockActual = 'bajo';
    
    this.cargarDatos();
    this.inicializarEventos();
    this.renderizarMetricas();
    this.renderizarTareasPendientes();
    this.renderizarInventario();
    this.renderizarVencimientos();
    this.renderizarContratos();
  }

  cargarDatos() {
    const prod = localStorage.getItem('productos');
    if (prod) {
      this.productos = JSON.parse(prod).map(p => {
        const producto = new Producto(p);
        producto.stockInicial = p.stockInicial;
        producto.fechaCreacion = p.fechaCreacion || 0;
        return producto;
      });
    }

    const prov = localStorage.getItem('proveedores');
    if (prov) {
      this.proveedores = JSON.parse(prov).map(prov => new Proveedor(prov));
    }

    const alarm = localStorage.getItem('alarmas');
    if (alarm) {
      this.alarmas = JSON.parse(alarm)
        .filter(a => !a.completada)
        .map(a => new Alarma(a));
    }
  }

  inicializarEventos() {
    // Filtros de stock
    const filtros = document.querySelectorAll('.ficha');
    filtros.forEach(filtro => {
      filtro.addEventListener('click', () => {
        filtros.forEach(f => f.classList.remove('active'));
        filtro.classList.add('active');
        this.filtroStockActual = filtro.dataset.filter;
        this.renderizarInventario();
      });
    });

    // Click en tareas: redirigir a alarmas
    document.getElementById('listaTareas').addEventListener('click', (e) => {
      const tarea = e.target.closest('.elemento-tarea');
      if (tarea) {
        const tipo = tarea.dataset.tipo;
        const alarmaId = tarea.dataset.alarmaId;
        localStorage.setItem('alarmaFiltroSeleccionado', tipo);
        localStorage.setItem('alarmaIdSeleccionada', alarmaId);
        window.location.href = contextPath + "/alarmas";
      }
    });
  }

  renderizarMetricas() {
    // 1. Stock agotado (stock === 0)
    const agotados = this.productos.filter(p => p.stock === 0).length;
    document.getElementById('metricaAgotado').textContent = agotados;

    // 2. Stock bajo (stock > 0 y <= 33% del inicial)
    const stockBajo = this.productos.filter(p => {
      if (p.stock === 0 || p.stockInicial === 0) return false;
      const porcentaje = p.stock / p.stockInicial;
      return porcentaje <= 0.33;
    }).length;
    document.getElementById('metricaBajo').textContent = stockBajo;

    // 3. Próximos a vencer (en los próximos 30 días)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);
    en30Dias.setHours(23, 59, 59, 999);
    
    const porVencer = this.productos.filter(p => {
      if (!p.fechaVencimiento) return false;
      try {
        const fechaVenc = new Date(p.fechaVencimiento);
        fechaVenc.setHours(23, 59, 59, 999);
        return fechaVenc >= hoy && fechaVenc <= en30Dias;
      } catch (e) {
        return false;
      }
    }).length;
    document.getElementById('metricaVencer').textContent = porVencer;

    // 4. Total de productos
    document.getElementById('metricaTotal').textContent = this.productos.length;
  }

  renderizarTareasPendientes() {
    const contenedor = document.getElementById('listaTareas');
    const contador = document.getElementById('contadorTareas');
    
    contenedor.innerHTML = '';
    contador.textContent = this.alarmas.length;

    if (this.alarmas.length === 0) {
      contenedor.innerHTML = `
        <div class="estado-vacio">
          <div class="icono-vacio">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <p class="texto-vacio">No hay tareas pendientes</p>
        </div>
      `;
      return;
    }

    // Ordenar alarmas por fecha (más reciente primero)
    const alarmasOrdenadas = this.alarmas.sort((a, b) => 
      b.fechaCreacion - a.fechaCreacion
    );

    alarmasOrdenadas.forEach(alarma => {
      const datos = this.obtenerDatosTarea(alarma);
      
      const div = document.createElement('div');
      div.className = 'elemento-tarea';
      div.dataset.tipo = alarma.tipo;
      div.dataset.alarmaId = alarma.id;
      
      div.innerHTML = `
        <div class="icono-tarea ${datos.severidad}">
          <span class="material-symbols-outlined">${datos.icono}</span>
        </div>
        <div class="contenido-tarea">
          <div class="titulo-tarea">${datos.titulo}</div>
          <div class="subtitulo-tarea">${datos.subtitulo}</div>
        </div>
      `;
      
      contenedor.appendChild(div);
    });
  }

  obtenerDatosTarea(alarma) {
    let datos = {};

    if (alarma.tipo === 'stock-agotado') {
      const producto = this.productos.find(p => p.id === alarma.productoId);
      datos.severidad = 'critica';
      datos.icono = 'error';
      datos.titulo = 'Stock agotado';
      datos.subtitulo = producto ? producto.obtenerNombreCompleto() : 'Producto';
    }
    else if (alarma.tipo === 'stock-bajo') {
      const producto = this.productos.find(p => p.id === alarma.productoId);
      datos.severidad = 'advertencia';
      datos.icono = 'warning';
      datos.titulo = 'Stock bajo';
      datos.subtitulo = producto ? producto.obtenerNombreCompleto() : 'Producto';
    }
    else if (alarma.tipo === 'proximo-vencer') {
      const producto = this.productos.find(p => p.id === alarma.productoId);
      datos.severidad = 'informacion';
      datos.icono = 'schedule';
      datos.titulo = 'Próximo a vencer';
      datos.subtitulo = producto ? producto.obtenerNombreCompleto() : 'Producto';
    }
    else if (alarma.tipo === 'contrato-vencer') {
      const proveedor = this.proveedores.find(p => p.id === alarma.proveedorId);
      datos.severidad = 'informacion';
      datos.icono = 'description';
      datos.titulo = 'Contrato por vencer';
      datos.subtitulo = proveedor ? proveedor.nombreProveedor : 'Proveedor';
    }

    return datos;
  }

  renderizarInventario() {
    const contenedor = document.getElementById('listaInventario');
    contenedor.innerHTML = '';

    // Filtrar productos por estado
    const productosFiltrados = this.productos.filter(p => {
      const estado = p.obtenerEstado();
      return estado === this.filtroStockActual;
    });

    if (productosFiltrados.length === 0) {
      contenedor.innerHTML = `
        <div class="estado-vacio">
          <div class="icono-vacio">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
          <p class="texto-vacio">No hay productos con stock ${this.filtroStockActual}</p>
        </div>
      `;
      return;
    }

    // Ordenar por cantidad de stock (menor a mayor)
    const productosOrdenados = productosFiltrados.sort((a, b) => a.stock - b.stock);

    productosOrdenados.forEach(producto => {
      const div = document.createElement('div');
      div.className = 'elemento-inventario';
      
      div.innerHTML = `
        <div class="info-inventario">
          <div class="nombre-inventario">${producto.obtenerNombreCompleto()}</div>
          <div class="codigo-inventario">Lote: ${producto.numeroLote}</div>
        </div>
        <div class="estado-inventario">
          <span class="insignia-stock ${producto.obtenerEstado()}">${producto.stock} und</span>
        </div>
      `;
      
      contenedor.appendChild(div);
    });
  }

  renderizarVencimientos() {
    const contenedor = document.getElementById('listaVencimientos');
    contenedor.innerHTML = '';

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);
    en30Dias.setHours(23, 59, 59, 999);

    // Filtrar productos que vencen en los próximos 30 días
    const productosVencer = this.productos.filter(p => {
      if (!p.fechaVencimiento) return false;
      try {
        const fechaVenc = new Date(p.fechaVencimiento);
        fechaVenc.setHours(23, 59, 59, 999);
        return fechaVenc >= hoy && fechaVenc <= en30Dias;
      } catch (e) {
        return false;
      }
    });

    if (productosVencer.length === 0) {
      contenedor.innerHTML = `
        <div class="estado-vacio">
          <div class="icono-vacio">
            <span class="material-symbols-outlined">event_available</span>
          </div>
          <p class="texto-vacio">No hay productos próximos a vencer</p>
        </div>
      `;
      return;
    }

    // Ordenar por fecha de vencimiento (más próximo primero)
    const productosOrdenados = productosVencer.sort((a, b) => {
      return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
    });

    productosOrdenados.forEach(producto => {
      const fechaVenc = new Date(producto.fechaVencimiento);
      const diasRestantes = Math.ceil((fechaVenc - hoy) / 86400000);
      
      const div = document.createElement('div');
      div.className = 'elemento-vencimiento';
      
      div.innerHTML = `
        <div class="info-vencimiento">
          <div class="nombre-vencimiento">${producto.obtenerNombreCompleto()}</div>
          <div class="lote-vencimiento">Lote: ${producto.numeroLote}</div>
        </div>
        <div class="fecha-vencimiento">
          <div class="dias-restantes">${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}</div>
          <div class="texto-fecha">${producto.fechaVencimiento}</div>
        </div>
      `;
      
      contenedor.appendChild(div);
    });
  }

  renderizarContratos() {
    const contenedor = document.getElementById('listaContratos');
    contenedor.innerHTML = '';

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);
    en30Dias.setHours(23, 59, 59, 999);

    // Filtrar proveedores con contratos próximos a vencer
    const proveedoresVencer = this.proveedores.filter(p => {
      if (!p.fechaFinContrato || p.fechaFinContrato === '') return false;
      
      try {
        const fechaFin = new Date(p.fechaFinContrato);
        fechaFin.setHours(23, 59, 59, 999);
        return fechaFin >= hoy && fechaFin <= en30Dias;
      } catch (e) {
        return false;
      }
    });

    if (proveedoresVencer.length === 0) {
      contenedor.innerHTML = `
        <div class="estado-vacio">
          <div class="icono-vacio">
            <span class="material-symbols-outlined">assignment_turned_in</span>
          </div>
          <p class="texto-vacio">No hay contratos próximos a vencer</p>
        </div>
      `;
      return;
    }

    // Ordenar por fecha de vencimiento (más próximo primero)
    const proveedoresOrdenados = proveedoresVencer.sort((a, b) => {
      return new Date(a.fechaFinContrato) - new Date(b.fechaFinContrato);
    });

    proveedoresOrdenados.forEach(proveedor => {
      const fechaFin = new Date(proveedor.fechaFinContrato);
      const diasRestantes = Math.ceil((fechaFin - hoy) / 86400000);
      
      const div = document.createElement('div');
      div.className = 'elemento-contrato';
      
      div.innerHTML = `
        <div class="info-contrato">
          <div class="nombre-contrato">${proveedor.nombreProveedor}</div>
          <div class="contacto-contrato">${proveedor.nombreContacto}</div>
        </div>
        <div class="fecha-contrato">
          <div class="dias-restantes">${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}</div>
          <div class="texto-fecha">${proveedor.fechaFinContrato}</div>
        </div>
      `;
      
      contenedor.appendChild(div);
    });
  }
}

// INICIALIZAR DASHBOARD
let gestorDashboard;

document.addEventListener('DOMContentLoaded', () => {
  gestorDashboard = new GestorDashboard();
});