import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { CommonModule } from '@angular/common';

interface Pedido {
  id_pedido: number;
  fecha_pedido: string;
  total: string | null;
  estado: string;
}

@Component({
  selector: 'app-cocinero',
  standalone: true,
  templateUrl: './cocinero.component.html',
  styleUrls: ['./cocinero.component.css'],
  imports: [CommonModule]
})
export class CocineroComponent implements OnInit {
  pedidos: Pedido[] = [];

  constructor(private pedidosService: PedidosService) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.pedidosService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        console.log('Pedidos cargados:', this.pedidos);
      },
      error: (error) => {
        console.error('Error al obtener los pedidos:', error);
      }
    });
  }

  marcarComoElaborado(pedidoId: number): void {
    this.pedidosService.cambiarEstadoProducto(pedidoId, { estado: 'preparado' }).subscribe({
      next: (response) => {
        console.log('Pedido marcado como elaborado:', response);
        this.cargarPedidos(); // Recargamos los pedidos para actualizar la vista
      },
      error: (error) => {
        console.error('Error al cambiar el estado del pedido:', error);
      }
    });
  }
}