import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';

@Component({
  selector: 'app-cocinero',
  templateUrl: './cocinero.component.html',
  styleUrls: ['./cocinero.component.css'],
})
export class CocineroComponent implements OnInit {
  mesas: any[] = [];  // Definimos un array para almacenar las mesas y pedidos

  constructor(private pedidosService: PedidosService) {}

  ngOnInit(): void {
    // Llamamos a la API para obtener los pedidos de las mesas
    this.pedidosService.getPedidos().subscribe({
      next: (data) => {
        this.mesas = data; // Asignamos los datos a la variable mesas
      },
      error: (error) => {
        console.error('Error al obtener los pedidos:', error); // Manejamos el error
      }
    });
  }

  // Marcar un pedido como realizado
  marcarComoElaborado(pedidoId: number, numeroMesa: number): void {
    this.pedidosService.cambiarEstadoProducto(pedidoId, { estado: 'preparado' }).subscribe({
      next: (response) => {
        console.log('Pedido marcado como elaborado:', response);
        this.refreshMesa(numeroMesa);  // Actualizamos la mesa después de marcar el pedido
      },
      error: (error) => {
        console.error('Error al cambiar el estado del pedido:', error); // Manejamos el error
      }
    });
  }

  // Actualizar la mesa después de cambiar el estado de un pedido
  refreshMesa(numeroMesa: number): void {
    this.pedidosService.getPedidos().subscribe({
      next: (data) => {
        this.mesas = data;  // Actualiza la lista de mesas
      },
      error: (error) => {
        console.error('Error al actualizar los pedidos:', error); // Manejamos el error
      }
    });
  }
}
