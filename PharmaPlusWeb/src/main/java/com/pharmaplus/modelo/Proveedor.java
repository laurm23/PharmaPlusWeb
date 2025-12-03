package com.pharmaplus.modelo;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase que representa un proveedor
 */
public class Proveedor implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private String nombreProveedor;
    private String nit;
    private String ciudad;
    private String pais;
    private String direccion;
    private String fechaFinContrato;
    private String estadoProveedor;
    private String nombreContacto;
    private String tipoDocumento;
    private String numeroIdentificacion;
    private String telefono;
    private String correo;
    private String notas;
    private List<Long> productosIds;
    
    // Campo para JSP que llaman getTipoProductos()
    private String tipoProductos;
    
    // NUEVO: Campo para cantidad de productos asociados
    private int totalProductos;
    
    public Proveedor() {
        this.id = System.currentTimeMillis() + (long)(Math.random() * 1000);
        this.productosIds = new ArrayList<>();
        this.estadoProveedor = "activo";
        this.totalProductos = 0;
    }
    
    private String capitalizar(String texto) {
        if (texto == null || texto.isEmpty()) return texto;
        return texto.substring(0, 1).toUpperCase() + texto.substring(1).toLowerCase();
    }
    
    /**
     * Agrega un producto a la lista de IDs
     */
    public void agregarProducto(Long productoId) {
        if (!this.productosIds.contains(productoId)) {
            this.productosIds.add(productoId);
            this.totalProductos = this.productosIds.size();
        }
    }
    
    /**
     * Elimina un producto de la lista de IDs
     */
    public void eliminarProducto(Long productoId) {
        this.productosIds.remove(productoId);
        this.totalProductos = this.productosIds.size();
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNombreProveedor() { return nombreProveedor; }
    public void setNombreProveedor(String nombreProveedor) { 
        this.nombreProveedor = capitalizar(nombreProveedor); 
    }
    
    public String getNit() { return nit; }
    public void setNit(String nit) { this.nit = nit; }
    
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { 
        this.ciudad = capitalizar(ciudad); 
    }
    
    public String getPais() { return pais; }
    public void setPais(String pais) { 
        this.pais = capitalizar(pais); 
    }
    
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    
    public String getFechaFinContrato() { return fechaFinContrato; }
    public void setFechaFinContrato(String fechaFinContrato) { 
        this.fechaFinContrato = fechaFinContrato; 
    }
    
    public String getEstadoProveedor() { return estadoProveedor; }
    public void setEstadoProveedor(String estadoProveedor) { 
        this.estadoProveedor = estadoProveedor; 
    }
    
    public String getNombreContacto() { return nombreContacto; }
    public void setNombreContacto(String nombreContacto) { 
        this.nombreContacto = capitalizar(nombreContacto); 
    }
    
    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { 
        this.tipoDocumento = tipoDocumento; 
    }
    
    public String getNumeroIdentificacion() { return numeroIdentificacion; }
    public void setNumeroIdentificacion(String numeroIdentificacion) { 
        this.numeroIdentificacion = numeroIdentificacion; 
    }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    
    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }
    
    public List<Long> getProductosIds() { return productosIds; }
    public void setProductosIds(List<Long> productosIds) { 
        this.productosIds = productosIds;
        this.totalProductos = productosIds != null ? productosIds.size() : 0;
    }
    
    public String getTipoProductos() {
        return tipoProductos;
    }
    
    public void setTipoProductos(String tipoProductos) {
        this.tipoProductos = tipoProductos;
    }
    
    // NUEVO: Getter y Setter para totalProductos
    public int getTotalProductos() {
        return totalProductos;
    }
    
    public void setTotalProductos(int totalProductos) {
        this.totalProductos = totalProductos;
    }
    
    @Override
    public String toString() {
        return "Proveedor{" +
                "id=" + id +
                ", nombreProveedor='" + nombreProveedor + '\'' +
                ", nit='" + nit + '\'' +
                ", correo='" + correo + '\'' +
                ", totalProductos=" + totalProductos +
                '}';
    }
}