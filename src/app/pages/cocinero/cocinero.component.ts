import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { Producto_extras_ingrSel } from '../../types';  // Ajusta la ruta según tu proyecto
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cocinero',
  standalone: true,
  templateUrl: './cocinero.component.html',
  styleUrls: ['./cocinero.component.css'],
  imports: [CommonModule]
})
export class CocineroComponent implements OnInit {
  pedidosConDetalle: Producto_extras_ingrSel[] = [];

  constructor(private pedidosService: PedidosService) {}

  ngOnInit(): void {
    const productoId = 9; // Cambia esto al id que necesites cargar
    this.cargarPedidosConExtras(productoId);
  }

  cargarPedidosConExtras(productoId: number): void {
    this.pedidosService.getExtrasIngrDeProducto(productoId).subscribe({
      next: (data) => {
        this.pedidosConDetalle = Array.isArray(data) ? data : [data];
        console.log('Pedidos con detalle cargados:', this.pedidosConDetalle);
      },
      error: (error) => {
        console.error('Error al cargar pedidos con extras:', error);
      }
    });
  }

  marcarComoElaborado(pedidoId: number): void {
    this.pedidosService.cambiarEstadoProducto(pedidoId, { estado: 'Preparado' }).subscribe({
      next: (response) => {
        console.log('Pedido marcado como elaborado:', response);
        // Puedes recargar los datos si quieres
        // this.cargarPedidosConExtras(algúnProductoId);
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
      }
    });
  }
}
