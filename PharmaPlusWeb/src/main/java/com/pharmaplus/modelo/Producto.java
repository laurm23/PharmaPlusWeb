package com.pharmaplus.modelo;

import java.io.Serializable;

/**
 * Clase que representa un producto
 * Implementa Serializable para poder guardarlo en la sesión
 */
public class Producto implements Serializable {
    private static final long serialVersionUID = 1L;
    
    // Atributos del producto
    private Long id;
    private String nombreProducto;
    private String concentracionCantidad;
    private String concentracionUnidad;
    private String categoria;
    private String codigo;
    private String numeroLote;
    private Long proveedorId; // FK a tabla proveedores - NUEVO
    private String proveedor; // Nombre del proveedor (para mostrar)
    private String laboratorio;
    private int stock;
    private int stockInicial;
    private String ubicacion;
    private double precio;
    private String fechaRegistro;
    private String fechaVencimiento;
    private long fechaCreacion; // Timestamp de creación
    
    // Constructor vacío (requerido para JSP)
    public Producto() {
        this.id = System.currentTimeMillis() + (long)(Math.random() * 1000);
        this.fechaCreacion = System.currentTimeMillis();
    }
    
    // Constructor con parámetros
    public Producto(String nombreProducto, String concentracionCantidad, 
                   String concentracionUnidad, String categoria, String numeroLote) {
        this();
        this.nombreProducto = capitalizar(nombreProducto);
        this.concentracionCantidad = concentracionCantidad;
        this.concentracionUnidad = concentracionUnidad;
        this.categoria = capitalizar(categoria);
        this.numeroLote = numeroLote;
    }
    
    // Método auxiliar para capitalizar texto
    private String capitalizar(String texto) {
        if (texto == null || texto.isEmpty()) return texto;
        return texto.substring(0, 1).toUpperCase() + texto.substring(1).toLowerCase();
    }
    
    // Método para obtener el nombre completo del producto
    public String obtenerNombreCompleto() {
        return nombreProducto + " " + concentracionCantidad + concentracionUnidad;
    }
    
    // Método para calcular el estado del stock
    public String obtenerEstado() {
        if (stockInicial == 0) return "bajo";
        double porcentaje = (double) stock / stockInicial;
        if (porcentaje > 0.66) return "alto";
        if (porcentaje > 0.33) return "medio";
        return "bajo";
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { 
        this.nombreProducto = capitalizar(nombreProducto); 
    }
    
    public String getConcentracionCantidad() { return concentracionCantidad; }
    public void setConcentracionCantidad(String concentracionCantidad) { 
        this.concentracionCantidad = concentracionCantidad; 
    }
    
    public String getConcentracionUnidad() { return concentracionUnidad; }
    public void setConcentracionUnidad(String concentracionUnidad) { 
        this.concentracionUnidad = concentracionUnidad; 
    }
    
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { 
        this.categoria = capitalizar(categoria); 
    }
    
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    
    public String getNumeroLote() { return numeroLote; }
    public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }
    
    // NUEVO: Getter y Setter para proveedorId
    public Long getProveedorId() { return proveedorId; }
    public void setProveedorId(Long proveedorId) { this.proveedorId = proveedorId; }
    
    public String getProveedor() { return proveedor; }
    public void setProveedor(String proveedor) { 
        this.proveedor = capitalizar(proveedor); 
    }
    
    public String getLaboratorio() { return laboratorio; }
    public void setLaboratorio(String laboratorio) { 
        this.laboratorio = capitalizar(laboratorio); 
    }
    
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    
    public int getStockInicial() { return stockInicial; }
    public void setStockInicial(int stockInicial) { this.stockInicial = stockInicial; }
    
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    
    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }
    
    public String getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(String fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    
    public String getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(String fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    
    public long getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(long fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    @Override
    public String toString() {
        return "Producto{" +
                "id=" + id +
                ", nombreProducto='" + nombreProducto + '\'' +
                ", stock=" + stock +
                ", proveedor='" + proveedor + '\'' +
                '}';
    }
}