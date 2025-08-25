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
    templateUrl: './cocinero.component.html',
    styleUrls: ['./cocinero.component.css'],
    imports: [CommonModule, HeaderComponent]
})
export class CocineroComponent implements OnInit {
  pedidosAgrupados: {
    pedidoId: Pedidos;
    productos: Producto_extras_ingrSel[];
    expandido: boolean;
  }[] = [];

  constructor(private pedidosService: PedidosService) {}

  ngOnInit(): void {
    this.pedidosService.getPedidosConProductosDetalles().subscribe({
      next: (data) => {
        // 1) Normalizar
        const normalizado = data.map((p) => ({
          ...p,
          extras: p.extras ?? [],
          ingredientes: p.ingredientes ?? [],
        }));

        // 2) Agrupar por pedido
        const agrupados: { [id: number]: Producto_extras_ingrSel[] } = {};
        normalizado.forEach((detalle) => {
          const id = detalle.pedido_id.id_pedido;
          if (!agrupados[id]) agrupados[id] = [];
          agrupados[id].push(detalle);
        });

        // 3) Armar array intermedio de “orders” con sus items
        let lista = Object.entries(agrupados).map(([_, productos]) => ({
          pedidoId: productos[0].pedido_id,
          productos,
          expandido: true,
        }));

        // 4) Filtrar OUT aquellos pedidos cuyos productos
        //    **todos** estén en estado distinto de "Sin preparar"
        lista = lista.filter((entry) =>
          entry.productos.some((p) => p.estado === 'Sin preparar')
        );

        // 5) Asignar al componente
        this.pedidosAgrupados = lista;
      },
      error: (error) => {
        console.error('Error cargando pedidos:', error);
      },
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

  async marcarPedidoComoElaborado(pedido_id: number) {
    try {
      const { isConfirmed } = await Swal.fire({
        title: '¿Marcar como elaborado?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, marcar',
        cancelButtonText: 'Cancelar',
      });
      if (isConfirmed) {
        Swal.fire({
          title: 'Cargando...',
          html: 'Por favor, espere mientras se procesan los cambios.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
          didOpen: () => Swal.showLoading(),
        });

        const pedido:
          | {
              pedidoId: Pedidos;
              productos: Producto_extras_ingrSel[];
            }
          | undefined = this.pedidosAgrupados.find(
          (p) => p.pedidoId.id_pedido === pedido_id
        );
        if (pedido) {
          // Lanza todas las promesas en paralelo
          await Promise.all(
            pedido.productos.map((item) =>
              this.pedidosService.cambiarEstadoDeProducto(
                item.pedido_prod_id,
                EstadoPedidoHasProductos.preparado
              )
            )
          );
          // Puedes integrar aquí una petición HTTP si necesitas hacerlo en backend
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: 'Pedido elaborado',
            text: `El pedido #${pedido.pedidoId.id_pedido} ha sido marcado como elaborado.`,
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else return
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al marcar pedidos como elaborados, prueba tu conexión`,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }
}
