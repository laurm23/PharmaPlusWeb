// SISTEMA DE NOTIFICACIONES GLOBAL - CORREGIDO

function calcularTiempoTranscurrido(timestamp) {
  const ahora = Date.now();
  const diferencia = ahora - timestamp;
  
  const minutos = Math.floor(diferencia / 60000);
  const horas = Math.floor(diferencia / 3600000);
  const dias = Math.floor(diferencia / 86400000);
  
  if (minutos < 60) return minutos <= 1 ? 'Hace 1 min' : `Hace ${minutos} min`;
  if (horas < 24) return horas === 1 ? 'Hace 1 hora' : `Hace ${horas} h`;
  return dias === 1 ? 'Hace 1 día' : `Hace ${dias} d`;
}

// CLASE SISTEMA DE NOTIFICACIONES
class SistemaNotificaciones {
  
  static generarAlarmas() {
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    const proveedores = JSON.parse(localStorage.getItem('proveedores') || '[]');
    let alarmas = JSON.parse(localStorage.getItem('alarmas') || '[]');

    // Limpiar alarmas completadas
    alarmas = alarmas.filter(a => !a.completada);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);
    en30Dias.setHours(23, 59, 59, 999);

    // Generar alarmas de productos
    productos.forEach(producto => {
      // 1. Stock agotado
      if (producto.stock === 0) {
        SistemaNotificaciones.crearAlarma(alarmas, 'stock-agotado', producto.id, null);
      } 
      // 2. Stock bajo (menos de 1/3 del stock inicial)
      else if (producto.stockInicial > 0) {
        const porcentaje = producto.stock / producto.stockInicial;
        if (porcentaje <= 0.33) {
          SistemaNotificaciones.crearAlarma(alarmas, 'stock-bajo', producto.id, null);
        }
      }
      
      // 3. Próximo a vencer (en los próximos 30 días)
      if (producto.fechaVencimiento) {
        try {
          const fechaVenc = new Date(producto.fechaVencimiento);
          fechaVenc.setHours(23, 59, 59, 999);
          
          if (fechaVenc >= hoy && fechaVenc <= en30Dias) {
            SistemaNotificaciones.crearAlarma(alarmas, 'proximo-vencer', producto.id, null);
          }
        } catch (e) {
          console.error('Error al procesar fecha de vencimiento:', e);
        }
      }
    });

    // Generar alarmas de contratos de proveedores
    proveedores.forEach(proveedor => {
      if (proveedor.fechaFinContrato && proveedor.fechaFinContrato !== '') {
        try {
          const fechaFin = new Date(proveedor.fechaFinContrato);
          fechaFin.setHours(23, 59, 59, 999);
          
          // Contrato vence en los próximos 30 días
          if (fechaFin >= hoy && fechaFin <= en30Dias) {
            SistemaNotificaciones.crearAlarma(alarmas, 'contrato-vencer', null, proveedor.id);
          }
        } catch (e) {
          console.error('Error al procesar fecha de contrato:', e);
        }
      }
    });

    // Guardar alarmas actualizadas
    localStorage.setItem('alarmas', JSON.stringify(alarmas));
    return alarmas;
  }

  static crearAlarma(alarmas, tipo, productoId, proveedorId) {
    // Verificar si ya existe una alarma similar no completada
    const existe = alarmas.some(a => 
      a.tipo === tipo && 
      a.productoId === productoId && 
      a.proveedorId === proveedorId && 
      !a.completada
    );
    
    if (!existe) {
      alarmas.push({
        id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
        tipo: tipo,
        productoId: productoId,
        proveedorId: proveedorId,
        leida: false,
        completada: false,
        fechaCreacion: Date.now()
      });
    }
  }

  static limpiarAlarmasInvalidas() {
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    const proveedores = JSON.parse(localStorage.getItem('proveedores') || '[]');
    let alarmas = JSON.parse(localStorage.getItem('alarmas') || '[]');

    const productosIds = productos.map(p => p.id);
    const proveedoresIds = proveedores.map(p => p.id);

    // Filtrar alarmas de productos/proveedores que ya no existen
    alarmas = alarmas.filter(a => {
      if (a.productoId && !productosIds.includes(a.productoId)) return false;
      if (a.proveedorId && !proveedoresIds.includes(a.proveedorId)) return false;
      return true;
    });

    // Limpiar alarmas que ya no aplican (excepto completadas)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);
    en30Dias.setHours(23, 59, 59, 999);

    alarmas = alarmas.filter(alarma => {
      // Mantener alarmas completadas
      if (alarma.completada) return true;

      // Verificar stock agotado
      if (alarma.tipo === 'stock-agotado') {
        const producto = productos.find(p => p.id === alarma.productoId);
        return producto && producto.stock === 0;
      }

      // Verificar stock bajo
      if (alarma.tipo === 'stock-bajo') {
        const producto = productos.find(p => p.id === alarma.productoId);
        if (!producto || producto.stock === 0) return false;
        if (producto.stockInicial === 0) return false;
        const porcentaje = producto.stock / producto.stockInicial;
        return porcentaje <= 0.33;
      }

      // Verificar próximo a vencer
      if (alarma.tipo === 'proximo-vencer') {
        const producto = productos.find(p => p.id === alarma.productoId);
        if (!producto || !producto.fechaVencimiento) return false;
        try {
          const fechaVenc = new Date(producto.fechaVencimiento);
          fechaVenc.setHours(23, 59, 59, 999);
          return fechaVenc >= hoy && fechaVenc <= en30Dias;
        } catch (e) {
          return false;
        }
      }

      // Verificar contrato por vencer
      if (alarma.tipo === 'contrato-vencer') {
        const proveedor = proveedores.find(p => p.id === alarma.proveedorId);
        if (!proveedor || !proveedor.fechaFinContrato) return false;
        try {
          const fechaFin = new Date(proveedor.fechaFinContrato);
          fechaFin.setHours(23, 59, 59, 999);
          return fechaFin >= hoy && fechaFin <= en30Dias;
        } catch (e) {
          return false;
        }
      }

      return true;
    });

    localStorage.setItem('alarmas', JSON.stringify(alarmas));
  }

  static actualizar() {
    SistemaNotificaciones.limpiarAlarmasInvalidas();
    const alarmas = SistemaNotificaciones.generarAlarmas();
    
    // Actualizar panel si existe
    if (window.gestorPanel) {
      window.gestorPanel.actualizarPanel();
    }
    
    return alarmas;
  }
}

// CLASE GESTOR PANEL DE NOTIFICACIONES
class GestorPanelNotificaciones {
  constructor() {
    this.alarmas = [];
    this.productos = [];
    this.proveedores = [];
    
    this.inicializarEventos();
    this.actualizarPanel();
  }

  cargarDatos() {
    const alarm = localStorage.getItem('alarmas');
    if (alarm) {
      this.alarmas = JSON.parse(alarm).filter(a => !a.completada);
    }

    const prod = localStorage.getItem('productos');
    if (prod) {
      this.productos = JSON.parse(prod);
    }

    const prov = localStorage.getItem('proveedores');
    if (prov) {
      this.proveedores = JSON.parse(prov);
    }
  }

  inicializarEventos() {
    const btnNotificacion = document.getElementById('btnNotificacion');
    const panel = document.getElementById('panelNotificaciones');
    const panelFooter = panel ? panel.querySelector('.panel-footer') : null;

    if (!btnNotificacion || !panel) return;

    // Toggle panel
    btnNotificacion.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('active');
    });

    // Cerrar panel al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !btnNotificacion.contains(e.target)) {
        panel.classList.remove('active');
      }
    });

    // Prevenir cierre al hacer click dentro del panel (EXCEPTO en el footer)
    panel.addEventListener('click', (e) => {
      // Si el click es en el footer, permitir que se ejecute
      if (!e.target.closest('.panel-footer')) {
        e.stopPropagation();
      }
    });

    // Hacer clickeable TODO el footer (más accesible)
    if (panelFooter) {
      panelFooter.style.cursor = 'pointer';
      panelFooter.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        localStorage.setItem('alarmaFiltroSeleccionado', 'todas');
        // Usar la ruta relativa directamente
        window.location.href = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/alarmas';
      });
    }
  }

  actualizarPanel() {
    this.cargarDatos();
    
    const listaPanel = document.getElementById('listaPanel');
    const contadorPanel = document.getElementById('contadorPanel');
    const puntoInsignia = document.querySelector('.punto-insignia');

    if (!listaPanel || !contadorPanel) return;

    // Mostrar u ocultar punto rojo de notificación
    if (puntoInsignia) {
      puntoInsignia.style.display = this.alarmas.length > 0 ? 'block' : 'none';
    }

    // Actualizar contador
    contadorPanel.textContent = this.alarmas.length;

    // Limpiar lista
    listaPanel.innerHTML = '';

    // Si no hay alarmas
    if (this.alarmas.length === 0) {
      listaPanel.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 10px;">
          <span class="material-symbols-outlined" style="font-size: 24px; display: block; margin-bottom: 8px;">notifications_off</span>
          No hay notificaciones
        </div>
      `;
      return;
    }

    // Ordenar por fecha y tomar las primeras 5
    const alarmasRecientes = this.alarmas
      .sort((a, b) => b.fechaCreacion - a.fechaCreacion)
      .slice(0, 5);

    // Renderizar cada alarma
    alarmasRecientes.forEach(alarma => {
      const elemento = this.crearElementoPanel(alarma);
      listaPanel.appendChild(elemento);
    });
  }

  crearElementoPanel(alarma) {
    const div = document.createElement('div');
    div.className = 'elemento-panel';

    const datos = this.obtenerDatosAlarma(alarma);

    div.innerHTML = `
      <div class="icono-elemento-panel ${datos.severidad}">
        <span class="material-symbols-outlined">${datos.icono}</span>
      </div>
      <div class="contenido-elemento-panel">
        <div class="titulo-elemento-panel">${datos.titulo}</div>
        <div class="texto-elemento-panel">${datos.texto}</div>
        <div class="tiempo-elemento-panel">${calcularTiempoTranscurrido(alarma.fechaCreacion)}</div>
      </div>
    `;

    // Click: redirigir a página de alarmas con filtro específico
    div.addEventListener('click', () => {
      localStorage.setItem('alarmaFiltroSeleccionado', alarma.tipo);
      localStorage.setItem('alarmaIdSeleccionada', alarma.id);
      window.location.href = contextPath + "/alarmas";
    });

    return div;
  }

  obtenerDatosAlarma(alarma) {
    const tipos = {
      'stock-agotado': { 
        severidad: 'critica', 
        icono: 'error', 
        titulo: 'Stock agotado' 
      },
      'stock-bajo': { 
        severidad: 'advertencia', 
        icono: 'warning', 
        titulo: 'Stock bajo' 
      },
      'proximo-vencer': { 
        severidad: 'informacion', 
        icono: 'schedule', 
        titulo: 'Próximo a vencer' 
      },
      'contrato-vencer': { 
        severidad: 'informacion', 
        icono: 'description', 
        titulo: 'Contrato por vencer' 
      }
    };

    const datos = tipos[alarma.tipo] || { 
      severidad: 'informacion', 
      icono: 'info', 
      titulo: 'Notificación' 
    };

    // Obtener texto según el tipo
    if (alarma.tipo === 'contrato-vencer') {
      const proveedor = this.proveedores.find(p => p.id === alarma.proveedorId);
      datos.texto = proveedor ? proveedor.nombreProveedor : 'Proveedor';
    } else {
      const producto = this.productos.find(p => p.id === alarma.productoId);
      if (producto) {
        datos.texto = `${producto.nombreProducto} ${producto.concentracionCantidad}${producto.concentracionUnidad}`;
      } else {
        datos.texto = 'Producto';
      }
    }

    return datos;
  }
}

// INICIALIZACIÓN AUTOMÁTICA
if (typeof window !== 'undefined') {
  window.SistemaNotificaciones = SistemaNotificaciones;
  
  document.addEventListener('DOMContentLoaded', () => {
    // Actualizar alarmas automáticamente
    SistemaNotificaciones.actualizar();
    
    // Inicializar panel si existe el botón de notificaciones
    if (document.getElementById('btnNotificacion')) {
      window.gestorPanel = new GestorPanelNotificaciones();
    }
  });
}