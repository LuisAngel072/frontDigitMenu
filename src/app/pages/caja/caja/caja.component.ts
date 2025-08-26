import { Component } from '@angular/core';
import { PedidosService } from '../../../services/pedidos.service';
import {
  EstadoPedido,
  EstadoPedidoHasProductos,
  Pedidos,
  Producto_extras_ingrSel,
} from '../../../types';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-caja',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './caja.component.html',
    styleUrl: './caja.component.css'
})
export class CajaComponent {
  constructor(private readonly pedidosService: PedidosService) {}
  pedidosAgrupados: {
    pedidoId: Pedidos;
    productos: Producto_extras_ingrSel[];
  }[] = [];

  ngOnInit(): void {
    this.cargarPedidos();
  }
  /**
   * Obtiene todos los pedidos con sus productos relacionados
   */
  async cargarPedidos() {
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
        }));

        // 4) Filtrar OUT aquellos pedidos cuyos productos
        //    **todos** estén en estado distinto de "Entregado"
        lista = lista.filter((entry) =>
          entry.productos.some((p) => p.estado === 'Entregado')
        );

        // 6) Asignar al componente
        this.pedidosAgrupados = lista;
      },
      error: (error) => {
        console.error('Error cargando pedidos:', error);
      },
    });
  }
  /**
   * Esta función se encarga de mostrar los datos del pedido a cobrar, buscando
   * el pedido de entre el arreglo de this.pedidosAgrupados. Mapea los productos del pedido
   * y los convierte en una tabla. Mediante una promesa, mapea sobre todos los productos para
   * cambiar su estado a "Pagado", asi como el del mismo pedido
   * @param pedido_id Pedido con el cual se va a trabajar el cobro
   */
  async cobrarPedido(pedido_id: number) {
    try {
      const pedido:
        | {
            pedidoId: Pedidos;
            productos: Producto_extras_ingrSel[];
          }
        | undefined = this.pedidosAgrupados.find(
        (p) => p.pedidoId.id_pedido === pedido_id
      );

      if (pedido) {
        const productos = pedido.productos.map((pr) => {
          return `
        <tr>
          <td>${pr.producto_id.nombre_prod}</td>
          <td>${pr.opcion_id.nombre_opcion} %${pr.opcion_id.porcentaje}</td>
          <td><ul>${pr.extras.map((ext) => {
            return `<li>${ext.nombre_extra} $${ext.precio}</li>`;
          })}</ul>
          </td>
          <td><ul>${pr.ingredientes.map((ingr) => {
            return `<li>${ingr.nombre_ingrediente} $${ingr.precio}</li>`;
          })}</ul>
          </td>
          <td>$${pr.precio}</td>
        </tr>`;
        });

        Swal.fire({
          title: `Cobrar pedido ${pedido.pedidoId.id_pedido}`,
          width: '80%',
          html: `
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Opción</th>
              <th>Extras</th>
              <th>Ingredientes</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            ${productos}
          </tbody>
        </table>

        <p><strong>Total:</strong> ${pedido.pedidoId.total}</p>
        `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: '¡Cobrar!',
          cancelButtonText: 'Cancelar',
          customClass: {
            confirmButton: 'btn btn-prim',
            cancelButton: 'btn btn-peligro',
          },
        }).then(async (result) => {
          if (result.isConfirmed) {
            const confirmacion = await Swal.fire({
              title: '¿Estás seguro de cobrar este pedido?',
              showDenyButton: true,
              confirmButtonText: '¡Cobrar!',
              customClass: {
                confirmButton: 'btn btn-terc',
                denyButton: 'btn btn-peligro',
              },
              denyButtonText: 'Cancelar',
              icon: 'warning',
            });
            if (confirmacion.isConfirmed) {
              Swal.fire({
                title: 'Cargando...',
                html: 'Por favor, espere mientras se procesa la información.',
                allowOutsideClick: false, // Evita que se pueda cerrar
                allowEscapeKey: false, // Evita que se cierre con la tecla Escape
                allowEnterKey: false, // Evita que se cierre con Enter
                didOpen: () => {
                  Swal.showLoading(); // Muestra el spinner de carga
                },
              });

              await Promise.all(
                pedido.productos.map((pr) =>
                  this.pedidosService.cambiarEstadoDeProducto(
                    pr.pedido_prod_id,
                    EstadoPedidoHasProductos.pagado
                  )
                )
              );

              await this.pedidosService.actualizarEstadoPedido(
                pedido.pedidoId.id_pedido,
                EstadoPedido.pagado
              );
              Swal.close();
              Swal.fire({
                title: '¡Pedido cobrado!',
                text: `El pedido ${pedido.pedidoId.id_pedido} ha sido cobrado`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
              });
            }
          }
        });
      }
    } catch (error) {
      Swal.close();
      console.error('Error al cobrar pedido:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un al intentar cobrar el pedido',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }
}
