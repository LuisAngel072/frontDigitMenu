// meseros.component.ts
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ListaPedidosComponent } from '../comun-componentes/lista-pedidos/lista-pedidos.component';
import Swal from 'sweetalert2';
import { MesasService, Mesa } from '../../services/mesas.service';
import { NotificacionesService, Notificacion } from '../../services/notificaciones.service';
import { PedidosService } from '../../services/pedidos.service';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
    selector: 'app-meseros',
    templateUrl: './meseros.component.html',
    standalone: true,
    styleUrls: ['./meseros.component.scss'],
    imports: [CommonModule, ListaPedidosComponent, QRCodeModule]
})
export class MeserosComponent implements OnInit, OnDestroy {
  @ViewChild(ListaPedidosComponent) listaPedidos!: ListaPedidosComponent;

  mesas: Mesa[] = [];
  notificaciones: Map<number, Notificacion[]> = new Map();
  isLoading = true;
  errorMessage = '';
  private intervalId: any;

  constructor(
    private mesasService: MesasService,
    private notificacionesService: NotificacionesService,
    private pedidosService: PedidosService, // Agregamos el servicio de pedidos
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarMesas();
    // Polling cada 10 segundos
    this.intervalId = setInterval(() => {
      this.cargarNotificaciones();
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  cargarMesas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.mesasService.obtenerMesas()
      .then(mesas => {
        this.mesas = mesas;
        console.log('Mesas cargadas:', mesas);
        this.cargarNotificaciones();
      })
      .catch(error => {
        console.error('Error al cargar mesas:', error);
        this.errorMessage = 'No se pudieron cargar las mesas. Por favor, intente nuevamente.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las mesas.',
        });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  async cargarNotificaciones(): Promise<void> {
    for (const mesa of this.mesas) {
      try {
        const notificaciones = await this.notificacionesService.obtenerPorMesa(mesa.no_mesa);
        console.log(`Notificaciones mesa ${mesa.no_mesa}:`, notificaciones);
        // Filtrar solo pendientes (comparación case-insensitive)
        const pendientes = notificaciones.filter(n =>
          n.estado && n.estado.toLowerCase() === 'pendiente'
        );
        this.notificaciones.set(mesa.no_mesa, pendientes);
      } catch (error) {
        console.error(`Error notificaciones mesa ${mesa.no_mesa}:`, error);
      }
    }
  }

  obtenerNotificacionesPorMesa(noMesa: number): Notificacion[] {
    return this.notificaciones.get(noMesa) || [];
  }

  tieneNotificaciones(mesa: Mesa): boolean {
    return this.obtenerNotificacionesPorMesa(mesa.no_mesa).length > 0;
  }

  async atenderNotificacion(notificacionId: number, mesaId: number): Promise<void> {
    try {
      await this.notificacionesService.atenderNotificacion(notificacionId);

      // Actualizar localmente
      const notifs = this.notificaciones.get(mesaId) || [];
      const actualizadas = notifs.filter(n => n.id_notf !== notificacionId);
      this.notificaciones.set(mesaId, actualizadas);

      Swal.fire({
        icon: 'success',
        title: 'Atendida',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al atender:', error);
      Swal.fire('Error', 'No se pudo atender la notificación', 'error');
    }
  }

  mostrarNotificaciones(mesa: Mesa): void {
    const notifs = this.obtenerNotificacionesPorMesa(mesa.no_mesa);

    if (notifs.length === 0) {
      Swal.fire('Sin notificaciones', `Mesa ${mesa.no_mesa} no tiene notificaciones`, 'info');
      return;
    }

    const html = notifs.map(n => `
      <div style="border: 1px solid #ccc; padding: 10px; margin: 5px 0;">
        <strong>${n.mensaje}</strong><br>
        <small>ID: ${n.id_notf} - Estado: ${n.estado}</small><br>
        <button onclick="window.atender${n.id_notf}()" class="btn btn-success btn-sm">Atender</button>
      </div>
    `).join('');

    // Crear funciones para botones
    notifs.forEach(n => {
      (window as any)[`atender${n.id_notf}`] = () => {
        this.atenderNotificacion(n.id_notf, mesa.no_mesa);
        Swal.close();
      };
    });

    Swal.fire({
      title: `Mesa ${mesa.no_mesa} - Notificaciones`,
      html: html,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Cerrar',
      customClass: {
        title:'cocoogose-font'
      }
    });
  }

  // MÉTODO CORREGIDO: Ver pedidos de una mesa específica
  async verPedidos(mesa: Mesa): Promise<void> {
    try {
      // Mostrar indicador de carga
      Swal.fire({
        title: 'Cargando pedidos...',
        text: 'Obteniendo pedidos de la mesa',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Buscar pedidos de la mesa usando el mismo método que usa el carrito
      this.pedidosService.getPedidosActivosConDetalles('mesero').subscribe({
        next: (data) => {
          console.log('Todos los pedidos obtenidos:', data);

          // Filtrar productos que pertenecen a la mesa seleccionada
          const productosDeMesa = data.filter(detalle =>
            detalle.pedidoId?.no_mesa?.no_mesa === mesa.no_mesa
          );

          console.log(`Productos encontrados para mesa ${mesa.no_mesa}:`, productosDeMesa);

          Swal.close();

          if (productosDeMesa.length === 0) {
            Swal.fire({
              icon: 'info',
              title: 'Sin pedidos',
              text: `No se encontraron pedidos para la mesa ${mesa.no_mesa}`,
              showConfirmButton: true
            });
            return;
          }

          // Si el componente hijo existe, pasarle los datos filtrados
          if (this.listaPedidos) {
            // Pasar tanto el número de mesa como los productos filtrados
            this.listaPedidos.cargarPedidosMesa(mesa.no_mesa, productosDeMesa);
          } else {
            // Si no existe el ViewChild, mostrar los datos en un modal
            this.mostrarPedidosEnModal(mesa, productosDeMesa);
          }
        },
        error: (error) => {
          console.error('Error cargando pedidos:', error);
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los pedidos de la mesa'
          });
        }
      });

    } catch (error) {
      console.error('Error en verPedidos:', error);
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al cargar los pedidos'
      });
    }
  }

  // Método auxiliar para mostrar pedidos en modal si no hay componente hijo
  private mostrarPedidosEnModal(mesa: Mesa, productos: any[]): void {
    const pedidosAgrupados = this.agruparProductosPorPedido(productos);

    let html = `<h4>Pedidos de Mesa ${mesa.no_mesa}</h4>`;

    Object.keys(pedidosAgrupados).forEach(pedidoId => {
      const productosDelPedido = pedidosAgrupados[pedidoId];
      const totalPedido = this.calcularTotalPedido(productosDelPedido);

      html += `
        <div class="mb-3 border p-3">
          <h5>Pedido #${pedidoId}</h5>
          <div class="row">
      `;

      productosDelPedido.forEach(producto => {
        html += `
          <div class="col-12 mb-2">
            <div class="card">
              <div class="card-body">
                <h6>${producto.producto_id?.nombre_prod || 'Producto'}</h6>
                <p><strong>Precio:</strong> $${producto.precio}</p>
                <p><strong>Estado:</strong> ${producto.estado}</p>
                ${producto.extras?.length > 0 ? `<p><strong>Extras:</strong> ${producto.extras?.map((e: any) => e.nombre_extra).join(', ')}</p>` : ''}
              </div>
            </div>
          </div>
        `;
      })

      html += `
          </div>
          <div class="text-end">
            <strong>Total del pedido: $${totalPedido.toFixed(2)}</strong>
          </div>
        </div>
      `;
    });

    Swal.fire({
      title: `Mesa ${mesa.no_mesa}`,
      html: html,
      width: '80%',
      showConfirmButton: true,
      confirmButtonText: 'Cerrar'
    });
  }

  // Método auxiliar para agrupar productos por pedido
  private agruparProductosPorPedido(productos: any[]): { [key: string]: any[] } {
    return productos.reduce((grupos, producto) => {
      const pedidoId = producto.pedido_id?.id_pedido || 'unknown';
      if (!grupos[pedidoId]) {
        grupos[pedidoId] = [];
      }
      grupos[pedidoId].push(producto);
      return grupos;
    }, {});
  }

  // Método auxiliar para calcular total de un pedido
  private calcularTotalPedido(productos: any[]): number {
    return productos.reduce((total, producto) => {
      let precio = +(producto.precio || 0);

      if (producto.extras && producto.extras.length > 0) {
        const extrasTotal = producto.extras.reduce((sum: number, extra: any) => {
          return sum + (+(extra.precio || 0));
        }, 0);
        precio += extrasTotal;
      }

      return total + precio;
    }, 0);
  }

  crearPedido(mesa: Mesa): void {
    Swal.fire({
      title: 'Crear Pedido',
      text: `¿Deseas crear un nuevo pedido para la mesa ${mesa.no_mesa}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/clientes-menu'], {
          queryParams: { mesa: mesa.no_mesa }
        });

        Swal.fire({
          title: '¡Redirigiendo!',
          text: `Creando nuevo pedido para la mesa ${mesa.no_mesa}...`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }
}
