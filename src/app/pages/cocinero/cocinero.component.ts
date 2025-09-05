import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import {
  EstadoPedidoHasProductos,
  Pedidos,
  Producto_extras_ingrSel,
} from '../../types';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../comun-componentes/header/header.component';

@Component({
  selector: 'app-cocinero',
  standalone: true,
  templateUrl: './cocinero.component.html',
  styleUrls: ['./cocinero.component.css'],
  imports: [CommonModule, HeaderComponent]
})
export class CocineroComponent implements OnInit {
  pedidosAgrupados: {
    pedidoId: Pedidos;
    productos: Producto_extras_ingrSel[];
    expandido: boolean;
    tieneProductosPendientes: boolean;
  }[] = [];

  constructor(private pedidosService: PedidosService) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
  this.pedidosService.getPedidosConProductosDetalles().subscribe({
    next: (data) => {
      console.log('Datos recibidos del servicio:', data);
      
      // 1) Normalizar datos
      const normalizado = data.map((p) => ({
        ...p,
        extras: p.extras ?? [],
        ingredientes: p.ingredientes ?? [],
        // ✅ Normalizar estados null a 'Sin preparar'
        estado: p.estado ?? 'Sin preparar'
      }));

      // 2) Agrupar por pedido
      const agrupados: { [id: number]: Producto_extras_ingrSel[] } = {};
      normalizado.forEach((detalle) => {
        const id = detalle.pedido_id.id_pedido;
        if (!agrupados[id]) agrupados[id] = [];
        agrupados[id].push(detalle);
      });

      // 3) Convertir a array y determinar si tienen productos pendientes
      let lista = Object.entries(agrupados).map(([_, productos]) => {
        const tieneProductosPendientes = productos.some(
          p => p.estado === 'Sin preparar' || p.estado === 'Preparado'
        );
        
        return {
          pedidoId: productos[0].pedido_id,
          productos,
          expandido: true,
          tieneProductosPendientes
        };
      });

      // 4) Filtrar solo pedidos que tengan al menos un producto pendiente
      lista = lista.filter(entry => entry.tieneProductosPendientes);

      // 5) Ordenar por fecha más reciente
      lista.sort((a, b) => 
        new Date(b.pedidoId.fecha_pedido).getTime() - 
        new Date(a.pedidoId.fecha_pedido).getTime()
      );

      // 6) Asignar al componente
      this.pedidosAgrupados = lista;
      
      console.log('Pedidos agrupados para cocina:', this.pedidosAgrupados);
    },
    error: (error) => {
      console.error('Error cargando pedidos:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los pedidos',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false,
      });
    },
  });
}

  toggleExpand(pedido: any): void {
    pedido.expandido = !pedido.expandido;
  }

  async marcarComoElaborado(pedidoProdId: number): Promise<void> {
    const { isConfirmed } = await Swal.fire({
      title: '¿Marcar como elaborado?',
      text: 'Este producto se marcará como preparado',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar',
      cancelButtonText: 'Cancelar',
    });

    if (!isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: 'Procesando...',
        html: 'Marcando producto como preparado...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: () => Swal.showLoading(),
      });

      await this.pedidosService.cambiarEstadoDeProducto(
        pedidoProdId,
        EstadoPedidoHasProductos.preparado
      );

      Swal.close();
      await Swal.fire(
        '¡Listo!',
        'El producto fue marcado como preparado.',
        'success'
      );

      // Recargar los pedidos para actualizar la vista
      this.cargarPedidos();
    } catch (error) {
      Swal.close();
      console.error('Error al cambiar estado:', error);
      Swal.fire('Error', 'No se pudo cambiar el estado del producto.', 'error');
    }
  }

  async marcarPedidoComoElaborado(pedido_id: number): Promise<void> {
    const pedido = this.pedidosAgrupados.find(p => p.pedidoId.id_pedido === pedido_id);
    
    if (!pedido) {
      return;
    }

    // Filtrar solo los productos que están "Sin preparar"
    const productosSinPreparar = pedido.productos.filter(p => p.estado === 'Sin preparar');
    
    if (productosSinPreparar.length === 0) {
      Swal.fire({
        title: 'Información',
        text: 'No hay productos pendientes de preparar en este pedido',
        icon: 'info',
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: '¿Marcar pedido como elaborado?',
      text: `Se marcarán ${productosSinPreparar.length} productos como preparados`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar todo',
      cancelButtonText: 'Cancelar',
    });

    if (!isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: 'Procesando...',
        html: 'Marcando todos los productos como preparados...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: () => Swal.showLoading(),
      });

      // Marcar solo los productos sin preparar
      await Promise.all(
        productosSinPreparar.map((item) =>
          this.pedidosService.cambiarEstadoDeProducto(
            item.pedido_prod_id,
            EstadoPedidoHasProductos.preparado
          )
        )
      );

      Swal.close();
      Swal.fire({
        icon: 'success',
        title: '¡Pedido elaborado!',
        text: `${productosSinPreparar.length} productos del pedido #${pedido.pedidoId.id_pedido} han sido marcados como preparados.`,
        timer: 3000,
        showConfirmButton: false,
      });

      // Recargar los pedidos
      this.cargarPedidos();
    } catch (error) {
      Swal.close();
      console.error('Error al marcar pedido como elaborado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al procesar el pedido. Verifica tu conexión.',
        timer: 3000,
        showConfirmButton: false,
      });
    }
  }

  // Métodos auxiliares para la vista
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Sin preparar':
        return 'bg-danger';
      case 'Preparado':
        return 'bg-warning';
      case 'Entregado':
        return 'bg-success';
      case 'Pagado':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  calcularTotalPedido(productos: Producto_extras_ingrSel[]): number {
    return productos.reduce((total, producto) => {
      let precioProducto = producto.precio;
      
      // Sumar extras
      if (producto.extras && producto.extras.length > 0) {
        precioProducto += producto.extras.reduce((sum, extra) => sum + extra.precio, 0);
      }
      
      // Sumar ingredientes adicionales
      if (producto.ingredientes && producto.ingredientes.length > 0) {
        precioProducto += producto.ingredientes.reduce((sum, ing) => sum + ing.precio, 0);
      }
      
      return total + precioProducto;
    }, 0);
  }

  contarProductosPorEstado(productos: Producto_extras_ingrSel[]): {
    sinPreparar: number;
    preparados: number;
    entregados: number;
    pagados: number;
  } {
    return productos.reduce((contador, producto) => {
      switch (producto.estado) {
        case 'Sin preparar':
          contador.sinPreparar++;
          break;
        case 'Preparado':
          contador.preparados++;
          break;
        case 'Entregado':
          contador.entregados++;
          break;
        case 'Pagado':
          contador.pagados++;
          break;
      }
      return contador;
    }, { sinPreparar: 0, preparados: 0, entregados: 0, pagados: 0 });
  }

  // Método para refrescar datos
  refrescarDatos(): void {
    this.cargarPedidos();
  }
}