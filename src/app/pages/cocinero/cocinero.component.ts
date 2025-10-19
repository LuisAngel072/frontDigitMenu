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
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cocinero',
  standalone: true,
  templateUrl: './cocinero.component.html',
  styleUrls: ['./cocinero.component.css'],
  imports: [CommonModule, HeaderComponent],
})
export class CocineroComponent implements OnInit {
  pedidosAgrupados: PedidoAgrupado[] = [];
  private rol = 'cocinero';
  isLoading = true;

  // ✅ Guardar suscripciones para limpiar después
  private nuevoProductoSub: Subscription | undefined;
  private estadoActualizadoSub: Subscription | undefined;

  // --- Propiedades para el carrusel ---
  public currentIndex = 0;
  public readonly itemsPorPagina = 3;

  constructor(
    private pedidosService: PedidosService,
    private cocinaSocket: CocinaSocketService
  ) {}

  ngOnInit(): void {
    this.cargarPedidosIniciales();
    this.escucharActualizacionesEnVivo(); // Iniciar la escucha de eventos
  }

  ngOnDestroy(): void {
    this.nuevoProductoSub?.unsubscribe();
    this.estadoActualizadoSub?.unsubscribe();
    this.cocinaSocket.disconnect(); // Desconectar el socket
  }

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
   * ✅ Se suscribe a los eventos del socket para actualizaciones en tiempo real.
   */
  escucharActualizacionesEnVivo(): void {
    // --- Escuchar Nuevos Productos ---
    this.nuevoProductoSub = this.cocinaSocket.onNuevoProducto().subscribe((nuevoProducto) => {
      this.agregarOActualizarProductoEnVista(nuevoProducto);
    });

    // --- Escuchar Cambios de Estado ---
    this.estadoActualizadoSub = this.cocinaSocket.onEstadoActualizado().subscribe((productoActualizado) => {
      this.agregarOActualizarProductoEnVista(productoActualizado);
    });
  }

  /**
   * ✅ Lógica centralizada para manejar la llegada de un producto (nuevo o actualizado).
   * Añade, actualiza o elimina el producto/pedido de la vista del cocinero.
   */
  private agregarOActualizarProductoEnVista(productoData: Producto_extras_ingrSel): void {
      const pedidoIdRecibido = productoData.pedido_id.id_pedido;
      const productoIdRecibido = productoData.pedido_prod_id;

      // Buscar si el pedido ya existe en nuestra lista local
      let pedidoExistente = this.pedidosAgrupados.find(p => p.pedidoId.id_pedido === pedidoIdRecibido);

      // --- Lógica específica para el COCINERO ---
      // Si el producto NO está 'Sin preparar', no nos interesa mostrarlo.
      if (productoData.estado !== EstadoPedidoHasProductos.sin_preparar) {
          if (pedidoExistente) {
              // Si el pedido existe, eliminamos el producto de su lista
              pedidoExistente.productos = pedidoExistente.productos.filter(p => p.pedido_prod_id !== productoIdRecibido);
              // Si el pedido queda vacío, lo eliminamos de la vista general
              if (pedidoExistente.productos.length === 0) {
                  this.pedidosAgrupados = this.pedidosAgrupados.filter(p => p.pedidoId.id_pedido !== pedidoIdRecibido);
              } else {
                 // Recalcular si aún tiene pendientes (debería ser true si quedan productos)
                 pedidoExistente.tieneProductosPendientes = pedidoExistente.productos.some(p => p.estado === EstadoPedidoHasProductos.sin_preparar);
              }
          }
          // Si el producto no está 'Sin preparar' y el pedido no existía localmente, no hacemos nada.
          return; // Termina la función aquí para estados no relevantes
      }

      // --- Si el producto SÍ está 'Sin preparar' ---
      if (pedidoExistente) {
          // El pedido ya existe, buscamos si el producto específico ya está en la lista
          const productoIndex = pedidoExistente.productos.findIndex(p => p.pedido_prod_id === productoIdRecibido);
          if (productoIndex !== -1) {
              // El producto ya existe (raro, pero podría ser una actualización), lo reemplazamos
              pedidoExistente.productos[productoIndex] = productoData;
          } else {
              // El producto es nuevo para este pedido existente, lo añadimos
              pedidoExistente.productos.push(productoData);
          }
          // Aseguramos que el estado pendiente sea true
          pedidoExistente.tieneProductosPendientes = true;
      } else {
          // El pedido es completamente nuevo para nuestra vista
          const nuevoPedido: PedidoAgrupado = {
              pedidoId: productoData.pedido_id, // Usamos el objeto Pedido completo recibido
              productos: [productoData],
              expandido: true, // Mostrar expandido por defecto
              tieneProductosPendientes: true, // Es nuevo, así que tiene pendientes
          };
          // Añadimos el nuevo pedido al principio de la lista para visibilidad
          this.pedidosAgrupados.unshift(nuevoPedido);
      }
  }


  /**
   * Cambia el estado de un producto a 'Preparado'.
   */
  async marcarComoPreparado(producto: Producto_extras_ingrSel, pedido: PedidoAgrupado): Promise<void> {
    // La actualización visual ahora la manejará el evento del socket 'estadoActualizado'
    // que se recibe después de que la API confirma el cambio.
    // Solo necesitamos llamar a la API.
    try {
      await this.pedidosService.cambiarEstadoDeProducto(
        producto.pedido_prod_id,
        EstadoPedidoHasProductos.preparado
      );
      // Opcional: podrías mostrar un spinner pequeño mientras esperas la confirmación del socket.
    } catch (error) {
      console.error('Error al marcar como preparado:', error);
      Swal.fire('Error', 'No se pudo actualizar el estado del producto.', 'error');
      // No revertimos el estado aquí, esperamos la info del socket o recarga manual.
    }
  }

  // --- El resto de tus funciones auxiliares (obtenerClaseEstado, etc.) se mantienen ---
  obtenerClaseEstado(estado: EstadoPedidoHasProductos): string {
    switch (estado) {
      case EstadoPedidoHasProductos.sin_preparar: return 'estado-sin-preparar';
      case EstadoPedidoHasProductos.preparado: return 'estado-preparado';
      case EstadoPedidoHasProductos.entregado: return 'estado-entregado';
      case EstadoPedidoHasProductos.pagado: return 'estado-pagado';
      default: return 'bg-secondary';
    }
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

    Object.values(agrupados).forEach((productos) => {
      const pedidoExistenteIndex = this.pedidosAgrupados.findIndex(
        (p) => p.pedidoId.id_pedido === productos[0].pedido_id.id_pedido
      );
      const tieneProductosPendientes = productos.some(
        (p) => p.estado === 'Sin preparar' || p.estado === 'Preparado'
      );

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

  private ordenarPedidos(): void {
    this.pedidosAgrupados.sort(
      (a, b) =>
        new Date(a.pedidoId.fecha_pedido).getTime() -
        new Date(b.pedidoId.fecha_pedido).getTime()
    );
  }

  // --- Métodos para el carrusel ---
  siguiente(): void {
    if (
      this.currentIndex + this.itemsPorPagina <
      this.pedidosAgrupados.length
    ) {
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
    const pedido = this.pedidosAgrupados.find(
      (p) => p.pedidoId.id_pedido === pedido_id
    );
    if (!pedido) return;

    const productosSinPreparar = pedido.productos.filter(
      (p) => p.estado === 'Sin preparar'
    );
    if (productosSinPreparar.length === 0) {
      Swal.fire(
        'Información',
        'No hay productos pendientes de preparar.',
        'info'
      );
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
          productosSinPreparar.map((item) =>
            this.pedidosService.cambiarEstadoDeProducto(
              item.pedido_prod_id,
              EstadoPedidoHasProductos.preparado
            )
          )
        );
        Swal.fire(
          '¡Listo!',
          'El pedido fue marcado como preparado.',
          'success'
        );
      } catch (error) {
        Swal.fire('Error', 'No se pudo actualizar el pedido.', 'error');
      }
    }
  }
}
