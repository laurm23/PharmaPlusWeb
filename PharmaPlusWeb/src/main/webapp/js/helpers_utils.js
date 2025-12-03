// HELPERS.JS - Funciones auxiliares reutilizables

// Calcular tiempo transcurrido
function calcularTiempoTranscurrido(timestamp) {
  const ahora = Date.now();
  const diferencia = ahora - timestamp;
  
  const minutos = Math.floor(diferencia / 60000);
  const horas = Math.floor(diferencia / 3600000);
  const dias = Math.floor(diferencia / 86400000);
  
  if (minutos < 60) return minutos <= 1 ? 'Hace 1 minuto' : `Hace ${minutos} minutos`;
  if (horas < 24) return horas === 1 ? 'Hace 1 hora' : `Hace ${horas} horas`;
  return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`;
}

// Validar formulario
function validarFormulario(formId) {
  const form = document.getElementById(formId);
  let valido = true;
  
  limpiarErrores(form);
  
  const camposRequeridos = form.querySelectorAll('[data-required]');
  
  camposRequeridos.forEach(label => {
    const input = label.nextElementSibling;
    if (!input) return;
    
    // Validar envoltorio de concentración
    if (input.classList && input.classList.contains('envoltorio-concentracion')) {
      const cantidad = input.querySelector('#concentracionCantidad');
      const unidad = input.querySelector('#concentracionUnidad');
      
      if (!cantidad.value || !unidad.value) {
        label.classList.add('etiqueta-error');
        cantidad.classList.add('error');
        unidad.classList.add('error');
        valido = false;
      }
    } else {
      // Validación normal
      if (!input.value || input.value.trim() === '') {
        label.classList.add('etiqueta-error');
        input.classList.add('error');
        valido = false;
      }
    }
  });
  
  return valido;
}

// Limpiar errores de formulario
function limpiarErrores(form) {
  form.querySelectorAll('.etiqueta-error').forEach(el => {
    el.classList.remove('etiqueta-error');
  });
  form.querySelectorAll('.error').forEach(el => {
    el.classList.remove('error');
  });
}

// Llenar formulario con datos
function llenarFormulario(form, data) {
  Object.keys(data).forEach(key => {
    const input = document.getElementById(key);
    if (input) {
      input.value = data[key];
    }
  });
}

// Configurar capitalización automática
function configurarCapitalizacion(camposIds) {
  camposIds.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('blur', (e) => {
        const texto = e.target.value;
        if (texto) {
          e.target.value = capitalizar(texto);
        }
      });
    }
  });
}

// Configurar eventos hover en celda de acciones (para tablas)
function configurarEventosCelda(celdaMas) {
  celdaMas.addEventListener('mouseenter', () => {
    celdaMas.classList.add('mostrar-acciones');
  });
  
  celdaMas.addEventListener('mouseleave', () => {
    celdaMas.classList.remove('mostrar-acciones');
  });
}

// Mostrar modal de confirmación genérico
function mostrarConfirmacion(titulo, mensaje, onConfirmar, onCancelar = null) {
  const modal = document.getElementById('modalConfirmar');
  document.getElementById('tituloConfirmar').textContent = titulo;
  document.getElementById('mensajeConfirmar').textContent = mensaje;
  modal.style.display = 'flex';
  
  const btnSi = document.getElementById('btnConfirmarSi');
  const btnNo = document.getElementById('btnConfirmarNo');
  
  // Clonar botones para eliminar eventos anteriores
  const nuevoSi = btnSi.cloneNode(true);
  const nuevoNo = btnNo.cloneNode(true);
  btnSi.parentNode.replaceChild(nuevoSi, btnSi);
  btnNo.parentNode.replaceChild(nuevoNo, btnNo);
  
  // Agregar nuevos eventos
  nuevoSi.addEventListener('click', () => {
    onConfirmar();
    cerrarModal('modalConfirmar');
  });
  
  nuevoNo.addEventListener('click', () => {
    if (onCancelar) {
      onCancelar();
    } else {
      cerrarModal('modalConfirmar');
    }
  });
}

// Cerrar modal
function cerrarModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Eliminar alarmas asociadas a un producto
function eliminarAlarmasProducto(productoId) {
  const alarmasGuardadas = localStorage.getItem('alarmas');
  if (alarmasGuardadas) {
    let alarmas = JSON.parse(alarmasGuardadas);
    alarmas = alarmas.filter(a => a.productoId !== productoId);
    localStorage.setItem('alarmas', JSON.stringify(alarmas));
  }
}

// Eliminar alarmas asociadas a un proveedor
function eliminarAlarmasProveedor(proveedorId) {
  const alarmasGuardadas = localStorage.getItem('alarmas');
  if (alarmasGuardadas) {
    let alarmas = JSON.parse(alarmasGuardadas);
    alarmas = alarmas.filter(a => a.proveedorId !== proveedorId);
    localStorage.setItem('alarmas', JSON.stringify(alarmas));
  }
}