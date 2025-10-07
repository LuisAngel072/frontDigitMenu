import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Pedidos } from '../../interfaces/types';

@Component({
    selector: 'app-clientes',
    standalone: true,
    templateUrl: './clientes.component.html',
    styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  mesaId: string | null = null;
  pedido: Pedidos | null = null;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly pedidosService: PedidosService
  ) {}

  async ngOnInit() {
    // Obtener el parámetro "mesa" de la URL
    this.route.queryParams.subscribe((params) => {
      this.mesaId = params['mesa'];
    });

    if (this.mesaId !== null && this.mesaId !== undefined) {
       const no_mesa: number = parseInt(this.mesaId);
      this.pedido = await this.pedidosService.getPedidoIniciadoByNoMesa(
        no_mesa
      );
    }
  }

  async goToClientesMenu() {
    if (!this.mesaId) {
      console.error('No hay mesa seleccionada');
      return;
    }

    try {
      const no_mesa: number = parseInt(this.mesaId);
      
      // Verificamos nuevamente por si acaso
      let pedidoActual = await this.pedidosService.getPedidoIniciadoByNoMesa(no_mesa);
      
      if (!pedidoActual) {
        console.log('Creando nuevo pedido para mesa:', no_mesa);
        await this.pedidosService.crearNuevoPedido(no_mesa).toPromise();
        
        // Pequeña pausa para asegurar que el pedido se creó
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificamos que se creó correctamente
        pedidoActual = await this.pedidosService.getPedidoIniciadoByNoMesa(no_mesa);
        
        if (!pedidoActual) {
          throw new Error('No se pudo crear el pedido');
        }
      }
      
      console.log('Navegando al menú con pedido ID:', pedidoActual.id_pedido);
      
      this.router.navigate(['/clientes-menu'], {
        queryParams: { mesa: this.mesaId },
      });
      
    } catch (error) {
      console.error('Error al crear/obtener pedido:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }
}
