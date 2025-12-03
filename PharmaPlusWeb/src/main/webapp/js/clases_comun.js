// CORE.JS - Clases compartidas del sistema

// Capitalizar texto (Primera letra mayúscula)
function capitalizar(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// CLASE PRODUCTO
class Producto {
  constructor(data) {
    this.id = data.id || (Date.now() * 1000 + Math.floor(Math.random() * 1000));
    this.nombreProducto = capitalizar(data.nombreProducto);
    this.concentracionCantidad = data.concentracionCantidad;
    this.concentracionUnidad = data.concentracionUnidad;
    this.categoria = capitalizar(data.categoria);
    this.codigo = data.codigo;
    this.numeroLote = data.numeroLote;
    this.proveedor = capitalizar(data.proveedor);
    this.laboratorio = capitalizar(data.laboratorio);
    this.stock = parseInt(data.stock);
    this.stockInicial = parseInt(data.stockInicial || data.stock);
    this.ubicacion = data.ubicacion;
    this.precio = parseFloat(data.precio);
    this.fechaRegistro = data.fechaRegistro;
    this.fechaVencimiento = data.fechaVencimiento;
    this.fechaCreacion = data.fechaCreacion || Date.now();
  }

  obtenerNombreCompleto() {
    return this.nombreProducto + ' ' + this.concentracionCantidad + this.concentracionUnidad;
  }

  obtenerEstado() {
    const porcentaje = this.stock / this.stockInicial;
    if (porcentaje > 0.66) return 'alto';
    if (porcentaje > 0.33) return 'medio';
    return 'bajo';
  }
}

// CLASE PROVEEDOR
class Proveedor {
  constructor(data) {
    this.id = data.id || (Date.now() * 1000 + Math.floor(Math.random() * 1000));
    this.nombreProveedor = capitalizar(data.nombreProveedor);
    this.nit = data.nit;
    this.ciudad = capitalizar(data.ciudad);
    this.pais = capitalizar(data.pais);
    this.direccion = data.direccion;
    this.fechaFinContrato = data.fechaFinContrato;
    this.estadoProveedor = data.estadoProveedor || 'activo';
    this.nombreContacto = capitalizar(data.nombreContacto);
    this.tipoDocumento = data.tipoDocumento;
    this.numeroIdentificacion = data.numeroIdentificacion;
    this.telefono = data.telefono;
    this.correo = data.correo;
    this.notas = data.notas || '';
    this.productosIds = data.productosIds || [];
  }

  agregarProducto(productoId) {
    if (!this.productosIds.includes(productoId)) {
      this.productosIds.push(productoId);
    }
  }

  eliminarProducto(productoId) {
    this.productosIds = this.productosIds.filter(id => id !== productoId);
  }
}

// CLASE ALARMA
class Alarma {
  constructor(data) {
    this.id = data.id || (Date.now() * 1000 + Math.floor(Math.random() * 1000));
    this.tipo = data.tipo;
    this.productoId = data.productoId || null;
    this.proveedorId = data.proveedorId || null;
    this.leida = data.leida || false;
    this.completada = data.completada || false;
    this.fechaCreacion = data.fechaCreacion || Date.now();
  }
}