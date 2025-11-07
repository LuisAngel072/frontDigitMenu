import { Component, OnDestroy, OnInit } from '@angular/core';
import { PedidosService } from '../../../services/pedidos.service';
import {
  EstadoPedido,
  EstadoPedidoHasProductos,
  PedidoAgrupado,
  Pedidos,
  Producto_extras_ingrSel,
} from '../../../interfaces/types';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { firstValueFrom, Subscription } from 'rxjs';
import { PedidosSocketService } from '../../../gateways/pedidos-gateway.service';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './caja.component.html',
  styleUrl: './caja.component.css',
})
export class CajaComponent implements OnInit, OnDestroy {
  constructor(
    private readonly pedidosService: PedidosService,
    private readonly cajaGatewayService: PedidosSocketService
  ) {}

  pedidosAgrupados: PedidoAgrupado[] = [];
  isLoading = true;

  private rol = 'caja';

  private estadoActualizadoSub: Subscription | undefined;

  ngOnInit(): void {
    this.cargarPedidosIniciales();
    this.escucharActualizacionesEnVivo();
    console.log(this.pedidosAgrupados);
  }
  ngOnDestroy(): void {
    // Limpiar la suscripción para evitar fugas de memoria
    this.estadoActualizadoSub?.unsubscribe();
  }

  /**
   * Obtiene todos los pedidos con sus productos relacionados
   */
  /**
   * Carga la lista inicial de pedidos para el cocinero.
   */
  async cargarPedidosIniciales(): Promise<void> {
    this.isLoading = true;
    try {
      this.pedidosAgrupados = await firstValueFrom(
        this.pedidosService.getPedidosActivosConDetalles(this.rol)
      );
      console.log('Pedidos iniciales cargados:', this.pedidosAgrupados);
    } catch (error) {
      console.error('Error al cargar pedidos iniciales:', error);
      Swal.fire('Error', 'No se pudieron cargar los pedidos.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Se suscribe a los eventos del socket.
   */
  private escucharActualizacionesEnVivo(): void {
    this.estadoActualizadoSub = this.cajaGatewayService
      .onEstadoActualizado()
      .subscribe((productoActualizado) => {
        // Lógica de Caja: Solo nos importa si el estado es 'Entregado'
        if (productoActualizado.estado === EstadoPedidoHasProductos.entregado) {
          this.agregarProductoEntregado(productoActualizado);
        }
      });
  }

  /**
   * Lógica para añadir dinámicamente productos 'Entregados' a la vista.
   */
  private agregarProductoEntregado(producto: Producto_extras_ingrSel): void {
    const pedidoId = producto.pedido_id.id_pedido;
    const productoId = producto.pedido_prod_id;

    // 1. Buscar si el pedido ya existe en la lista de Caja
    let pedidoExistente = this.pedidosAgrupados.find(
      (p) => p.pedidoId.id_pedido === pedidoId
    );

    if (pedidoExistente) {
      // 2. Si el pedido existe, buscar si el producto ya está en la lista (evitar duplicados)
      const productoExistente = pedidoExistente.productos.find(
        (p) => p.pedido_prod_id === productoId
      );
      if (!productoExistente) {
        // Añadir el producto 'Entregado' a la lista de ese pedido
        pedidoExistente.productos.push(producto);
        console.log(
          `Producto ${productoId} añadido dinámicamente al pedido ${pedidoId} en Caja.`
        );
      }
    } else {
      // 3. Si el pedido no existe (es el primer producto 'Entregado' de ese pedido)
      // Creamos un nuevo PedidoAgrupado para la vista de Caja
      const nuevoPedido: PedidoAgrupado = {
        pedidoId: producto.pedido_id, // El objeto Pedido completo viene en el producto
        productos: [producto],
        expandido: true, // Expandir por defecto para que sea visible
        tieneProductosPendientes: false, // Caja no usa esta lógica, pero la interfaz lo requiere
      };
      // Añadir el nuevo pedido al inicio de la lista
      this.pedidosAgrupados.unshift(nuevoPedido);
      console.log(`Nuevo pedido ${pedidoId} añadido dinámicamente a Caja.`);
    }
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
          }).join('')}</ul>
          </td>
          <td><ul>${pr.ingredientes.map((ingr) => {
            return `<li>${ingr.nombre_ingrediente} $${ingr.precio}</li>`;
          }).join('')}</ul>
          </td>
          <td>$${pr.precio}</td>
        </tr>`;
        }).join('');

        Swal.fire({
          title: `Cobrar pedido ${pedido.pedidoId.id_pedido}`,
          width: '70%',
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
            title: 'cocogoose-font'
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

              await firstValueFrom(
                this.pedidosService.actualizarEstadoPedido(
                  pedido.pedidoId.id_pedido,
                  EstadoPedido.pagado
                )
              );
              this.pedidosAgrupados = this.pedidosAgrupados.filter(
                (p) => p.pedidoId.id_pedido !== pedido.pedidoId.id_pedido
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

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleString(); // Formatea la fecha a una cadena legible
  }
}
