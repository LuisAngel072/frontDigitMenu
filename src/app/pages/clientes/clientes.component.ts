import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Pedidos } from '../../interfaces/types';
/**
 * Componente de pantalla de clientes. Da primero un mensaje de bienvenida al sistema.
 */
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

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      this.mesaId = params['mesa'];
      if (this.mesaId) {
        console.log('🔍 Mesa ID recibida:', this.mesaId);
        const no_mesa: number = parseInt(this.mesaId);

        try {
          // Buscar pedido ACTIVO (no pagado) usando el nuevo método
          this.pedido = await this.pedidosService.getPedidoActivoByNoMesa(no_mesa);

          if (this.pedido) {
            console.log('📋 Pedido activo encontrado:', this.pedido);
          } else {
            console.log('ℹ️ No hay pedido activo, se creará uno nuevo');
          }
        } catch (error) {
          console.error('❌ Error al buscar pedido:', error);
          this.pedido = null;
        }
      }
    });
  }

  async goToClientesMenu(): Promise<void> {
    if (!this.mesaId) {
      console.error('❌ No hay ID de mesa disponible');
      return;
    }

    const no_mesa: number = parseInt(this.mesaId);
    console.log('🚀 Navegando al menú para mesa:', no_mesa);

    try {
      // Si no hay pedido activo (null, pagado o inexistente), crear uno nuevo
      if (this.pedido === null) {
        console.log('No existe pedido activo, creando uno nuevo...');
        const response = await this.pedidosService.crearNuevoPedido(no_mesa).toPromise();
        console.log('Pedido creado exitosamente:', response);
      } else {
        console.log('Usando pedido existente:', this.pedido.id_pedido);
      }

      // Navegar al menú
      this.router.navigate(['/clientes-menu'], {
        queryParams: { mesa: this.mesaId }
      });
    } catch (error) {
      console.error('❌ Error al crear pedido o navegar:', error);
    }
  }
}
