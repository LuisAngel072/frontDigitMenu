import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { EstadoPedidoHasProductos, Producto_extras_ingrSel } from '../../types';
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
    pedidoId: any,
    productos: Producto_extras_ingrSel[],
    expandido: boolean
  }[] = [];

  constructor(private pedidosService: PedidosService) {}

  ngOnInit(): void {
    this.pedidosService.getPedidosConProductosDetalles().subscribe({
      next: (data) => {
        const normalizado = data.map(p => ({
          ...p,
          extras: p.extras ?? [],
          ingredientes: p.ingredientes ?? []
        }));

        const agrupados: { [id: number]: Producto_extras_ingrSel[] } = {};
        normalizado.forEach(detalle => {
          const id = detalle.pedido_id.id_pedido;
          if (!agrupados[id]) agrupados[id] = [];
          agrupados[id].push(detalle);
        });

        this.pedidosAgrupados = Object.entries(agrupados).map(([id, productos]) => ({
          pedidoId: productos[0].pedido_id,
          productos,
          expandido: true
        }));
      },
      error: (error) => {
        console.error('Error cargando pedidos:', error);
      }
    });
  }

  toggleExpand(pedido: any): void {
    pedido.expandido = !pedido.expandido;
  }

  async marcarComoElaborado(pedidoProdId: number): Promise<void> {
  const { isConfirmed } = await Swal.fire({
    title: '¿Marcar como elaborado?',
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
      title: 'Cargando...',
      html: 'Por favor, espere mientras se procesa la información.',
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
      '¡Marcado!',
      'El producto fue marcado como preparado.',
      'success'
    );

    // Recarga la lista
    await this.ngOnInit();
  } catch (error) {
    Swal.close();
    Swal.fire('Error', 'No se pudo cambiar el estado.', 'error');
  }
}


  marcarPedidoComoElaborado(pedido: any): void {
    // Lógica para marcar todos los productos del pedido como elaborados
    for (let producto of pedido.productos) {
      producto.estado = 'Preparado';
    }

    // Puedes integrar aquí una petición HTTP si necesitas hacerlo en backend

    Swal.fire({
      icon: 'success',
      title: 'Pedido elaborado',
      text: `El pedido #${pedido.pedidoId.id_pedido} ha sido marcado como elaborado.`,
      timer: 2000,
      showConfirmButton: false
    });
  }
}
