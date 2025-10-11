import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import {
  EstadoPedidoHasProductos,
  PedidoAgrupado,
  Pedidos,
  Producto_extras_ingrSel,
} from '../../interfaces/types';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../comun-componentes/header/header.component';
import { CocinaSocketService } from '../../gateways/cocina-gateway.service';

@Component({
  selector: 'app-cocinero',
  standalone: true,
  templateUrl: './cocinero.component.html',
  styleUrls: ['./cocinero.component.css'],
  imports: [CommonModule, HeaderComponent],
})
export class CocineroComponent implements OnInit {
  pedidosAgrupados: PedidoAgrupado[] = [];

  constructor(
    private pedidosService: PedidosService,
    private cocinaSocket: CocinaSocketService
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();

    this.cocinaSocket.onNuevoPedido().subscribe(async (pedido) => {
      const detalles = await this.pedidosService.getProductosExtrasIngrSel(
        pedido.pedido_id
      );

      this.procesarPedidos(Array.isArray(detalles) ? detalles : [detalles]);
    });

    this.cocinaSocket.onPedidoActualizado().subscribe(async (pedido) => {
      const detalles = await this.pedidosService.getProductosExtrasIngrSel(
        pedido.pedido_id
      );

      this.procesarPedidos(Array.isArray(detalles) ? detalles : [detalles]);
    });
  }

  private procesarPedidos(data: Producto_extras_ingrSel[]): void {
    const normalizado = data.map((p) => ({
      ...p,
      extras: p.extras ?? [],
      ingredientes: p.ingredientes ?? [],
      estado: p.estado ?? 'Sin preparar',
    }));
    console.log(normalizado);
    console.log;

    const agrupados: { [id: number]: Producto_extras_ingrSel[] } = {};
    normalizado.forEach((detalle) => {
      const id = detalle.pedido_id.id_pedido;
      if (!agrupados[id]) agrupados[id] = [];
      agrupados[id].push(detalle);
    });

    let lista = Object.entries(agrupados).map(([_, productos]) => {
      const tieneProductosPendientes = productos.some(
        (p) => p.estado === 'Sin preparar' || p.estado === 'Preparado'
      );

      return {
        pedidoId: productos[0].pedido_id,
        productos,
        expandido: true,
        tieneProductosPendientes,
      };
    });

    lista = lista.filter((entry) => entry.tieneProductosPendientes);

    lista.sort(
      (a, b) =>
        new Date(b.pedidoId.fecha_pedido).getTime() -
        new Date(a.pedidoId.fecha_pedido).getTime()
    );

    this.pedidosAgrupados = lista;
  }

  cargarPedidos(): void {
    console.log('Cargando pedidos...');
    this.pedidosService
      .getPedidosActivosConDetalles('cocinero')
      .subscribe((pedidos: PedidoAgrupado[]) => {
        this.pedidosAgrupados = pedidos;
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
    const pedido = this.pedidosAgrupados.find(
      (p) => p.pedidoId.id_pedido === pedido_id
    );

    if (!pedido) {
      return;
    }

    // Filtrar solo los productos que están "Sin preparar"
    const productosSinPreparar = pedido.productos.filter(
      (p) => p.estado === 'Sin preparar'
    );

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
        precioProducto += producto.extras.reduce(
          (sum, extra) => sum + extra.precio,
          0
        );
      }

      // Sumar ingredientes adicionales
      if (producto.ingredientes && producto.ingredientes.length > 0) {
        precioProducto += producto.ingredientes.reduce(
          (sum, ing) => sum + ing.precio,
          0
        );
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
    return productos.reduce(
      (contador, producto) => {
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
      },
      { sinPreparar: 0, preparados: 0, entregados: 0, pagados: 0 }
    );
  }

  // Método para refrescar datos
  refrescarDatos(): void {
    this.cargarPedidos();
  }
}
