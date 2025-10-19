// lista-pedidos.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { PedidosService } from '../../../services/pedidos.service';
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

interface Notification {
  id: number;
  tableNumber: number;
  message: string;
  time: Date;
  read: boolean;
}

interface NavItem {
  name: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-lista-pedidos',
  templateUrl: './lista-pedidos.component.html',
  styleUrls: ['./lista-pedidos.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ListaPedidosComponent implements OnInit {
  orders: Order[] = [];
  notifications: Notification[] = [];
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

  @Input() rol: string = 'mesero'; // Rol por defecto es mesero

  public pedidosAgrupados: PedidoAgrupado[] = [];
  public isLoading = true;

  constructor(private pedidosService: PedidosService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadNotifications();
    this.loadNavigation();
    this.loadIcons();
  }

  loadIcons(): void {
    // Check if Bootstrap Icons are already loaded
    const iconLink = document.querySelector('link[href*="bootstrap-icons"]');
    if (!iconLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href =
        'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css';
      document.head.appendChild(link);
    }

    // Add Bootstrap CSS if not present
    const bootstrapLink = document.querySelector('link[href*="bootstrap"]');
    if (!bootstrapLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href =
        'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css';
      document.head.appendChild(link);
    }
  }

  loadOrders(): void {
    this.isLoading = true;
    this.pedidosService.getPedidosActivosConDetalles(this.rol).subscribe({
      next: (pedidos) => {
        // La API ya devuelve los datos en el formato que necesitamos.
        // Simplemente asignamos la respuesta.
        this.pedidosAgrupados = pedidos;
        console.log(
          'Pedidos cargados y agrupados desde el backend:',
          this.pedidosAgrupados
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los pedidos:', err);
        Swal.fire('Error', 'No se pudieron cargar los pedidos.', 'error');
        this.isLoading = false;
      },
    });
  }

  // MÉTODO REQUERIDO POR EL COMPONENTE MESEROS
  cargarPedidosMesa(
    mesaNumber: number,
    productosYaFiltrados?: PedidoAgrupado[]
  ): void {
    console.log(`Cargando pedidos para mesa ${mesaNumber}`);
    this.mesaSeleccionada = mesaNumber;
    this.mostrandoSoloMesa = true;

    if (productosYaFiltrados && productosYaFiltrados.length > 0) {
      // Si ya tenemos los productos filtrados, los procesamos directamente
      this.productosDelPedido = productosYaFiltrados;

      console.log(`Pedidos cargados para mesa ${mesaNumber}:`, this.orders);

      // Abrir el sidebar y expandir el pedido
      this.sidebarOpen = true;
      if (this.orders.length > 0) {
        this.orders[0].expanded = true;
        setTimeout(() => {
          const orderElement = document.getElementById(
            `order-${this.orders[0].id}`
          );
          if (orderElement) {
            orderElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
      return;
    }

    // Si no tenemos productos filtrados, los cargamos y filtramos
    this.loadOrders(); // Esto ahora respetará el filtro por mesa
  }

  // MÉTODO AUXILIAR PARA PROCESAR PRODUCTOS DEL PEDIDO
  private procesarProductosDelPedido(
    productos: Producto_extras_ingrSel[]
  ): void {
    if (!productos || productos.length === 0) {
      console.log('No hay productos para procesar');
      this.orders = [];
      return;
    }

    // Normalizar datos
    const normalizado = productos.map((p) => ({
      ...p,
      extras: p.extras ?? [],
      ingredientes: p.ingredientes ?? [],
    }));

    // Agrupar por pedido
    const agrupados: { [id: number]: Producto_extras_ingrSel[] } = {};
    normalizado.forEach((detalle) => {
      const id = detalle.pedido_id.id_pedido;
      if (!agrupados[id]) agrupados[id] = [];
      agrupados[id].push(detalle);
    });

    // Convertir a la estructura Order
    const orders: Order[] = Object.entries(agrupados).map(
      ([_, productosGrupo]) => {
        const first = productosGrupo[0];
        return {
          id: first.pedido_id.id_pedido,
          tableNumber: first.pedido_id.no_mesa.no_mesa,
          // estado: first.pedido_id.estado || "Sin preparar",
          estado: 'Sin preparar',
          fecha_pedido: new Date(first.pedido_id.fecha_pedido),
          expanded: false,
          items: productosGrupo.map((p) => ({
            pedido_prod_id: p.pedido_prod_id,
            name: p.producto_id.nombre_prod,
            opcion: p.opcion_id?.nombre_opcion || 'Sin opción',
            precio: p.precio,
            status: p.estado as
              | 'Sin preparar'
              | 'Preparado'
              | 'Entregado'
              | 'Pagado',
            extras: p.extras,
            ingredientes: p.ingredientes,
          })),
        };
      }
    );

    // Ordenar por fecha más reciente
    orders.sort((a, b) => b.fecha_pedido.getTime() - a.fecha_pedido.getTime());

    this.orders = orders;
  }

  // MÉTODO PARA MOSTRAR TODOS LOS PEDIDOS (QUITAR FILTRO)
  mostrarTodosLosPedidos(): void {
    this.mesaSeleccionada = null;
    this.mostrandoSoloMesa = false;
    this.productosDelPedido = [];
    this.loadOrders();
  }

  // MÉTODO PARA VERIFICAR SI HAY PEDIDOS DE LA MESA SELECCIONADA
  tienePedidosMesa(): boolean {
    return this.orders.length > 0;
  }

  // MÉTODO PARA OBTENER PRODUCTOS DE LA MESA SELECCIONADA
  obtenerProductosMesaSeleccionada(): PedidoAgrupado[] {
    return this.productosDelPedido;
  }

  loadNotifications(): void {
    // Por ahora mantenemos las notificaciones mock, pero podrías crear un servicio para esto
    this.notifications = [
      {
        id: 1,
        tableNumber: 6,
        message: 'Nuevo pedido recibido',
        time: new Date(Date.now() - 5 * 60000),
        read: false,
      },
      {
        id: 2,
        tableNumber: 2,
        message: 'Pedido listo para entregar',
        time: new Date(Date.now() - 15 * 60000),
        read: false,
      },
    ];

    this.updateUnreadCount();
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
    this.unreadNotifications = this.notifications.filter((n) => !n.read).length;
  }

  toggleSidebar(): void {
    if (this.notificationsOpen) {
      this.notificationsOpen = false;
    }
    if (this.navOpen) {
      this.navOpen = false;
    }

    // Si vamos a CERRAR el sidebar
    if (this.sidebarOpen) {
      // Resetear el filtro
      this.mesaSeleccionada = null;
      this.mostrandoSoloMesa = false;
      this.productosDelPedido = [];
    }

    this.sidebarOpen = !this.sidebarOpen;

    // Si vamos a ABRIR el sidebar
    if (this.sidebarOpen) {
      this.loadOrders();
    }
  }

  toggleNotifications(): void {
    if (this.sidebarOpen) {
      this.sidebarOpen = false;
    }
    if (this.navOpen) {
      this.navOpen = false;
    }
    this.notificationsOpen = !this.notificationsOpen;

    if (this.notificationsOpen) {
      this.notifications.forEach((notification) => {
        notification.read = true;
      });
      this.updateUnreadCount();
    }
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

      // Actualizar el estado local del item
      item.previousStatus = item.status;
      item.status = EstadoPedidoHasProductos.entregado;

      // Verificar si todo el pedido está completado
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
      Entregado: 'Entregado', // No hay siguiente estado
      Pagado: 'Pagado', // Estado final
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

      // Lanza todas las promesas en paralelo
      await Promise.all(
        itemsToUpdate.map((item) =>
          this.pedidosService.cambiarEstadoDeProducto(
            item.pedido_prod_id,
            EstadoPedidoHasProductos.entregado
          )
        )
      );

      // Actualiza estado local
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

      // Verificar si todo el pedido está completado
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
      // Actualizar estado del pedido completo si es necesario
      this.pedidosService
        .actualizarEstadoPedido(order.id, 'Entregado')
        .subscribe({
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

  markNotificationAsRead(notification: Notification): void {
    notification.read = true;
    this.updateUnreadCount();
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
    // Si no estamos mostrando solo una mesa, buscar el pedido por número de mesa
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

    // Si ya estamos mostrando una mesa específica o no se encontró el pedido, cargar esa mesa
    this.cargarPedidosMesa(tableNumber);
  }

  navigate(route: string): void {
    // Aquí implementarías la navegación real con Angular Router
    console.log(`Navegando a: ${route}`);
    this.navOpen = false;
  }

  // Método para refrescar los datos
  refreshOrders(): void {
    this.loadOrders();
  }

  // Calcular total del pedido
  getOrderTotal(order: Order): number {
    return order.items.reduce((total, item) => {
      let precio = item.precio;

      // Sumar extras si los hay
      if (item.extras && item.extras.length > 0) {
        const extrasTotal = item.extras.reduce((sum, extra: any) => {
          return sum + +(extra.precio || 0);
        }, 0);
        precio += extrasTotal;
      }

      // Sumar ingredientes adicionales si los hay
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
        // Manejo más robusto del nombre del extra
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
        return (
          ing.nombre_ingrediente || ing.nombre || ing.name || 'Ingrediente'
        );
      })
      .join(', ');
  }

  /**
   * Elimina un producto específico del pedido
   * @param order - Pedido que contiene el producto
   * @param item - Producto a eliminar
   */
  async eliminarProducto(order: Order, item: OrderItem): Promise<void> {
    // Verificar que el producto se puede eliminar
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
      // Mostrar loading
      Swal.fire({
        title: 'Eliminando producto...',
        html: 'Por favor, espere mientras se elimina el producto.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: () => Swal.showLoading(),
      });

      // Eliminar el producto del servidor
      await this.pedidosService
        .eliminarProductoDelPedido(item.pedido_prod_id)
        .toPromise();

      // Remover el producto de la lista local
      const itemIndex = order.items.indexOf(item);
      if (itemIndex > -1) {
        order.items.splice(itemIndex, 1);
      }

      // Si el pedido se quedó sin productos, removerlo completamente
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

      // Manejo específico de errores
      if (error && typeof error === 'object') {
        const err = error as any;
        if (err.status === 400) {
          errorMessage =
            'No se puede eliminar el producto porque ya está en preparación';
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

  /**
   * CÓDIGO REFACTORIZADO
   */

  /**
   * Verifica si un producto puede ser eliminado
   * Solo se pueden eliminar productos en estado "Sin preparar"
   * @param producto - Producto a verificar
   * @returns true si el producto puede ser eliminado
   */
  puedeEliminarProducto(producto: Producto_extras_ingrSel): boolean {
    return producto.estado === EstadoPedidoHasProductos.sin_preparar;
  }

  /**
   * Elimina un producto de un pedido.
   * Acepta la nueva interfaz 'Producto_extras_ingrSel'.
   */
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

          // Actualización visual instantánea: elimina el producto de la lista
          pedido.productos = pedido.productos.filter(p => p.pedido_prod_id !== producto.pedido_prod_id);

          Swal.fire('Cancelado', 'El producto ha sido eliminado del pedido.', 'success');
        } catch (error) {
          console.error('Error al eliminar el producto:', error);
          Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
        }
      }
    });
  }

  /**
   * REFACTORIZADO: Cambia el estado de un solo producto.
   * Acepta la nueva interfaz 'Producto_extras_ingrSel'.
   */
  async cambiarEstadoProducto(
    producto: Producto_extras_ingrSel,
    pedido: PedidoAgrupado
  ): Promise<void> {
    try {
      // Llama a la API para cambiar el estado a 'Entregado'
      await this.pedidosService.cambiarEstadoDeProducto(
        producto.pedido_prod_id,
        EstadoPedidoHasProductos.entregado
      );

      // Actualización visual instantánea: elimina el producto de la lista local
      pedido.productos = pedido.productos.filter(
        (p) => p.pedido_prod_id !== producto.pedido_prod_id
      );

      // Si el pedido ya no tiene productos visibles, se elimina el pedido completo de la vista
      if (pedido.productos.length === 0) {
        this.pedidosAgrupados = this.pedidosAgrupados.filter(
          (p) => p.pedidoId.id_pedido !== pedido.pedidoId.id_pedido
        );
      }
    } catch (error) {
      console.error('Error al cambiar el estado del producto:', error);
      Swal.fire(
        'Error',
        'No se pudo actualizar el estado del producto.',
        'error'
      );
    }
  }

  /**
   * REFACTORIZADO: Marca todos los productos de un pedido como preparados.
   * Acepta la nueva interfaz 'PedidoAgrupado'.
   */
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
          // Crea una promesa para cada actualización de producto
          const promesasDeActualizacion = pedido.productos.map((producto) =>
            this.pedidosService.cambiarEstadoDeProducto(
              producto.pedido_prod_id,
              EstadoPedidoHasProductos.entregado
            )
          );
          // Espera a que todas las promesas se completen
          await Promise.all(promesasDeActualizacion);

          // Actualización visual instantánea: elimina el pedido completo de la lista
          this.pedidosAgrupados = this.pedidosAgrupados.filter(
            (p) => p.pedidoId.id_pedido !== pedido.pedidoId.id_pedido
          );
        } catch (error) {
          console.error('Error al marcar el pedido como completado:', error);
          Swal.fire(
            'Error',
            'No se pudieron actualizar todos los productos.',
            'error'
          );
        }
      }
    });
  }
}
