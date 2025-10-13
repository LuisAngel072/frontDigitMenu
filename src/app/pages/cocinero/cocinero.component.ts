import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import {
  EstadoPedidoHasProductos,
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
  imports: [CommonModule, HeaderComponent]
})
export class CocineroComponent implements OnInit {
  pedidosAgrupados: {
    pedidoId: Pedidos;
    productos: Producto_extras_ingrSel[];
    expandido: boolean;
    tieneProductosPendientes: boolean;
  }[] = [];

  // --- Propiedades para el carrusel ---
  public currentIndex = 0;
  public readonly itemsPorPagina = 3;

  constructor(private pedidosService: PedidosService, private cocinaSocket: CocinaSocketService) {}

  ngOnInit(): void {
    this.cargarPedidos();

    this.cocinaSocket.onNuevoPedido().subscribe(async (pedido) => {
      const detalles = await this.pedidosService.getProductosExtrasIngrSel(pedido.pedido_id);
      this.procesarNuevosDatos(Array.isArray(detalles) ? detalles : [detalles]);
    });

    this.cocinaSocket.onPedidoActualizado().subscribe(async (pedido) => {
        this.cargarPedidos(); // Recarga completa para reflejar cualquier cambio
    });
  }

  private procesarNuevosDatos(data: Producto_extras_ingrSel[]): void {
      // Esta función procesa los datos y los añade o actualiza en la lista existente
      // sin recargar toda la lista, para una experiencia más fluida.
      const normalizado = data.map((p) => ({
        ...p,
        extras: p.extras ?? [],
        ingredientes: p.ingredientes ?? [],
        estado: p.estado ?? 'Sin preparar',
      }));

      const agrupados: { [id: number]: Producto_extras_ingrSel[] } = {};
      normalizado.forEach((detalle) => {
        const id = detalle.pedido_id.id_pedido;
        if (!agrupados[id]) agrupados[id] = [];
        agrupados[id].push(detalle);
      });

      Object.values(agrupados).forEach(productos => {
          const pedidoExistenteIndex = this.pedidosAgrupados.findIndex(p => p.pedidoId.id_pedido === productos[0].pedido_id.id_pedido);
          const tieneProductosPendientes = productos.some(p => p.estado === 'Sin preparar' || p.estado === 'Preparado');

          if (!tieneProductosPendientes) {
              if (pedidoExistenteIndex > -1) {
                  this.pedidosAgrupados.splice(pedidoExistenteIndex, 1);
              }
              return;
          }

          const nuevoPedidoAgrupado = {
            pedidoId: productos[0].pedido_id,
            productos,
            expandido: true,
            tieneProductosPendientes,
          };

          if (pedidoExistenteIndex > -1) {
              this.pedidosAgrupados[pedidoExistenteIndex] = nuevoPedidoAgrupado;
          } else {
              this.pedidosAgrupados.push(nuevoPedidoAgrupado);
          }
      });
      
      this.ordenarPedidos();
  }

  cargarPedidos(): void {
    this.pedidosService.getPedidosConProductosDetalles().subscribe({
      next: (data) => {
        const normalizado = data.map((p) => ({
          ...p,
          extras: p.extras ?? [],
          ingredientes: p.ingredientes ?? [],
          estado: p.estado ?? 'Sin preparar'
        }));

        const agrupados: { [id: number]: Producto_extras_ingrSel[] } = {};
        normalizado.forEach((detalle) => {
          const id = detalle.pedido_id.id_pedido;
          if (!agrupados[id]) agrupados[id] = [];
          agrupados[id].push(detalle);
        });

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

        this.pedidosAgrupados = lista.filter(entry => entry.tieneProductosPendientes);
        this.ordenarPedidos();
      },
      error: (error) => {
        console.error('Error cargando pedidos:', error);
        Swal.fire('Error', 'No se pudieron cargar los pedidos', 'error');
      },
    });
  }
  
  private ordenarPedidos(): void {
      this.pedidosAgrupados.sort(
        (a, b) => new Date(a.pedidoId.fecha_pedido).getTime() - new Date(b.pedidoId.fecha_pedido).getTime()
      );
  }

  // --- Métodos para el carrusel ---
  siguiente(): void {
    if (this.currentIndex + this.itemsPorPagina < this.pedidosAgrupados.length) {
      this.currentIndex++;
    }
  }

  anterior(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
  
  // --- Métodos (toggleExpand, marcarComoElaborado, etc.) ---
  
  toggleExpand(pedido: any): void {
    pedido.expandido = !pedido.expandido;
  }

  async marcarPedidoComoElaborado(pedido_id: number): Promise<void> {
    const pedido = this.pedidosAgrupados.find(p => p.pedidoId.id_pedido === pedido_id);
    if (!pedido) return;

    const productosSinPreparar = pedido.productos.filter(p => p.estado === 'Sin preparar');
    if (productosSinPreparar.length === 0) {
      Swal.fire('Información', 'No hay productos pendientes de preparar.', 'info');
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: '¿Marcar pedido como elaborado?',
      text: `Se marcarán ${productosSinPreparar.length} productos como preparados.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar',
      cancelButtonText: 'Cancelar',
    });

    if (isConfirmed) {
      // Lógica para marcar como elaborado
      try {
        await Promise.all(
          productosSinPreparar.map(item =>
            this.pedidosService.cambiarEstadoDeProducto(
              item.pedido_prod_id,
              EstadoPedidoHasProductos.preparado
            )
          )
        );
        Swal.fire('¡Listo!', 'El pedido fue marcado como preparado.', 'success');
        this.cargarPedidos(); // Recargar para actualizar la vista
      } catch (error) {
        Swal.fire('Error', 'No se pudo actualizar el pedido.', 'error');
      }
    }
  }
}