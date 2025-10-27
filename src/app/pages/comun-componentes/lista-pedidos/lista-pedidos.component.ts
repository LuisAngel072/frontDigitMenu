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
import { Subscription } from 'rxjs';
import { CocinaSocketService } from '../../../gateways/pedidos-gateway.service';

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
  status: EstadoPedidoHasProductos;
  previousStatus?: EstadoPedidoHasProductos;
  extras: any[];
  ingredientes: any[];
}

interface NavItem {
  name: string;
  icon: string;
  route: string;
}

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
  @Input() rol: string = 'mesero';

  orders: Order[] = [];
  notificaciones = new Map<number, Notificacion[]>();
  allNotifications: NotificacionConMesa[] = [];
  pedidosAgrupados: PedidoAgrupado[] = [];
  mesas: Mesa[] = [];

  sidebarOpen = false;
  notificationsOpen = false;
  navOpen = false;
  unreadNotifications = 0;
  isLoading = true;
  mesaSeleccionada: number | null = null;
  mostrandoSoloMesa = false;
  productosDelPedido: PedidoAgrupado[] = [];

  navItems: NavItem[] = [
    { name: 'Inicio', icon: 'bi-house', route: '/home' },
    { name: 'Cocina', icon: 'bi-chef-hat', route: '/cocinero' },
    { name: 'Menú', icon: 'bi-book', route: '/menu' },
    { name: 'Mesas', icon: 'bi-grid', route: '/tables' },
    { name: 'Configuración', icon: 'bi-gear', route: '/settings' },
    { name: 'Cerrar Sesión', icon: 'bi-box-arrow-right', route: '' },
  ];

  estadosProductos: EstadoPedidoHasProductos[] = [
    EstadoPedidoHasProductos.sin_preparar,
    EstadoPedidoHasProductos.preparado,
    EstadoPedidoHasProductos.entregado,
    EstadoPedidoHasProductos.pagado,
  ];

  private intervalId: any;

  private nuevoProductoSub: Subscription | undefined;
  private estadoActualizadoSub: Subscription | undefined;

  constructor(
    private pedidosService: PedidosService,
    private mesasService: MesasService,
    private pedidosSocket: CocinaSocketService,
    private notificacionesService: NotificacionesService,
  ) {}

  ngOnInit(): void {
    this.cargarMesas();
    this.loadIcons();
    this.escucharActualizacionesEnVivo(); // Empieza a escuchar sockets
  }

  ngOnDestroy(): void {
    this.nuevoProductoSub?.unsubscribe();
    this.estadoActualizadoSub?.unsubscribe();
    this.pedidosSocket.disconnect();
    this.intervalId = setInterval(() => this.cargarNotificaciones(), 10000);
  }

  async cargarMesas(): Promise<void> {
    try {
      this.mesas = await this.mesasService.obtenerMesas();
      console.log('Mesas cargadas:', this.mesas);
      this.loadOrders();
      this.cargarNotificaciones();
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      this.loadOrders();
    }
  }

  loadIcons(): void {
    const links = [
      { href: 'bootstrap-icons', url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css' },
      { href: 'bootstrap', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css' }
    ];

    links.forEach(({ href, url }) => {
      if (!document.querySelector(`link[href*="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
      }
    });
  }

  loadOrders(): void {
    this.isLoading = true;
    this.pedidosService.getPedidosActivosConDetalles(this.rol).subscribe({
      next: (pedidos) => {
        this.pedidosAgrupados = pedidos;
        console.log('Pedidos cargados:', this.pedidosAgrupados);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        Swal.fire('Error', 'No se pudieron cargar los pedidos.', 'error');
        this.isLoading = false;
      },
    });
  }
  /**
   * Se suscribe a los eventos del socket para actualizaciones en tiempo real.
   */
  escucharActualizacionesEnVivo(): void {
    this.nuevoProductoSub = this.pedidosSocket
      .onNuevoProducto()
      .subscribe((nuevoProducto) => {
        console.log('Socket (Mesero) recibió nuevoProducto:', nuevoProducto);
        this.agregarOActualizarProductoEnVista(nuevoProducto);
      });

    this.estadoActualizadoSub = this.pedidosSocket
      .onEstadoActualizado()
      .subscribe((productoActualizado) => {
        console.log(
          'Socket (Mesero) recibió estadoActualizado:',
          productoActualizado
        );
        this.agregarOActualizarProductoEnVista(productoActualizado);
      });
  }
  /**
   * Lógica centralizada para actualizar la vista del MESERO basada en datos del socket.
   */
  private agregarOActualizarProductoEnVista(
    productoData: Producto_extras_ingrSel
  ): void {
    const pedidoIdRecibido = productoData.pedido_id.id_pedido;
    const productoIdRecibido = productoData.pedido_prod_id;
    const estadoRecibido = productoData.estado;

    // Estados relevantes para el MESERO
    const estadosVisiblesMesero = [
      EstadoPedidoHasProductos.sin_preparar,
      EstadoPedidoHasProductos.preparado,
    ];

    let pedidoExistente = this.pedidosAgrupados.find(
      (p) => p.pedidoId.id_pedido === pedidoIdRecibido
    );

    // --- Si el producto está en un estado que el mesero debe ver ---
    if (estadosVisiblesMesero.includes(estadoRecibido)) {
      if (pedidoExistente) {
        // Pedido existe, buscar producto
        const productoIndex = pedidoExistente.productos.findIndex(
          (p) => p.pedido_prod_id === productoIdRecibido
        );
        if (productoIndex !== -1) {
          // Producto existe, actualizarlo (importante por si cambia de 'Sin preparar' a 'Preparado')
          pedidoExistente.productos[productoIndex] = productoData;
          console.log(
            `Producto ${productoIdRecibido} actualizado en pedido ${pedidoIdRecibido}`
          );
        } else {
          // Producto nuevo en pedido existente, añadirlo
          pedidoExistente.productos.push(productoData);
          console.log(
            `Producto ${productoIdRecibido} añadido a pedido existente ${pedidoIdRecibido}`
          );
        }
        // Recalcular estado pendiente
        pedidoExistente.tieneProductosPendientes =
          pedidoExistente.productos.some(
            (p) => p.estado === EstadoPedidoHasProductos.sin_preparar
          );
      } else {
        // Pedido es nuevo para la vista del mesero
        const nuevoPedido: PedidoAgrupado = {
          pedidoId: productoData.pedido_id,
          productos: [productoData],
          expandido: true, // Mostrar expandido por defecto al llegar nuevo
          tieneProductosPendientes:
            estadoRecibido === EstadoPedidoHasProductos.sin_preparar,
        };
        this.pedidosAgrupados.unshift(nuevoPedido); // Añadir al principio
        console.log(`Nuevo pedido ${pedidoIdRecibido} añadido a la vista`);
      }
    }
    // --- Si el producto está en un estado que el mesero NO debe ver (ej: 'Entregado') ---
    else {
      if (pedidoExistente) {
        // Eliminar el producto de la lista del pedido
        const productosOriginales = pedidoExistente.productos.length;
        pedidoExistente.productos = pedidoExistente.productos.filter(
          (p) => p.pedido_prod_id !== productoIdRecibido
        );
        console.log(
          `Producto ${productoIdRecibido} eliminado de la vista del pedido ${pedidoIdRecibido} (estado: ${estadoRecibido})`
        );

        // Si el pedido queda sin productos visibles para el mesero, eliminar el pedido completo
        if (pedidoExistente.productos.length === 0 && productosOriginales > 0) {
          this.pedidosAgrupados = this.pedidosAgrupados.filter(
            (p) => p.pedidoId.id_pedido !== pedidoIdRecibido
          );
          console.log(
            `Pedido ${pedidoIdRecibido} eliminado de la vista (sin productos visibles para mesero)`
          );
        } else if (pedidoExistente.productos.length > 0) {
          // Recalcular estado pendiente (si aún quedan productos 'Sin preparar')
          pedidoExistente.tieneProductosPendientes =
            pedidoExistente.productos.some(
              (p) => p.estado === EstadoPedidoHasProductos.sin_preparar
            );
        }
      }
      // Si el pedido no existía localmente y el estado no es relevante, no hacemos nada.
    }
  }

  async cargarNotificaciones(): Promise<void> {
    // Cargar todas las notificaciones primero en estructuras temporales
    const nuevasNotificacionesPorMesa = new Map<number, Notificacion[]>();
    const nuevasNotificaciones: NotificacionConMesa[] = [];

    for (const mesa of this.mesas) {
      try {
        const notificaciones = await this.notificacionesService.obtenerPorMesa(mesa.no_mesa);
        const pendientes = notificaciones.filter((n: Notificacion) =>
          n.estado?.toLowerCase() === 'pendiente'
        );

        nuevasNotificacionesPorMesa.set(mesa.no_mesa, pendientes);
        nuevasNotificaciones.push(...pendientes.map(n => ({ ...n, no_mesa: mesa.no_mesa })));
      } catch (error) {
        console.error(`Error notificaciones mesa ${mesa.no_mesa}:`, error);
      }
    }

    // Actualizar todo de una vez (evita parpadeo)
    this.notificaciones = nuevasNotificacionesPorMesa;
    this.allNotifications = nuevasNotificaciones;
    this.updateUnreadCount();
    console.log('Total notificaciones pendientes:', this.allNotifications.length);
  }

  obtenerNotificacionesPorMesa(noMesa: number): Notificacion[] {
    return this.notificaciones.get(noMesa) || [];
  }

  tieneNotificaciones(noMesa: number): boolean {
    return this.obtenerNotificacionesPorMesa(noMesa).length > 0;
  }

  async atenderNotificacion(notificacionId: number, mesaId: number): Promise<void> {
    try {
      await this.notificacionesService.atenderNotificacion(notificacionId);

      const notifs = this.notificaciones.get(mesaId) || [];
      this.notificaciones.set(mesaId, notifs.filter(n => n.id_notf !== notificacionId));
      this.allNotifications = this.allNotifications.filter(n => n.id_notf !== notificacionId);
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

    if (productosYaFiltrados?.length) {
      this.productosDelPedido = productosYaFiltrados;
      this.sidebarOpen = true;
      if (this.orders.length > 0) {
        this.orders[0].expanded = true;
        setTimeout(() => {
          document.getElementById(`order-${this.orders[0].id}`)?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
      return;
    }

    // Filtrar los pedidos por mesa específica
    this.isLoading = true;
    this.pedidosService.getPedidosActivosConDetalles(this.rol).subscribe({
      next: (pedidos) => {
        // Filtrar solo los pedidos de la mesa seleccionada
        this.productosDelPedido = pedidos.filter(
          p => p.pedidoId.no_mesa.no_mesa === mesaNumber
        );
        console.log(`Pedidos filtrados para mesa ${mesaNumber}:`, this.productosDelPedido);
        this.isLoading = false;
        this.sidebarOpen = true;
      },
      error: (err) => {
        console.error('Error al cargar pedidos de la mesa:', err);
        Swal.fire('Error', 'No se pudieron cargar los pedidos de la mesa.', 'error');
        this.isLoading = false;
      },
    });
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
    // Si estamos mostrando solo una mesa, devolver los productos filtrados
    if (this.mostrandoSoloMesa && this.mesaSeleccionada !== null) {
      return this.productosDelPedido;
    }
    // Si no, devolver todos los pedidos agrupados
    return this.pedidosAgrupados;
  }

  updateUnreadCount(): void {
    this.unreadNotifications = this.allNotifications.length;
  }

  toggleSidebar(): void {
    this.closeAllExcept('sidebar');
    this.sidebarOpen = !this.sidebarOpen;

    // Si vamos a ABRIR el sidebar
    if (this.sidebarOpen) {
      this.loadOrders();
    }
  }

  toggleNotifications(): void {
    this.closeAllExcept('notifications');
    this.notificationsOpen = !this.notificationsOpen;
  }

  toggleNavigation(): void {
    this.closeAllExcept('nav');
    this.navOpen = !this.navOpen;
  }

  private closeAllExcept(keep: 'sidebar' | 'notifications' | 'nav'): void {
    if (keep !== 'sidebar') this.sidebarOpen = false;
    if (keep !== 'notifications') this.notificationsOpen = false;
    if (keep !== 'nav') this.navOpen = false;
  }

  toggleOrderExpanded(order: Order): void {
    order.expanded = !order.expanded;
  }

  closeSidebar(): void {
    if (this.sidebarOpen) {
      // Resetear el filtro de mesa antes de cerrar
      this.mesaSeleccionada = null;
      this.mostrandoSoloMesa = false;
      this.productosDelPedido = [];
      this.sidebarOpen = false;
    }
  }

  async toggleItemStatus(order: Order, item: OrderItem): Promise<void> {
    this.showLoading('Cargando...', 'Por favor, espere mientras se procesa la información.');

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
        text: 'Ocurrió un error al intentar cambiar el estado del producto.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }

  async markAllAsDelivered(order: Order): Promise<void> {
    const itemsToUpdate = order.items.filter(
      item => item.status !== EstadoPedidoHasProductos.entregado &&
              item.status !== EstadoPedidoHasProductos.pagado
    );

    if (itemsToUpdate.length === 0) {
      await Swal.fire({
        title: 'Información',
        text: 'Todos los items ya están entregados o pagados',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: '¿Marcar todo como entregado?',
      text: `Se marcarán ${itemsToUpdate.length} items como entregados`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar todo',
      cancelButtonText: 'Cancelar',
    });

    if (!isConfirmed) return;

    try {
      this.showLoading('Cargando...', 'Por favor, espere mientras se procesan los cambios.');

      await Promise.all(
        itemsToUpdate.map(item =>
          this.pedidosService.cambiarEstadoDeProducto(
            item.pedido_prod_id,
            EstadoPedidoHasProductos.entregado
          )
        )
      );

      itemsToUpdate.forEach(item => {
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
      i => i.status === EstadoPedidoHasProductos.entregado ||
           i.status === EstadoPedidoHasProductos.pagado
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
        error: (error) => console.error('Error al actualizar estado del pedido:', error),
      });
    }
  }

  formatTime(date: string | Date): string {
    const diffMinutes = Math.round((Date.now() - new Date(date).getTime()) / 60000);

    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    const days = Math.floor(diffMinutes / 1440);
    return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Sin preparar': 'text-danger',
      'Preparado': 'text-warning',
      'Entregado': 'text-success',
      'Pagado': 'text-primary'
    };
    return classes[status] || '';
  }

  getStatusText(status: string): string {
    return status;
  }

  getOrderStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Iniciado': 'badge bg-primary',
      'En preparación': 'badge bg-warning',
      'Completado': 'badge bg-success',
      'Pagado': 'badge bg-secondary'
    };
    return classes[status] || 'badge bg-light';
  }

  getOrderByTable(tableNumber: number): Order | undefined {
    return this.orders.find(order => order.tableNumber === tableNumber);
  }

  goToOrder(tableNumber: number): void {
    if (!this.mostrandoSoloMesa) {
      const order = this.getOrderByTable(tableNumber);
      if (order) {
        this.notificationsOpen = false;
        this.sidebarOpen = true;
        this.orders.forEach(o => o.expanded = o.id === order.id);
        setTimeout(() => {
          document.getElementById(`order-${order.id}`)?.scrollIntoView({ behavior: 'smooth' });
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
      if (item.extras?.length) {
        precio += item.extras.reduce((sum, extra: any) => sum + +(extra.precio || 0), 0);
      }
      if (item.ingredientes?.length) {
        precio += item.ingredientes.reduce((sum, ing: any) => sum + +(ing.precio || 0), 0);
      }
      return total + precio;
    }, 0);
  }

  calcularTotalProducto(item: OrderItem): number {
    return parseFloat(item.precio.toString());
  }

  obtenerNombresExtras(extras: any[]): string {
    return extras?.length ? extras.map(e => e.nombre_extra || e.nombre || e.name || 'Extra').join(', ') : '';
  }

  obtenerNombresIngredientes(ingredientes: any[]): string {
    return ingredientes?.length ?
      ingredientes.map(i => i.nombre_ingrediente || i.nombre || i.name || 'Ingrediente').join(', ') : '';
  }

  async eliminarProducto(order: Order, item: OrderItem): Promise<void> {
    if (item.status !== EstadoPedidoHasProductos.sin_preparar) {
      await Swal.fire({
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

    if (!isConfirmed) return;

    try {
      this.showLoading('Eliminando producto...', 'Por favor, espere mientras se elimina el producto.');

      await this.pedidosService.eliminarProductoDelPedido(item.pedido_prod_id).toPromise();

      order.items = order.items.filter(i => i !== item);
      if (order.items.length === 0) {
        this.orders = this.orders.filter(o => o !== order);
      }

      Swal.close();
      Swal.fire({
        title: '¡Producto eliminado!',
        text: `El producto "${item.name}" ha sido eliminado del pedido`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.close();
      console.error('Error al eliminar el producto:', error);

      const errorMessages: Record<number, string> = {
        400: 'No se puede eliminar el producto porque ya está en preparación',
        404: 'El producto no existe o ya fue eliminado',
        403: 'No tiene permisos para eliminar este producto'
      };

      const err = error as any;
      const message = errorMessages[err?.status] || 'Ocurrió un error al eliminar el producto';

      Swal.fire({
        title: 'Error al eliminar',
        text: message,
        icon: 'error',
        timer: 3000,
        showConfirmButton: false,
      });
    }
  }

  puedeEliminarProducto(producto: Producto_extras_ingrSel): boolean {
    return producto.estado === EstadoPedidoHasProductos.sin_preparar;
  }

  /**
   * Elimina un producto de un pedido.
   * Acepta la nueva interfaz 'Producto_extras_ingrSel'.
   */
  async eliminarProductoDelPedido(
    producto: Producto_extras_ingrSel,
    pedido: PedidoAgrupado
  ): Promise<void> {
    // 1. Verifica si se puede eliminar
    if (!this.puedeEliminarProducto(producto)) {
       Swal.fire('Acción no permitida', 'Solo se pueden cancelar productos que no han sido preparados.', 'warning');
       return; // Sale temprano si no se puede eliminar
    }

    // 2. Muestra la confirmación
    Swal.fire({
      title: '¿Cancelar producto?',
      text: `Se eliminará "${producto.producto_id.nombre_prod}" del pedido. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
    }).then(async (result) => {
      // 3. Si el usuario confirma DENTRO del .then()...
      if (result.isConfirmed) {
        try {
          // 4. Llama al servicio para eliminar en el backend
          await this.pedidosService.eliminarProductoDelPedido(
            producto.pedido_prod_id
          );

          // 5. Actualización visual instantánea: elimina el producto de la lista local
          pedido.productos = pedido.productos.filter(
            (p) => p.pedido_prod_id !== producto.pedido_prod_id
          );

          // Opcional: Recalcular si el pedido sigue teniendo pendientes
          if (pedido.productos.length > 0) {
             pedido.tieneProductosPendientes = pedido.productos.some(p => p.estado === EstadoPedidoHasProductos.sin_preparar);
          } else {
             // Si el pedido queda vacío, podrías querer eliminarlo del array principal `pedidosAgrupados`
             // (Necesitarías acceso a `this.pedidosAgrupados` aquí o pasar una función callback)
             // Ejemplo: this.eliminarPedidoDeVista(pedido.pedidoId.id_pedido);
          }


          // 6. Muestra mensaje de éxito
          Swal.fire(
            'Cancelado',
            'El producto ha sido eliminado del pedido.',
            'success'
          );
        } catch (error) {
          // 7. Manejo de errores si la API falla
          console.error('Error al eliminar el producto:', error);
          Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
        }
      }
      // 8. Si el usuario NO confirma (result.isConfirmed es false), no se hace nada más.
    });

  }

  async cambiarEstadoProducto(producto: Producto_extras_ingrSel, pedido: PedidoAgrupado): Promise<void> {
    try {
      await this.pedidosService.cambiarEstadoDeProducto(
        producto.pedido_prod_id,
        EstadoPedidoHasProductos.entregado
      );

      pedido.productos = pedido.productos.filter(p => p.pedido_prod_id !== producto.pedido_prod_id);

      if (pedido.productos.length === 0) {
        this.pedidosAgrupados = this.pedidosAgrupados.filter(
          p => p.pedidoId.id_pedido !== pedido.pedidoId.id_pedido
        );
      }
    } catch (error) {
      console.error('Error al cambiar el estado del producto:', error);
      Swal.fire('Error', 'No se pudo actualizar el estado del producto.', 'error');
    }
  }

  async marcarPedidoCompleto(pedido: PedidoAgrupado): Promise<void> {
    const { isConfirmed } = await Swal.fire({
      title: '¿Confirmar entrega?',
      text: `Se marcarán todos los productos de la mesa ${pedido.pedidoId.no_mesa.no_mesa} como entregados.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, entregar todo',
      cancelButtonText: 'Cancelar',
    });

    if (!isConfirmed) return;

    try {
      await Promise.all(
        pedido.productos.map(producto =>
          this.pedidosService.cambiarEstadoDeProducto(
            producto.pedido_prod_id,
            EstadoPedidoHasProductos.entregado
          )
        )
      );

      this.pedidosAgrupados = this.pedidosAgrupados.filter(
        p => p.pedidoId.id_pedido !== pedido.pedidoId.id_pedido
      );
    } catch (error) {
      console.error('Error al marcar el pedido como completado:', error);
      Swal.fire('Error', 'No se pudieron actualizar todos los productos.', 'error');
    }
  }

  private showLoading(title: string, html: string): void {
    Swal.fire({
      title,
      html,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      didOpen: () => Swal.showLoading(),
    });
  }
}
