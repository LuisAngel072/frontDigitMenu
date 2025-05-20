import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Pedidos } from '../../types';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
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
    if (this.mesaId !== null) {
      this.pedido = await this.pedidosService.getPedidoIniciadoByNoMesa(
        parseInt(this.mesaId)
      );
    }
  }

  async goToClientesMenu() {
    this.router.navigate(['/clientes-menu'], {
      queryParams: { mesa: this.mesaId },
    });
    if (this.pedido === null) {
      if (this.mesaId !== null) {
        await this.pedidosService.crearNuevoPedido(parseInt(this.mesaId));
      }
    }
  }
}
