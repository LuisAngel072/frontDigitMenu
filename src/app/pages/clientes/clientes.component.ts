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
    if (this.pedido === null) { // No existe el pedido iniciado
      if (this.mesaId !== null && this.mesaId !== undefined ) {
        const no_mesa: number = parseInt(this.mesaId);
        await this.pedidosService.crearNuevoPedido(no_mesa); //Lo crea
        this.router.navigate(['/clientes-menu'], {
          queryParams: { mesa: this.mesaId },
        });
      }
    } else {
      this.router.navigate(['/clientes-menu'], {
          queryParams: { mesa: this.mesaId },
        });
    }
  }
}
