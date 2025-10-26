// lista-pedidos.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { PedidosService } from '../../../services/pedidos.service';
import { NotificacionesService, Notificacion } from '../../../services/notificaciones.service';
import { MesasService, Mesa } from '../../../services/mesas.service';
import {
  EstadoPedidoHasProductos,
  PedidoAgrupado,
  Producto_extras_ingrSel,
} from '../../../interfaces/types';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

interface Order {
  id: number;
  tableNumber: number;
  estado: string;
  fecha_pedido: Date;
  items: OrderItem[];
  expanded: boolean;
}

interface OrderItem {
  pedido_prod_id: number;
  name: string;
  opcion: string;
  precio: number;
  status: 'Sin preparar' | 'Preparado' | 'Entregado' | 'Pagado';
  previousStatus?: 'Sin preparar' | 'Preparado' | 'Entregado' | 'Pagado';
  extras: any[];
  ingredientes: any[];
}

interface NavItem {
  name: string;
  icon: string;
  route: string;
}

// Interface extendida para notificaciones con información de mesa
interface NotificacionConMesa extends Notificacion {
  no_mesa?: number;
}

@Component({
  selector: 'app-lista-pedidos',
  templateUrl: './lista-pedidos.component.html',
  styleUrls: ['./lista-pedidos.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ListaPedidosComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  notificaciones: Map<number, Notificacion[]> = new Map();
  allNotifications: NotificacionConMesa[] = [];
  sidebarOpen = false;
  notificationsOpen = false;
  navOpen = false;
  unreadNotifications = 0;
  navItems: NavItem[] = [];
  estadosProductos: EstadoPedidoHasProductos[] = [
    EstadoPedidoHasProductos.sin_preparar,
    EstadoPedidoHasProductos.preparado,
    EstadoPedidoHasProductos.entregado,
    EstadoPedidoHasProductos.pagado,
  ];
  
  // Nuevas propiedades para el filtrado por mesa
  mesaSeleccionada: number | null = null;
  productosDelPedido: PedidoAgrupado[] = [];
  mostrandoSoloMesa: boolean = false;

  // Propiedad para el polling de notificaciones
  private intervalId: any;
  
  // Lista de mesas para mapear notificaciones
  mesas: Mesa[] = [];

  @Input() rol: string = 'mesero';

  public pedidosAgrupados: PedidoAgrupado[] = [];
  public isLoading = true;

  constructor(
    private pedidosService: PedidosService,
    private notificacionesService: NotificacionesService,
    private mesasService: MesasService
  ) {}

  ngOnInit(): void {
    this.cargarMesas();
    this.loadNavigation();
    this.loadIcons();
    
    // Polling cada 10 segundos para cargar notificaciones
    this.intervalId = setInterval(() => {
      this.cargarNotificaciones();
    }, 10000);
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo cuando el componente se destruya
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /**
   * Carga las mesas primero, luego carga pedidos y notificaciones
   */
  async cargarMesas(): Promise<void> {
    try {
      this.mesas = await this.mesasService.obtenerMesas();
      console.log('Mesas cargadas:', this.mesas);
      
      // Una vez cargadas las mesas, cargar pedidos y notificaciones
      this.loadOrders();
      this.cargarNotificaciones();
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      // Intentar cargar pedidos de todas formas
      this.loadOrders();
    }
  }

  loadIcons(): void {
    const iconLink = document.querySelector('link[href*="bootstrap-icons"]');
    if (!iconLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css';
      document.head.appendChild(link);
    }

    const bootstrapLink = document.querySelector('link[href*="bootstrap"]');
    if (!bootstrapLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css';
      document.head.appendChild(link);
    }
  }

  loadOrders(): void {
    this.isLoading = true;
    this.pedidosService.getPedidosActivosConDetalles(this.rol).subscribe({
      next: (pedidos) => {
        this.pedidosAgrupados = pedidos;
        console.log('Pedidos cargados y agrupados desde el backend:', this.pedidosAgrupados);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los pedidos:', err);
        Swal.fire('Error', 'No se pudieron cargar los pedidos.', 'error');
        this.isLoading = false;
      },
    });
  }

  /**
   * Carga todas las notificaciones pendientes de todas las mesas
   * Usa el mismo patrón que meseros.component.ts
   */
  async cargarNotificaciones(): Promise<void> {
    // Limpiar las notificaciones actuales
    this.notificaciones.clear();
    this.allNotifications = [];
    
    // Iterar sobre cada mesa para obtener sus notificaciones
    for (const mesa of this.mesas) {
      try {
        const notificaciones = await this.notificacionesService.obtenerPorMesa(mesa.no_mesa);
        console.log(`Notificaciones mesa ${mesa.no_mesa}:`, notificaciones);
        
        // Filtrar solo pendientes (comparación case-insensitive)
        const pendientes = notificaciones.filter((n: Notificacion) =>
          n.estado && n.estado.toLowerCase() === 'pendiente'
        );
        
        // Guardar en el Map por mesa
        this.notificaciones.set(mesa.no_mesa, pendientes);
        
        // Agregar a la lista global con información de mesa
        const notificacionesConMesa = pendientes.map((n: Notificacion) => ({
          ...n,
          no_mesa: mesa.no_mesa
        }));
        
        this.allNotifications.push(...notificacionesConMesa);
      } catch (error) {
        console.error(`Error notificaciones mesa ${mesa.no_mesa}:`, error);
      }
    }
    
    // Actualizar contador
    this.updateUnreadCount();
    
    console.log('Total notificaciones pendientes:', this.allNotifications.length);
  }

  /**
   * Obtiene notificaciones de una mesa específica
   */
  obtenerNotificacionesPorMesa(noMesa: number): Notificacion[] {
    return this.notificaciones.get(noMesa) || [];
  }

  /**
   * Verifica si una mesa tiene notificaciones pendientes
   */
  tieneNotificaciones(noMesa: number): boolean {
    return this.obtenerNotificacionesPorMesa(noMesa).length > 0;
  }

  /**
   * Atiende una notificación específica
   */
  async atenderNotificacion(notificacionId: number, mesaId: number): Promise<void> {
    try {
      await this.notificacionesService.atenderNotificacion(notificacionId);

      // Actualizar localmente
      const notifs = this.notificaciones.get(mesaId) || [];
      const actualizadas = notifs.filter((n: Notificacion) => n.id_notf !== notificacionId);
      this.notificaciones.set(mesaId, actualizadas);
      
      // Actualizar lista global
      this.allNotifications = this.allNotifications.filter(
        (n: NotificacionConMesa) => n.id_notf !== notificacionId
      );
      
      // Actualizar contador
      this.updateUnreadCount();

      Swal.fire({
        icon: 'success',
        title: 'Atendida',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al atender notificación:', error);
      Swal.fire('Error', 'No se pudo atender la notificación', 'error');
    }
  }

  cargarPedidosMesa(mesaNumber: number, productosYaFiltrados?: PedidoAgrupado[]): void {
    console.log(`Cargando pedidos para mesa ${mesaNumber}`);
    this.mesaSeleccionada = mesaNumber;
    this.mostrandoSoloMesa = true;

    if (productosYaFiltrados && productosYaFiltrados.length > 0) {
      this.productosDelPedido = productosYaFiltrados;
      console.log(`Pedidos cargados para mesa ${mesaNumber}:`, this.orders);

      this.sidebarOpen = true;
      if (this.orders.length > 0) {
        this.orders[0].expanded = true;
        setTimeout(() => {
          const orderElement = document.getElementById(`order-${this.orders[0].id}`);
          if (orderElement) {
            orderElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
      return;
    }

    this.loadOrders();
  }

  private procesarProductosDelPedido(productos: Producto_extras_ingrSel[]): void {
    if (!productos || productos.length === 0) {
      console.log('No hay productos para procesar');
      this.orders = [];
      return;
    }

    const normalizado = productos.map((p) => ({
      ...p,
      extras: p.extras ?? [],
      ingredientes: p.ingredientes ?? [],
    }));

    const agrupados: { [id: number]: Producto_extras_ingrSel[] } = {};
    normalizado.forEach((detalle) => {
      const id = detalle.pedido_id.id_pedido;
      if (!agrupados[id]) agrupados[id] = [];
      agrupados[id].push(detalle);
    });

    const orders: Order[] = Object.entries(agrupados).map(([_, productosGrupo]) => {
      const first = productosGrupo[0];
      return {
        id: first.pedido_id.id_pedido,
        tableNumber: first.pedido_id.no_mesa.no_mesa,
        estado: 'Sin preparar',
        fecha_pedido: new Date(first.pedido_id.fecha_pedido),
        expanded: false,
        items: productosGrupo.map((p) => ({
          pedido_prod_id: p.pedido_prod_id,
          name: p.producto_id.nombre_prod,
          opcion: p.opcion_id?.nombre_opcion || 'Sin opción',
          precio: p.precio,
          status: p.estado as 'Sin preparar' | 'Preparado' | 'Entregado' | 'Pagado',
          extras: p.extras,
          ingredientes: p.ingredientes,
        })),
      };
    });

    orders.sort((a, b) => b.fecha_pedido.getTime() - a.fecha_pedido.getTime());
    this.orders = orders;
  }

  mostrarTodosLosPedidos(): void {
    this.mesaSeleccionada = null;
    this.mostrandoSoloMesa = false;
    this.productosDelPedido = [];
    this.loadOrders();
  }

  tienePedidosMesa(): boolean {
    return this.orders.length > 0;
  }

  obtenerProductosMesaSeleccionada(): PedidoAgrupado[] {
    return this.productosDelPedido;
  }

  loadNavigation(): void {
    this.navItems = [
      { name: 'Inicio', icon: 'bi-house', route: '/home' },
      { name: 'Cocina', icon: 'bi-chef-hat', route: '/cocinero' },
      { name: 'Menú', icon: 'bi-book', route: '/menu' },
      { name: 'Mesas', icon: 'bi-grid', route: '/tables' },
      { name: 'Configuración', icon: 'bi-gear', route: '/settings' },
      { name: 'Cerrar Sesión', icon: 'bi-box-arrow-right', route: '' },
    ];
  }

  updateUnreadCount(): void {
    this.unreadNotifications = this.allNotifications.length;
  }

  toggleSidebar(): void {
    if (this.notificationsOpen) {
      this.notificationsOpen = false;
    }
    if (this.navOpen) {
      this.navOpen = false;
    }
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleNotifications(): void {
    if (this.sidebarOpen) {
      this.sidebarOpen = false;
    }
    if (this.navOpen) {
      this.navOpen = false;
    }
    this.notificationsOpen = !this.notificationsOpen;
  }

  toggleNavigation(): void {
    if (this.sidebarOpen) {
      this.sidebarOpen = false;
    }
    if (this.notificationsOpen) {
      this.notificationsOpen = false;
    }
    this.navOpen = !this.navOpen;
  }

  toggleOrderExpanded(order: Order): void {
    order.expanded = !order.expanded;
  }

  async toggleItemStatus(order: Order, item: OrderItem): Promise<void> {
    Swal.fire({
      title: 'Cargando...',
      html: 'Por favor, espere mientras se procesa la información.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await this.pedidosService.cambiarEstadoDeProducto(
        item.pedido_prod_id,
        EstadoPedidoHasProductos.entregado
      );

      Swal.close();
      Swal.fire({
        title: '¡Pedido entregado!',
        text: 'El pedido se ha marcado como entregado.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      item.previousStatus = item.status;
      item.status = EstadoPedidoHasProductos.entregado;

      this.checkAllDelivered(order);
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: '¡Error!',
        text: 'Ocurrió un error al intentar cambiar el estado del producto. Por favor, revisa tu conexión.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }

  getNextStatus(currentStatus: string): string | null {
    const statusFlow = {
      'Sin preparar': 'Preparado',
      Preparado: 'Entregado',
      Entregado: 'Entregado',
      Pagado: 'Pagado',
    };

    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  }

  async markAllAsDelivered(order: Order): Promise<any> {
    const itemsToUpdate = order.items.filter(
      (item) =>
        item.status !== EstadoPedidoHasProductos.entregado &&
        item.status !== EstadoPedidoHasProductos.pagado
    );

    if (itemsToUpdate.length === 0) {
      return Swal.fire({
        title: 'Información',
        text: 'Todos los items ya están entregados o pagados',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
      });
    }

    const { isConfirmed } = await Swal.fire({
      title: '¿Marcar todo como entregado?',
      text: `Se marcarán ${itemsToUpdate.length} items como entregados`,
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
        title: 'Cargando...',
        html: 'Por favor, espere mientras se procesan los cambios.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: () => Swal.showLoading(),
      });

      await Promise.all(
        itemsToUpdate.map((item) =>
          this.pedidosService.cambiarEstadoDeProducto(
            item.pedido_prod_id,
            EstadoPedidoHasProductos.entregado
          )
        )
      );

      itemsToUpdate.forEach((item) => {
        item.previousStatus = item.status;
        item.status = EstadoPedidoHasProductos.entregado;
      });

      Swal.close();
      Swal.fire({
        title: '¡Pedido completado!',
        text: `Todos los items del pedido #${order.id} han sido marcados como entregados`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      this.checkAllDelivered(order);
    } catch (error) {
      Swal.close();
      console.error('Error al actualizar estados:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al actualizar algunos items',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }

  checkAllDelivered(order: Order): void {
    const allDelivered = order.items.every(
      (i) => i.status === 'Entregado' || i.status === 'Pagado'
    );

    if (allDelivered) {
      this.pedidosService.actualizarEstadoPedido(order.id, 'Entregado').subscribe({
        next: () => {
          order.estado = 'Completado';
          Swal.fire({
            title: '¡Pedido completado!',
            text: `El pedido #${order.id} ha sido entregado por completo`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (error) => {
          console.error('Error al actualizar estado del pedido:', error);
        },
      });
    }
  }

  /**
   * Formatea el tiempo de la notificación para mostrar "hace X minutos/horas"
   */
  formatTime(date: string | Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMinutes = Math.round((now.getTime() - notificationDate.getTime()) / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Ahora mismo';
    } else if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    } else if (diffMinutes < 24 * 60) {
      const hours = Math.floor(diffMinutes / 60);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      const days = Math.floor(diffMinutes / (24 * 60));
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Sin preparar':
        return 'text-danger';
      case 'Preparado':
        return 'text-warning';
      case 'Entregado':
        return 'text-success';
      case 'Pagado':
        return 'text-primary';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Sin preparar':
        return 'Sin preparar';
      case 'Preparado':
        return 'Preparado';
      case 'Entregado':
        return 'Entregado';
      case 'Pagado':
        return 'Pagado';
      default:
        return status;
    }
  }

  getOrderStatusClass(status: string): string {
    switch (status) {
      case 'Iniciado':
        return 'badge bg-primary';
      case 'En preparación':
        return 'badge bg-warning';
      case 'Completado':
        return 'badge bg-success';
      case 'Pagado':
        return 'badge bg-secondary';
      default:
        return 'badge bg-light';
    }
  }

  getOrderByTable(tableNumber: number): Order | undefined {
    return this.orders.find((order) => order.tableNumber === tableNumber);
  }

  goToOrder(tableNumber: number): void {
    if (!this.mostrandoSoloMesa) {
      const order = this.getOrderByTable(tableNumber);
      if (order) {
        this.notificationsOpen = false;
        this.sidebarOpen = true;

        this.orders.forEach((o) => {
          o.expanded = o.id === order.id;
        });

        setTimeout(() => {
          const orderElement = document.getElementById(`order-${order.id}`);
          if (orderElement) {
            orderElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
        return;
      }
    }

    this.cargarPedidosMesa(tableNumber);
  }

  navigate(route: string): void {
    console.log(`Navegando a: ${route}`);
    this.navOpen = false;
  }

  refreshOrders(): void {
    this.loadOrders();
  }

  formatOrderDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  getOrderTotal(order: Order): number {
    return order.items.reduce((total, item) => {
      let precio = item.precio;

      if (item.extras && item.extras.length > 0) {
        const extrasTotal = item.extras.reduce((sum, extra: any) => {
          return sum + +(extra.precio || 0);
        }, 0);
        precio += extrasTotal;
      }

      if (item.ingredientes && item.ingredientes.length > 0) {
        const ingredientesTotal = item.ingredientes.reduce((sum, ing: any) => {
          return sum + +(ing.precio || 0);
        }, 0);
        precio += ingredientesTotal;
      }

      return total + precio;
    }, 0);
  }

  calcularTotalProducto(item: OrderItem): number {
    return parseFloat(item.precio.toString());
  }

  obtenerNombresExtras(extras: any[]): string {
    if (!extras || extras.length === 0) {
      return '';
    }

    return extras
      .map((extra: any) => {
        return extra.nombre_extra || extra.nombre || extra.name || 'Extra';
      })
      .join(', ');
  }

  obtenerNombresIngredientes(ingredientes: any[]): string {
    if (!ingredientes || ingredientes.length === 0) {
      return '';
    }

    return ingredientes
      .map((ing: any) => {
        return ing.nombre_ingrediente || ing.nombre || ing.name || 'Ingrediente';
      })
      .join(', ');
  }

  async eliminarProducto(order: Order, item: OrderItem): Promise<void> {
    if (item.status !== 'Sin preparar') {
      Swal.fire({
        title: 'No se puede eliminar',
        text: `El producto "${item.name}" ya está en estado "${item.status}" y no se puede eliminar`,
        icon: 'warning',
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar producto?',
      html: `
        <p>Se eliminará el producto:</p>
        <p><strong>${item.name}</strong></p>
        <p><small>Opción: ${item.opcion}</small></p>
        <p><small>Precio: $${this.calcularTotalProducto(item)}</small></p>
        <hr>
        <p><strong>Esta acción no se puede deshacer</strong></p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: 'Eliminando producto...',
        html: 'Por favor, espere mientras se elimina el producto.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: () => Swal.showLoading(),
      });

      await this.pedidosService.eliminarProductoDelPedido(item.pedido_prod_id).toPromise();

      const itemIndex = order.items.indexOf(item);
      if (itemIndex > -1) {
        order.items.splice(itemIndex, 1);
      }

      if (order.items.length === 0) {
        const orderIndex = this.orders.indexOf(order);
        if (orderIndex > -1) {
          this.orders.splice(orderIndex, 1);
        }
      }

      Swal.close();
      Swal.fire({
        title: '¡Producto eliminado!',
        text: `El producto "${item.name}" ha sido eliminado del pedido`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      console.log(`Producto ${item.pedido_prod_id} eliminado exitosamente`);
    } catch (error) {
      Swal.close();
      console.error('Error al eliminar el producto:', error);

      let errorMessage = 'Ocurrió un error al eliminar el producto';

      if (error && typeof error === 'object') {
        const err = error as any;
        if (err.status === 400) {
          errorMessage = 'No se puede eliminar el producto porque ya está en preparación';
        } else if (err.status === 404) {
          errorMessage = 'El producto no existe o ya fue eliminado';
        } else if (err.status === 403) {
          errorMessage = 'No tiene permisos para eliminar este producto';
        }
      }

      Swal.fire({
        title: 'Error al eliminar',
        text: errorMessage,
        icon: 'error',
        timer: 3000,
        showConfirmButton: false,
      });
    }
  }

  puedeEliminarProducto(producto: Producto_extras_ingrSel): boolean {
    return producto.estado === EstadoPedidoHasProductos.sin_preparar;
  }

  async eliminarProductoDelPedido(producto: Producto_extras_ingrSel, pedido: PedidoAgrupado): Promise<void> {
    if (!this.puedeEliminarProducto(producto)) return;

    Swal.fire({
      title: '¿Cancelar producto?',
      text: `Se eliminará "${producto.producto_id.nombre_prod}" del pedido. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.pedidosService.eliminarProductoDelPedido(producto.pedido_prod_id);

          pedido.productos = pedido.productos.filter(p => p.pedido_prod_id !== producto.pedido_prod_id);

          Swal.fire('Cancelado', 'El producto ha sido eliminado del pedido.', 'success');
        } catch (error) {
          console.error('Error al eliminar el producto:', error);
          Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
        }
      }
    });
  }

  async cambiarEstadoProducto(producto: Producto_extras_ingrSel, pedido: PedidoAgrupado): Promise<void> {
    try {
      await this.pedidosService.cambiarEstadoDeProducto(
        producto.pedido_prod_id,
        EstadoPedidoHasProductos.entregado
      );

      pedido.productos = pedido.productos.filter(
        (p) => p.pedido_prod_id !== producto.pedido_prod_id
      );

      if (pedido.productos.length === 0) {
        this.pedidosAgrupados = this.pedidosAgrupados.filter(
          (p) => p.pedidoId.id_pedido !== pedido.pedidoId.id_pedido
        );
      }
    } catch (error) {
      console.error('Error al cambiar el estado del producto:', error);
      Swal.fire('Error', 'No se pudo actualizar el estado del producto.', 'error');
    }
  }

  marcarPedidoCompleto(pedido: PedidoAgrupado): void {
    Swal.fire({
      title: '¿Confirmar entrega?',
      text: `Se marcarán todos los productos de la mesa ${pedido.pedidoId.no_mesa.no_mesa} como entregados.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, entregar todo',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const promesasDeActualizacion = pedido.productos.map((producto) =>
            this.pedidosService.cambiarEstadoDeProducto(
              producto.pedido_prod_id,
              EstadoPedidoHasProductos.entregado
            )
          );
          
          await Promise.all(promesasDeActualizacion);

          this.pedidosAgrupados = this.pedidosAgrupados.filter(
            (p) => p.pedidoId.id_pedido !== pedido.pedidoId.id_pedido
          );
        } catch (error) {
          console.error('Error al marcar el pedido como completado:', error);
          Swal.fire('Error', 'No se pudieron actualizar todos los productos.', 'error');
        }
      }
    });
  }
}