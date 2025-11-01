import { Component } from '@angular/core';
import { PedidosService } from '../../../services/pedidos.service';
import {
  PedidoAgrupado,
  Pedidos,
  Producto_extras_ingrSel,
} from '../../../interfaces/types';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css',
})
export class VentasComponent {
  constructor(private readonly pedidosService: PedidosService) {}
  pedidosAgrupados: PedidoAgrupado[] = [];

  pageSize: number = 7;
  currentPage: number = 0;

  async onPageChange(page: number) {
    this.currentPage = page;
  }

  async ngOnInit() {
    await this.cargarPedidos();
    await console.log(this.pedidosAgrupados);
  }

  async cargarPedidos() {
    this.pedidosService.getPedidosActivosConDetalles('ventas').subscribe({
      next: (data: PedidoAgrupado[]) => {

        // 1. (Opcional) Filtrar si es necesario
        // (Aunque tu backend ya parece filtrar por 'Pagado' para 'ventas')
        const listaFiltrada = data.filter((entry) =>
          entry.productos.some((p) => p.estado === 'Pagado')
        );

        // 2. (Opcional pero recomendado) Normalizar nulos DENTRO de los productos
        //    para asegurar que 'extras' e 'ingredientes' nunca sean 'null'
        listaFiltrada.forEach((pedido) => {
          pedido.productos.forEach((producto) => {
            producto.extras = producto.extras ?? [];
            producto.ingredientes = producto.ingredientes ?? [];
          });
        });

        // 3. Asignar directamente al componente
        this.pedidosAgrupados = listaFiltrada;

        console.log('Datos asignados (corregidos):', this.pedidosAgrupados);
      },
      error: (error) => {
        console.error('Error cargando pedidos:', error);
      },
    });
  }

  async verPedido(id_pedido: number) {
    try {
      const pedido: PedidoAgrupado | undefined = this.pedidosAgrupados.find(
        (p) => p.pedidoId.id_pedido === id_pedido
      );
      console.log(pedido);
      if (pedido) {
        // 1. Mapea los productos a filas HTML
        const productos = pedido.productos
          .map((pr) => {
            // 2. Genera el HTML para extras (con .join('') y chequeo de nulo)
            const extrasHtml = (pr.extras || [])
              .map((ext) => {
                return `<li>${ext.nombre_extra} $${ext.precio}</li>`;
              })
              .join('');

            // 3. Genera el HTML para ingredientes (con .join('') y chequeo de nulo)
            const ingredientesHtml = (pr.ingredientes || [])
              .map((ingr) => {
                return `<li>${ingr.nombre_ingrediente} $${ingr.precio}</li>`;
              })
              .join('');

            return `
              <tr>
                <td>${pr.producto_id.nombre_prod}</td>
                <td>${pr.opcion_id.nombre_opcion} %${
              pr.opcion_id.porcentaje
            }</td>
                <td><ul>${extrasHtml || 'N/A'}</ul></td>
                <td><ul>${ingredientesHtml || 'N/A'}</ul></td>
                <td>$${pr.precio}</td>
              </tr>`;
          })
          .join('');

        // 4. Define los estilos CSS para la tabla dentro del modal
        const modalStyles = `
          <style>
            .swal-table {
              width: 100%; /* <-- SOLUCIÓN AL ANCHO */
              border-collapse: collapse;
              margin-top: 15px;
            }
            .swal-table th, .swal-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .swal-table th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .swal-table ul {
              padding-left: 20px;
              margin: 0;
            }
            .swal-total {
              font-weight: bold;
              font-size: 1.1rem;
              text-align: right;
              margin-top: 15px;
            }
          </style>
        `;

        Swal.fire({
          title: `Pedido ${pedido.pedidoId.id_pedido}`,
          width: '60%',
          html: `
              ${modalStyles} <table class="swal-table"> <thead>
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
              <p class="swal-total"><strong>Total:</strong> ${pedido.pedidoId.total}</p>
              `,
          focusConfirm: false,
          showCancelButton: false,
          confirmButtonText: 'Aceptar',
          customClass: {
            confirmButton: 'btn btn-prim',
            title: 'cocogoose-font',
          },
        });
      }
    } catch (error) {
      Swal.close();
      console.error('Error al ver el pedido:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al intentar ver el pedido',
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
