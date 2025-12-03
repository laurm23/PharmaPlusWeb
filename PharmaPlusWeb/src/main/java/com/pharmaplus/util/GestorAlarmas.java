package com.pharmaplus.util;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpSession;

import com.pharmaplus.modelo.Alarma;
import com.pharmaplus.modelo.Producto;

/**
 * Utilidad para generar y mantener alarmas en sesión.
 * Esta versión usa los getters que están presentes en tu código:
 * - Producto.getId()
 * - Producto.getNombreProducto()
 * - Producto.getStock()
 * - Producto.getFechaVencimiento()  (String con formato ISO esperado)
 *
 * Genera tres tipos de alarmas:
 * - "stock-agotado"  -> stock == 0
 * - "stock-bajo"     -> stock <= 5
 * - "proximo-vencer" -> fecha de vencimiento en los próximos 30 días
 */
public class GestorAlarmas {

    public static void generarAlarmas(HttpSession session) {

        @SuppressWarnings("unchecked")
        List<Producto> productos = (List<Producto>) session.getAttribute("productos");
        if (productos == null || productos.isEmpty()) {
            // nada que procesar
            return;
        }

        @SuppressWarnings("unchecked")
        List<Alarma> alarmas = (List<Alarma>) session.getAttribute("alarmas");
        if (alarmas == null) {
            alarmas = new ArrayList<>();
        }

        LocalDate hoy = LocalDate.now();
        LocalDate en30Dias = hoy.plusDays(30);

        for (Producto p : productos) {
            if (p == null) continue;

            Long productoId = p.getId(); // asumido disponible
            // --- 1) Stock agotado ---
            try {
                int stock = p.getStock(); // si es primitivo, no null
                if (stock == 0) {
                    if (!existeAlarma(alarmas, productoId, "stock-agotado")) {
                        Alarma a = crearAlarmaBasica(alarmas, "stock-agotado");
                        a.setProductoId(productoId);
                        alarmas.add(a);
                    }
                    // ya agotado, no generar stock-bajo
                    continue;
                }

                // --- 2) Stock bajo (umbral simple) ---
                if (stock > 0 && stock <= 5) { // umbral fijo para simplicidad/compatibilidad
                    if (!existeAlarma(alarmas, productoId, "stock-bajo")) {
                        Alarma a = crearAlarmaBasica(alarmas, "stock-bajo");
                        a.setProductoId(productoId);
                        alarmas.add(a);
                    }
                }
            } catch (Exception ex) {
                // si algo raro con stock, seguimos con vencimiento
            }

            // --- 3) Próximo a vencer ---
            String fechaVencStr = p.getFechaVencimiento(); // en tu código usas getFechaVencimiento() (String)
            if (fechaVencStr != null && !fechaVencStr.trim().isEmpty()) {
                try {
                    LocalDate fechaVenc = LocalDate.parse(fechaVencStr);
                    if (!fechaVenc.isBefore(hoy) && ( !fechaVenc.isAfter(en30Dias) )) {
                        if (!existeAlarma(alarmas, productoId, "proximo-vencer")) {
                            Alarma a = crearAlarmaBasica(alarmas, "proximo-vencer");
                            a.setProductoId(productoId);
                            alarmas.add(a);
                        }
                    }
                } catch (Exception e) {
                    // formato no parseable: ignoramos este producto para vencimiento
                }
            }
        }

        // Guardar en sesión
        session.setAttribute("alarmas", alarmas);
    }

    // Crea una alarma básica con id único y campos iniciales.
    private static Alarma crearAlarmaBasica(List<Alarma> lista, String tipo) {
        Alarma a = new Alarma();
        a.setId(generarIdUnico(lista));
        a.setTipo(tipo);
        a.setCompletada(false);
        a.setLeida(false);
        a.setFechaCreacion(System.currentTimeMillis());
        return a;
    }

    // Evita duplicados: misma productId + mismo tipo + no completada
    private static boolean existeAlarma(List<Alarma> lista, Long productoId, String tipo) {
        if (lista == null) return false;
        for (Alarma a : lista) {
            if (a == null) continue;
            if (a.isCompletada()) continue;
            Long pid = a.getProductoId();
            if (pid != null && productoId != null && pid.equals(productoId) && tipo.equals(a.getTipo())) {
                return true;
            }
        }
        return false;
    }

    // Generador simple de ID único (busca máximo + 1)
    private static Long generarIdUnico(List<Alarma> lista) {
        long max = 0L;
        if (lista != null) {
            for (Alarma a : lista) {
                if (a != null && a.getId() != null && a.getId() > max) {
                    max = a.getId();
                }
            }
        }
        return max + 1L;
    }
}
