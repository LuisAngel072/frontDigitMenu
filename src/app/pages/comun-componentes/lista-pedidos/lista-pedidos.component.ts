// lista-pedidos.component.ts
import { Component, OnInit } from '@angular/core';
import { OrderService } from './order.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

interface Order {
  id: number;
  tableNumber: number;
  items: OrderItem[];
  expanded: boolean;
}

interface OrderItem {
  name: string;
  status: 'preparing' | 'delivered' | 'ready';
  previousStatus?: 'preparing' | 'ready';
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

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    // Load all required data
    this.loadOrders();
    this.loadNotifications();
    this.loadNavigation();
    this.loadIcons();
  }

  loadIcons(): void {
    // Check if Bootstrap Icons are already loaded
    const iconLink = document.querySelector('link[href*="bootstrap-icons"]');
    if (!iconLink) {
      // If not loaded, add the link
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css';
      document.head.appendChild(link);
    }
    
    // Add Bootstrap CSS if not present
    const bootstrapLink = document.querySelector('link[href*="bootstrap"]');
    if (!bootstrapLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css';
      document.head.appendChild(link);
    }
  }

  loadOrders(): void {
    // Mock data - replace with actual service call
    this.orders = [
      {
        id: 1,
        tableNumber: 3,
        expanded: true,
        items: [
          { name: 'Hamburguesa', status: 'preparing', previousStatus: 'preparing' },
          { name: 'Refresco', status: 'delivered', previousStatus: 'ready' },
          { name: 'Patatas', status: 'ready', previousStatus: 'ready' }
        ]
      },
      {
        id: 2,
        tableNumber: 5,
        expanded: false,
        items: [
          { name: 'Pizza', status: 'preparing', previousStatus: 'preparing' },
          { name: 'Cerveza', status: 'ready', previousStatus: 'ready' }
        ]
      },
      {
        id: 3,
        tableNumber: 7,
        expanded: false,
        items: [
          { name: 'Ensalada', status: 'ready', previousStatus: 'ready' },
          { name: 'Agua', status: 'delivered', previousStatus: 'ready' }
        ]
      }
    ];
  }

  loadNotifications(): void {
    // Mock notifications - replace with actual service call
    this.notifications = [
      {
        id: 1,
        tableNumber: 6,
        message: 'Nuevo pedido recibido',
        time: new Date(Date.now() - 5 * 60000), // 5 minutes ago
        read: false
      },
      {
        id: 2,
        tableNumber: 2,
        message: 'Pedido listo para entregar',
        time: new Date(Date.now() - 15 * 60000), // 15 minutes ago
        read: false
      },
      {
        id: 3,
        tableNumber: 8,
        message: 'Modificación en el pedido',
        time: new Date(Date.now() - 30 * 60000), // 30 minutes ago
        read: true
      },
      {
        id: 4,
        tableNumber: 4,
        message: 'Mesa solicitando la cuenta',
        time: new Date(Date.now() - 45 * 60000), // 45 minutes ago
        read: true
      }
    ];
    
    // Count unread notifications
    this.updateUnreadCount();
  }
  
  loadNavigation(): void {
    // Navigation items for the hamburger menu
    this.navItems = [
      { name: 'Inicio', icon: 'bi-house', route: '/home' },
      { name: 'Pedidos', icon: 'bi-list-ul', route: '/orders' },
      { name: 'Mesas', icon: 'bi-grid', route: '/tables' },
      { name: 'Menú', icon: 'bi-book', route: '/menu' },
      { name: 'Configuración', icon: 'bi-gear', route: '/settings' },
      { name: 'Reportes', icon: 'bi-bar-chart', route: '/reports' },
      { name: 'Usuarios', icon: 'bi-people', route: '/users' },
      { name: 'Cerrar Sesión', icon: 'bi-box-arrow-right', route: '/logout' }
    ];
  }

  updateUnreadCount(): void {
    this.unreadNotifications = this.notifications.filter(n => !n.read).length;
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
    
    // Mark notifications as read when opened
    if (this.notificationsOpen) {
      this.notifications.forEach(notification => {
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

  toggleItemStatus(order: Order, item: OrderItem): void {
    if (item.status === 'delivered') {
      // Unmark as delivered - return to previous status
      item.status = item.previousStatus || 'ready';
      
      Swal.fire({
        title: 'Estado restaurado',
        text: `${item.name} ha vuelto al estado: ${this.getStatusText(item.status)}`,
        icon: 'info',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      // Mark as delivered
      item.previousStatus = item.status; // Store current status before changing
      item.status = 'delivered';
      
      Swal.fire({
        title: 'Item entregado',
        text: `${item.name} marcado como entregado`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
    
    // Check if all items are now delivered
    this.checkAllDelivered(order);
  }

  markAllAsDelivered(order: Order): void {
    let changedItems = 0;
    
    // Mark all items as delivered
    order.items.forEach(item => {
      if (item.status !== 'delivered') {
        item.previousStatus = item.status; // Store current status
        item.status = 'delivered';
        changedItems++;
      }
    });
    
    if (changedItems > 0) {
      Swal.fire({
        title: '¡Pedido completado!',
        text: `Todos los items del pedido #${order.id} han sido marcados como entregados`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } else {
      Swal.fire({
        title: 'Información',
        text: `Todos los items ya estaban entregados`,
        icon: 'info',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  checkAllDelivered(order: Order): void {
    const allDelivered = order.items.every(i => i.status === 'delivered');
    
    if (allDelivered) {
      Swal.fire({
        title: '¡Pedido completado!',
        text: `El pedido #${order.id} ha sido entregado por completo`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    }
  }

  markNotificationAsRead(notification: Notification): void {
    notification.read = true;
    this.updateUnreadCount();
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diffMinutes = Math.round((now.getTime() - date.getTime()) / (1000 * 60));
    
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
      case 'preparing': return 'text-danger';
      case 'ready': return 'text-warning';
      case 'delivered': return 'text-success';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      default: return '';
    }
  }

  getOrderByTable(tableNumber: number): Order | undefined {
    return this.orders.find(order => order.tableNumber === tableNumber);
  }

  goToOrder(tableNumber: number): void {
    // Find the order with the matching table number
    const order = this.getOrderByTable(tableNumber);
    
    if (order) {
      // Close notifications and open sidebar
      this.notificationsOpen = false;
      this.sidebarOpen = true;
      
      // Expand the target order and collapse others
      this.orders.forEach(o => {
        o.expanded = (o.id === order.id);
      });
      
      // Scroll to the order
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
        showConfirmButton: false
      });
    }
  }
  
  navigate(route: string): void {
    // This would typically use the Angular Router
    // For demo purposes, we'll just show an alert
    Swal.fire({
      title: 'Navegación',
      text: `Navegando a: ${route}`,
      icon: 'info',
      timer: 1500,
      showConfirmButton: false
    });
    
    // Close the navigation sidebar
    this.navOpen = false;
  }
}