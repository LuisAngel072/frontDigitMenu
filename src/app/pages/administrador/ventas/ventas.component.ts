import { Component } from '@angular/core';
import { PedidosService } from '../../../services/pedidos.service';
import { Pedidos, Producto_extras_ingrSel } from '../../../types';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
@Component({
    selector: 'app-ventas',
    imports: [CommonModule],
    templateUrl: './ventas.component.html',
    styleUrl: './ventas.component.css'
})
export class VentasComponent {
  constructor(private readonly pedidosService: PedidosService) {}
  pedidosAgrupados: {
    pedidoId: Pedidos;
    productos: Producto_extras_ingrSel[];
  }[] = [];
  ngOnInit() {
    this.cargarPedidos();
  }
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
          entry.productos.some((p) => p.estado === 'Pagado')
        );

        // 6) Asignar al componente
        this.pedidosAgrupados = lista;
      },
      error: (error) => {
        console.error('Error cargando pedidos:', error);
      },
    });
  }

  async verPedido(id_pedido: number) {
    try {
      const pedido:
        | {
            pedidoId: Pedidos;
            productos: Producto_extras_ingrSel[];
          }
        | undefined = this.pedidosAgrupados.find(
        (p) => p.pedidoId.id_pedido === id_pedido
      );

      if (pedido) {
        const productos = pedido.productos.map((pr) => {
          return `
              <tr>
                <td>${pr.producto_id.nombre_prod}</td>
                <td>${pr.opcion_id.nombre_opcion} %${
            pr.opcion_id.porcentaje
          }</td>
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
          title: `Ver pedido ${pedido.pedidoId.id_pedido}`,
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
          showCancelButton: false,
          confirmButtonText: 'Aceptar',
          customClass: {
            confirmButton: 'btn btn-prim',
          },
        });
      }
    } catch (error) {
      Swal.close();
      console.error('Error al ver el pedido:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un al intentar ver el pedido',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }
}
