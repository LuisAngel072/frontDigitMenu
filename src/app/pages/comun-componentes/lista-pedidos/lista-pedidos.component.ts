// lista-pedidos.component.ts
import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../../services/pedidos.service';
import {
  EstadoPedidoHasProductos,
  Producto_extras_ingrSel,
} from '../../../types';
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
    imports: [CommonModule]
})
export class ListaPedidosComponent implements OnInit {
  orders: Order[] = [];
  notifications: Notification[] = [];
  sidebarOpen = false;
  notificationsOpen = false;
  navOpen = false;
  unreadNotifications = 0;
  navItems: NavItem[] = [];

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
  this.pedidosService.getPedidosConProductosDetalles().subscribe({
    next: (data: Producto_extras_ingrSel[]) => {
      // 1) Normalizar datos
      const normalizado = data.map(p => ({
        ...p,
        extras: p.extras ?? [],
        ingredientes: p.ingredientes ?? [],
      }));

      // 2) Agrupar por pedido
      const agrupados: { [id: number]: Producto_extras_ingrSel[] } = {};
      normalizado.forEach(detalle => {
        const id = detalle.pedido_id.id_pedido;
        if (!agrupados[id]) agrupados[id] = [];
        agrupados[id].push(detalle);
      });

      // 3) Convertir a la estructura Order
      let orders: Order[] = Object.entries(agrupados).map(([_, productos]) => {
        const first = productos[0];
        return {
          id: first.pedido_id.id_pedido,
          tableNumber: first.pedido_id.no_mesa.no_mesa,
          estado: first.pedido_id.estado,
          fecha_pedido: new Date(first.pedido_id.fecha_pedido),
          expanded: false,
          items: productos.map(p => ({
            pedido_prod_id: p.pedido_prod_id,
            name: p.producto_id.nombre_prod,
            opcion: p.opcion_id?.nombre_opcion || 'Sin opción',
            precio: p.precio,
            status: p.estado as 'Sin preparar'|'Preparado'|'Entregado'|'Pagado',
            extras: p.extras,
            ingredientes: p.ingredientes,
          })),
        };
      });

      // 4) Filtrar OUT los pedidos cuyo *todos* items están ya en 'Entregado'
      orders = orders.filter(o => !o.items.every(i => i.status === 'Entregado' || !o.items.every(i => i.status === 'Pagado')));

      // 5) Ordenar por fecha más reciente
      orders.sort((a, b) => b.fecha_pedido.getTime() - a.fecha_pedido.getTime());

      // 6) Asignar al componente
      this.orders = orders;
    },
    error: err => {
      console.error('Error cargando pedidos:', err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los pedidos',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false,
      });
    }
  });
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

      // Si quieres refrescar la vista tras el cambio:
      await this.ngOnInit();
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

  formatTime(date: Date): string {
    const now = new Date();
    const diffMinutes = Math.round(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

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
    } else {
      Swal.fire({
        title: 'Mesa no encontrada',
        text: `No se encontró ningún pedido para la mesa ${tableNumber}`,
        icon: 'warning',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }

  navigate(route: string): void {
    // Aquí implementarías la navegación real con Angular Router
    Swal.fire({
      title: 'Navegación',
      text: `Navegando a: ${route}`,
      icon: 'info',
      timer: 1500,
      showConfirmButton: false,
    });

    this.navOpen = false;
  }

  // Método para refrescar los datos
  refreshOrders(): void {
    this.loadOrders();
  }

  // Formatear fecha para mostrar
  formatOrderDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  // Calcular total del pedido
  getOrderTotal(order: Order): number {
    return order.items.reduce((total, item) => total + item.precio, 0);
  }
}
