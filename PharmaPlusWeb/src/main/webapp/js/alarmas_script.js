// ========== ALARMAS - SCRIPT.JS (COMPATIBLE ECLIPSE) ==========
// Versión sin template literals complejos ni optional chaining

// CLASE GESTOR ALARMAS
class GestorAlarmas {
  constructor() {
    this.productos = [];
    this.proveedores = [];
    this.alarmas = [];
    this.filtroActual = localStorage.getItem('alarmaFiltroSeleccionado') || 'todas';
    this.alarmaIdSeleccionada = localStorage.getItem('alarmaIdSeleccionada') || null;
    this.btnEmailActual = null;
    
    this.cargarDatos();
    this.generarAlarmas();
    this.inicializarEventos();
    this.aplicarFiltroInicial();
    this.renderizarAlarmas();
    this.actualizarContadores();
    this.scrollAlarmaSeleccionada();
    
    localStorage.removeItem('alarmaFiltroSeleccionado');
    localStorage.removeItem('alarmaIdSeleccionada');
  }

  cargarDatos() {
    var alarm = localStorage.getItem('alarmas');
    if (alarm) {
      this.alarmas = JSON.parse(alarm).filter(function(a) { return !a.completada; });
    }

    var prod = localStorage.getItem('productos');
    if (prod) {
      this.productos = JSON.parse(prod);
    }

    var prov = localStorage.getItem('proveedores');
    if (prov) {
      this.proveedores = JSON.parse(prov);
    }
  }

  generarAlarmas() {
    var hoy = new Date();
    var en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);
    
    var self = this;

    this.productos.forEach(function(producto) {
      var porcentaje = producto.stock / producto.stockInicial;
      
      if (producto.stock === 0) {
        self.crearAlarma('stock-agotado', producto.id, null);
      } 
      else if (porcentaje <= 0.33) {
        self.crearAlarma('stock-bajo', producto.id, null);
      }
      
      var fechaVenc = new Date(producto.fechaVencimiento);
      if (fechaVenc <= en30Dias && fechaVenc >= hoy) {
        self.crearAlarma('proximo-vencer', producto.id, null);
      }
    });

    this.proveedores.forEach(function(proveedor) {
      if (proveedor.fechaFinContrato && proveedor.fechaFinContrato !== '') {
        var fechaFin = new Date(proveedor.fechaFinContrato);
        fechaFin.setHours(0, 0, 0, 0);
        
        if (!isNaN(fechaFin.getTime()) && fechaFin <= en30Dias) {
          self.crearAlarma('contrato-vencer', null, proveedor.id);
        }
      }
    });

    localStorage.setItem('alarmas', JSON.stringify(this.alarmas));
  }

  crearAlarma(tipo, productoId, proveedorId) {
    var existe = this.alarmas.some(function(a) {
      return a.tipo === tipo && 
             a.productoId === productoId && 
             a.proveedorId === proveedorId && 
             !a.completada;
    });
    
    if (!existe) {
      this.alarmas.push({
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

  inicializarEventos() {
    var self = this;
    var filtros = document.querySelectorAll('.elemento-filtro');
    
    filtros.forEach(function(filtro) {
      filtro.addEventListener('click', function() {
        filtros.forEach(function(f) { f.classList.remove('active'); });
        filtro.classList.add('active');
        self.filtroActual = filtro.dataset.filter;
        self.renderizarAlarmas();
      });
    });

    document.getElementById('cerrarModal').addEventListener('click', function() {
      self.cerrarModalEmail();
    });

    document.getElementById('cancelarEmail').addEventListener('click', function() {
      self.cerrarModalEmail();
    });

    document.getElementById('enviarEmail').addEventListener('click', function() {
      self.enviarEmail();
    });

    document.getElementById('modalEmail').addEventListener('click', function(e) {
      if (e.target.id === 'modalEmail') {
        self.cerrarModalEmail();
      }
    });
  }

  renderizarAlarmas() {
    var contenedor = document.getElementById('listaNotificaciones');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    var self = this;
    var alarmasFiltradas = this.alarmas.filter(function(a) { return !a.completada; });
    
    if (this.filtroActual !== 'todas') {
      alarmasFiltradas = alarmasFiltradas.filter(function(a) {
        return a.tipo === self.filtroActual;
      });
    }

    alarmasFiltradas.sort(function(a, b) { return b.fechaCreacion - a.fechaCreacion; });

    if (alarmasFiltradas.length === 0) {
      contenedor.innerHTML = '<div class="estado-vacio">' +
        '<div class="icono-vacio"><span class="material-symbols-outlined">notifications_off</span></div>' +
        '<h3 class="titulo-vacio">No hay notificaciones</h3>' +
        '<p class="texto-vacio">No tienes alertas pendientes en este momento.</p>' +
        '</div>';
      return;
    }

    alarmasFiltradas.forEach(function(alarma) {
      var tarjeta = self.crearTarjetaAlarma(alarma);
      contenedor.appendChild(tarjeta);
    });
  }

  crearTarjetaAlarma(alarma) {
    var div = document.createElement('div');
    div.className = 'tarjeta-notificacion';
    if (!alarma.leida) div.classList.add('no-leida');

    var datos = {};
    var proveedor = null;
    var self = this;

    if (alarma.tipo === 'contrato-vencer') {
      proveedor = this.proveedores.find(function(p) { return p.id === alarma.proveedorId; });
      datos = this.obtenerDatosContrato(proveedor);
    } else {
      var producto = this.productos.find(function(p) { return p.id === alarma.productoId; });
      proveedor = this.proveedores.find(function(p) {
        return p.nombreProveedor.toLowerCase() === producto.proveedor.toLowerCase();
      });
      datos = this.obtenerDatosProducto(alarma.tipo, producto);
    }

    var proveedorIdVal = proveedor ? proveedor.id : '';
    var iconoLeida = alarma.leida ? 'mark_email_unread' : 'mark_email_read';
    var textoLeida = alarma.leida ? 'Marcar como no leído' : 'Marcar como leído';

    div.innerHTML = 
      '<button class="btn-completar" data-id="' + alarma.id + '">' +
        '<span class="material-symbols-outlined">check_circle</span>' +
      '</button>' +
      '<div class="encabezado-notificacion">' +
        '<div class="icono-notificacion ' + datos.severidad + '">' +
          '<span class="material-symbols-outlined">' + datos.icono + '</span>' +
        '</div>' +
        '<div class="principal-notificacion">' +
          '<div class="titulo-notificacion">' + datos.titulo + '</div>' +
          '<div class="subtitulo-notificacion">' + datos.texto + '</div>' +
          '<div class="tiempo-notificacion">' +
            '<span class="material-symbols-outlined">schedule</span> ' +
            this.calcularTiempoTranscurrido(alarma.fechaCreacion) +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="detalles-notificacion">' +
        '<div class="cuadricula-detalles">' + datos.detalles + '</div>' +
      '</div>' +
      '<div class="acciones-notificacion">' +
        '<button class="btn-notif btn-secundario-notif btn-marcar-leida" data-id="' + alarma.id + '">' +
          '<span class="material-symbols-outlined">' + iconoLeida + '</span> ' + textoLeida +
        '</button>' +
        '<button class="btn-notif btn-primario-notif btn-enviar-email" data-proveedor-id="' + proveedorIdVal + '" data-tipo="' + alarma.tipo + '">' +
          '<span class="material-symbols-outlined">send</span> Enviar email' +
        '</button>' +
      '</div>';

    div.querySelector('.btn-completar').addEventListener('click', function() {
      self.completarAlarma(alarma.id);
    });

    div.querySelector('.btn-marcar-leida').addEventListener('click', function() {
      self.toggleLeidaAlarma(alarma.id);
    });

    div.querySelector('.btn-enviar-email').addEventListener('click', function(e) {
      var provId = parseFloat(e.currentTarget.dataset.proveedorId);
      var tipo = e.currentTarget.dataset.tipo;
      self.btnEmailActual = e.currentTarget;
      self.abrirModalEmail(provId, tipo, alarma);
    });

    return div;
  }

  obtenerDatosProducto(tipo, producto) {
    var datos = {};
    var nombreCompleto = producto.nombreProducto + ' ' + producto.concentracionCantidad + producto.concentracionUnidad;

    if (tipo === 'stock-agotado') {
      datos.severidad = 'critica';
      datos.icono = 'error';
      datos.titulo = 'Stock agotado';
      datos.texto = nombreCompleto;
      datos.detalles = 
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Producto</span><span class="valor-detalle">' + nombreCompleto + '</span></div>' +
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Lote</span><span class="valor-detalle">' + producto.numeroLote + '</span></div>' +
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Proveedor</span><span class="valor-detalle">' + producto.proveedor + '</span></div>' +
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Stock actual</span><span class="valor-detalle">0 unidades</span></div>';
    } 
    else if (tipo === 'stock-bajo') {
      var porcentaje = Math.round((producto.stock / producto.stockInicial) * 100);
      datos.severidad = 'advertencia';
      datos.icono = 'warning';
      datos.titulo = 'Stock bajo';
      datos.texto = nombreCompleto;
      datos.detalles = 
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Producto</span><span class="valor-detalle">' + nombreCompleto + '</span></div>' +
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Lote</span><span class="valor-detalle">' + producto.numeroLote + '</span></div>' +
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Proveedor</span><span class="valor-detalle">' + producto.proveedor + '</span></div>' +
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Stock actual</span><span class="valor-detalle">' + producto.stock + ' unidades (' + porcentaje + '%)</span></div>';
    }
    else if (tipo === 'proximo-vencer') {
      datos.severidad = 'informacion';
      datos.icono = 'schedule';
      datos.titulo = 'Próximo a vencer';
      datos.texto = nombreCompleto;
      datos.detalles = 
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Producto</span><span class="valor-detalle">' + nombreCompleto + '</span></div>' +
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Lote</span><span class="valor-detalle">' + producto.numeroLote + '</span></div>' +
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Proveedor</span><span class="valor-detalle">' + producto.proveedor + '</span></div>' +
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Fecha vencimiento</span><span class="valor-detalle">' + producto.fechaVencimiento + '</span></div>';
    }

    return datos;
  }

  obtenerDatosContrato(proveedor) {
    return {
      severidad: 'informacion',
      icono: 'description',
      titulo: 'Contrato por vencer',
      texto: proveedor.nombreProveedor,
      detalles: 
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Proveedor</span><span class="valor-detalle">' + proveedor.nombreProveedor + '</span></div>' +
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Contacto</span><span class="valor-detalle">' + proveedor.nombreContacto + '</span></div>' +
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Email</span><span class="valor-detalle">' + proveedor.correo + '</span></div>' +
        '<div class="elemento-detalle"><span class="etiqueta-detalle">Fin contrato</span><span class="valor-detalle">' + proveedor.fechaFinContrato + '</span></div>'
    };
  }

  calcularTiempoTranscurrido(timestamp) {
    var ahora = Date.now();
    var diferencia = ahora - timestamp;
    
    var minutos = Math.floor(diferencia / 60000);
    var horas = Math.floor(diferencia / 3600000);
    var dias = Math.floor(diferencia / 86400000);
    
    if (minutos < 60) return minutos <= 1 ? 'Hace 1 min' : 'Hace ' + minutos + ' min';
    if (horas < 24) return horas === 1 ? 'Hace 1 hora' : 'Hace ' + horas + ' h';
    return dias === 1 ? 'Hace 1 día' : 'Hace ' + dias + ' d';
  }

  completarAlarma(alarmaId) {
    var self = this;
    var alarma = this.alarmas.find(function(a) { return a.id === alarmaId; });
    if (alarma) {
      alarma.completada = true;
      localStorage.setItem('alarmas', JSON.stringify(this.alarmas));
      this.renderizarAlarmas();
      this.actualizarContadores();
      
      if (window.gestorPanel) {
        window.gestorPanel.actualizarPanel();
      }
    }
  }

  toggleLeidaAlarma(alarmaId) {
    var alarma = this.alarmas.find(function(a) { return a.id === alarmaId; });
    if (alarma) {
      alarma.leida = !alarma.leida;
      localStorage.setItem('alarmas', JSON.stringify(this.alarmas));
      this.renderizarAlarmas();
    }
  }

  abrirModalEmail(proveedorId, tipo, alarma) {
    var self = this;
    var proveedor = this.proveedores.find(function(p) { return p.id === proveedorId; });
    if (!proveedor) return;

    var modal = document.getElementById('modalEmail');
    document.getElementById('emailPara').value = proveedor.correo;
    
    var contenido = this.generarContenidoEmail(tipo, proveedor, alarma);
    document.getElementById('emailAsunto').value = contenido.asunto;
    document.getElementById('emailMensaje').value = contenido.mensaje;

    modal.classList.add('active');
  }

  generarContenidoEmail(tipo, proveedor, alarma) {
    var asunto = '';
    var mensaje = '';
    var self = this;

    if (tipo === 'stock-agotado' || tipo === 'stock-bajo') {
      var producto = this.productos.find(function(p) { return p.id === alarma.productoId; });
      var nombreProd = producto.nombreProducto + ' ' + producto.concentracionCantidad + producto.concentracionUnidad;
      asunto = 'Solicitud de reposición - ' + producto.nombreProducto;
      mensaje = 'Estimado/a ' + proveedor.nombreContacto + ',\n\n' +
                'Nos ponemos en contacto con usted para solicitar la reposición del siguiente producto:\n\n' +
                'Producto: ' + nombreProd + '\n' +
                'Lote: ' + producto.numeroLote + '\n' +
                'Stock actual: ' + producto.stock + ' unidades\n\n' +
                'Agradecemos su pronta respuesta.\n\n' +
                'Saludos cordiales,\nFarmacia PharmaPlus';
    }
    else if (tipo === 'proximo-vencer') {
      var producto = this.productos.find(function(p) { return p.id === alarma.productoId; });
      var nombreProd = producto.nombreProducto + ' ' + producto.concentracionCantidad + producto.concentracionUnidad;
      asunto = 'Producto próximo a vencer - ' + producto.nombreProducto;
      mensaje = 'Estimado/a ' + proveedor.nombreContacto + ',\n\n' +
                'Le informamos que el siguiente producto está próximo a vencer:\n\n' +
                'Producto: ' + nombreProd + '\n' +
                'Lote: ' + producto.numeroLote + '\n' +
                'Fecha de vencimiento: ' + producto.fechaVencimiento + '\n\n' +
                'Quedamos atentos a su respuesta.\n\n' +
                'Saludos cordiales,\nFarmacia PharmaPlus';
    }
    else if (tipo === 'contrato-vencer') {
      asunto = 'Renovación de contrato - ' + proveedor.nombreProveedor;
      mensaje = 'Estimado/a ' + proveedor.nombreContacto + ',\n\n' +
                'Nos ponemos en contacto con usted para coordinar la renovación de nuestro contrato comercial que vence el ' + proveedor.fechaFinContrato + '.\n\n' +
                'Agradecemos ponerse en contacto con nosotros para coordinar los detalles.\n\n' +
                'Saludos cordiales,\nFarmacia PharmaPlus';
    }

    return { asunto: asunto, mensaje: mensaje };
  }

  cerrarModalEmail() {
    document.getElementById('modalEmail').classList.remove('active');
    document.getElementById('formularioEmail').reset();
  }

  enviarEmail() {
    var para = document.getElementById('emailPara').value;
    var asunto = document.getElementById('emailAsunto').value;
    var mensaje = document.getElementById('emailMensaje').value;

    if (!para || !asunto || !mensaje) {
      alert('Por favor complete todos los campos');
      return;
    }

    var btnEmailPagina = this.btnEmailActual;
    var btnEnviar = document.getElementById('enviarEmail');
    var textoOriginal = btnEnviar.innerHTML;
    
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<span class="material-symbols-outlined">check</span>Enviando...';
    
    var self = this;

    setTimeout(function() {
      if (btnEmailPagina) {
        btnEmailPagina.innerHTML = '<span class="material-symbols-outlined">check_circle</span>Enviado';
        btnEmailPagina.disabled = true;
        btnEmailPagina.style.opacity = '0.6';
      }
      
      self.cerrarModalEmail();
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = textoOriginal;
    }, 1000);
  }

  actualizarContadores() {
    var activas = this.alarmas.filter(function(a) { return !a.completada; });
    
    var contadores = {
      'todas': activas.length,
      'stock-agotado': activas.filter(function(a) { return a.tipo === 'stock-agotado'; }).length,
      'stock-bajo': activas.filter(function(a) { return a.tipo === 'stock-bajo'; }).length,
      'proximo-vencer': activas.filter(function(a) { return a.tipo === 'proximo-vencer'; }).length,
      'contrato-vencer': activas.filter(function(a) { return a.tipo === 'contrato-vencer'; }).length
    };

    Object.keys(contadores).forEach(function(tipo) {
      var elemento = document.getElementById('contador-' + tipo);
      if (elemento) {
        elemento.textContent = contadores[tipo];
      }
    });
  }

  aplicarFiltroInicial() {
    var self = this;
    var filtros = document.querySelectorAll('.elemento-filtro');
    filtros.forEach(function(filtro) {
      if (filtro.dataset.filter === self.filtroActual) {
        filtros.forEach(function(f) { f.classList.remove('active'); });
        filtro.classList.add('active');
      }
    });
  }

  scrollAlarmaSeleccionada() {
    var self = this;
    if (!this.alarmaIdSeleccionada) return;

    setTimeout(function() {
      var tarjetas = document.querySelectorAll('.tarjeta-notificacion');
      tarjetas.forEach(function(tarjeta) {
        var btnCompletar = tarjeta.querySelector('.btn-completar');
        if (btnCompletar && btnCompletar.dataset.id === self.alarmaIdSeleccionada) {
          tarjeta.scrollIntoView({ behavior: 'smooth', block: 'center' });
          tarjeta.style.boxShadow = '0 0 0 3px rgba(47, 92, 255, 0.3)';
          setTimeout(function() {
            tarjeta.style.boxShadow = '';
          }, 2000);
        }
      });
    }, 300);
  }
}

// INICIALIZAR SISTEMA
var gestorAlarmas;

document.addEventListener('DOMContentLoaded', function() {
  gestorAlarmas = new GestorAlarmas();
});