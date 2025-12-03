// ========== CIERRE DE SESIÓN - SISTEMA GLOBAL ==========
// Este archivo funciona en TODAS las páginas

// CLASE SISTEMA CIERRE SESION
var SistemaCierreSesion = {
  inicializar: function() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        SistemaCierreSesion.configurar();
      });
    } else {
      SistemaCierreSesion.configurar();
    }
  },

  configurar: function() {
    var btnCerrarSesion = document.querySelector('.cerrar-sesion');
    if (btnCerrarSesion) {
      btnCerrarSesion.addEventListener('click', function() {
        SistemaCierreSesion.mostrarModal();
      });
    }
  },

  mostrarModal: function() {
    var modal = document.getElementById('modalCerrarSesion');
    
    if (!modal) {
      modal = SistemaCierreSesion.crearModal();
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
  },

  crearModal: function() {
    var modal = document.createElement('div');
    modal.id = 'modalCerrarSesion';
    modal.className = 'superposicion-modal';
    modal.style.display = 'none';
    modal.innerHTML = 
      '<div class="modal-confirmar">' +
        '<h3>Cerrar Sesión</h3>' +
        '<p>¿Está seguro que desea cerrar sesión?</p>' +
        '<div class="acciones-confirmar">' +
          '<button id="btnCancelarCerrarSesion" class="btn-confirmar no">Cancelar</button>' +
          '<button id="btnConfirmarCerrarSesion" class="btn-confirmar si">Salir</button>' +
        '</div>' +
      '</div>';

    // Eventos
    modal.querySelector('#btnCancelarCerrarSesion').addEventListener('click', function() {
      SistemaCierreSesion.cerrarModal();
    });

    modal.querySelector('#btnConfirmarCerrarSesion').addEventListener('click', function() {
      SistemaCierreSesion.cerrarSesion();
    });

    // Cerrar al hacer click fuera del modal
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        SistemaCierreSesion.cerrarModal();
      }
    });

    return modal;
  },

  cerrarModal: function() {
    var modal = document.getElementById('modalCerrarSesion');
    if (modal) {
      modal.style.display = 'none';
    }
  },

  cerrarSesion: function() {
    // Obtener el contextPath dinámicamente
    var contextPath = window.location.pathname.substring(0, window.location.pathname.indexOf('/', 1));
    
    // Limpiar localStorage si es necesario
    // localStorage.clear(); // Descomentar si quieres limpiar datos
    
    // Redirigir al login
    window.location.href = contextPath + '/login.jsp';
  }
};

// Inicializar automáticamente
SistemaCierreSesion.inicializar();