import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Pedidos } from '../../interfaces/types';
import { firstValueFrom } from 'rxjs';

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
          // Buscamos el pedido iniciado
          this.pedido = await this.pedidosService.getPedidoIniciadoByNoMesa(no_mesa);
          console.log('📋 Pedido encontrado:', this.pedido);
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
      if (this.pedido === null) {
        // No existe pedido iniciado, lo creamos
        console.log('🆕 No existe pedido, creando uno nuevo...');
        
        // 🔧 CORREGIDO: Convertimos Observable a Promise
        await firstValueFrom(this.pedidosService.crearNuevoPedido(no_mesa));
        console.log('✅ Pedido creado exitosamente');
      } else {
        console.log('✅ Usando pedido existente:', this.pedido.id_pedido);
      }

      // Navegamos al menú
      this.router.navigate(['/clientes-menu'], {
        queryParams: { mesa: this.mesaId }
      });
      
    } catch (error) {
      console.error('❌ Error al crear pedido o navegar:', error);
      // Opcional: mostrar mensaje de error al usuario
    }
  }
}