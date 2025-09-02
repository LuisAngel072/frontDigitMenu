// meseros.component.ts
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ListaPedidosComponent } from '../comun-componentes/lista-pedidos/lista-pedidos.component';
import Swal from 'sweetalert2';
import { MesasService, Mesa } from '../../services/mesas.service';
import { NotificacionesService, Notificacion } from '../../services/notificaciones.service';
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
      cancelButtonText: 'Cerrar'
    });
  }

  verPedidos(mesa: Mesa): void {
    if (this.listaPedidos) {
      this.listaPedidos.goToOrder(mesa.no_mesa);
    }
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