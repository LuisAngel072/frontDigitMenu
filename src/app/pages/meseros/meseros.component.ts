// meseros.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaPedidosComponent } from '../comun-componentes/lista-pedidos/lista-pedidos.component';
// import { PedidosService } from '../services/pedidos.service';

@Component({
  selector: 'app-meseros',
  templateUrl: './meseros.component.html',
  styleUrls: ['./meseros.component.scss'],
  standalone: true,
  imports: [CommonModule, ListaPedidosComponent],
  // providers: [PedidosService] // Add your services here
})
export class MeserosComponent {
  // Your meseros component properties and methods
}