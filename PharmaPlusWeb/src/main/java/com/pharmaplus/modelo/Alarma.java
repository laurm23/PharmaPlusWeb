package com.pharmaplus.modelo;

import java.io.Serializable;

/**
 * Clase que representa una alarma del sistema
 */
public class Alarma implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private String tipo; // "stock-agotado", "stock-bajo", "proximo-vencer", "contrato-vencer"
    private Long productoId;
    private Long proveedorId;
    private boolean leida;
    private boolean completada;
    private long fechaCreacion;
    private long fechaCompletada; // NUEVO: Timestamp cuando se completó la alarma
    
    public Alarma() {
        this.id = System.currentTimeMillis() + (long)(Math.random() * 1000);
        this.fechaCreacion = System.currentTimeMillis();
        this.leida = false;
        this.completada = false;
        this.fechaCompletada = 0; // 0 = no completada
    }
    
    /**
     * Constructor con datos
     */
    public Alarma(String tipo, Long productoId, Long proveedorId) {
        this();
        this.tipo = tipo;
        this.productoId = productoId;
        this.proveedorId = proveedorId;
    }
    
    /**
     * Marca la alarma como completada
     */
    public void completar() {
        this.completada = true;
        this.fechaCompletada = System.currentTimeMillis();
    }
    
    /**
     * Cambia el estado de leída
     */
    public void toggleLeida() {
        this.leida = !this.leida;
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    
    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }
    
    public Long getProveedorId() { return proveedorId; }
    public void setProveedorId(Long proveedorId) { this.proveedorId = proveedorId; }
    
    public boolean isLeida() { return leida; }
    public void setLeida(boolean leida) { this.leida = leida; }
    
    public boolean isCompletada() { return completada; }
    public void setCompletada(boolean completada) { 
        this.completada = completada;
        if (completada && this.fechaCompletada == 0) {
            this.fechaCompletada = System.currentTimeMillis();
        }
    }
    
    public long getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(long fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    // NUEVO: Getter y Setter para fechaCompletada
    public long getFechaCompletada() { return fechaCompletada; }
    public void setFechaCompletada(long fechaCompletada) { this.fechaCompletada = fechaCompletada; }
    
    @Override
    public String toString() {
        return "Alarma{" +
                "id=" + id +
                ", tipo='" + tipo + '\'' +
                ", productoId=" + productoId +
                ", proveedorId=" + proveedorId +
                ", leida=" + leida +
                ", completada=" + completada +
                '}';
    }
}