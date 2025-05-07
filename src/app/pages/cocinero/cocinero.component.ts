import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Importa CommonModule para usar *ngFor y *ngIf

export interface Pedido {
  id: number;
  nombre: string;
  cantidad: number;
  elaborado: boolean;
}

export interface Mesa {
  numero: number;
  pedidos: Pedido[];
}

@Component({
  selector: 'app-cocinero',
  standalone: true,  // Esto asegura que el componente sea independiente
  templateUrl: './cocinero.component.html',
  styleUrls: ['./cocinero.component.css'],
  imports: [CommonModule]  // Agrega CommonModule para habilitar *ngFor y *ngIf
})
export class CocineroComponent {
  mesas: Mesa[] = [
    {
      numero: 1,
      pedidos: [
        { id: 1, nombre: 'Pizza', cantidad: 2, elaborado: false },
        { id: 2, nombre: 'Ensalada', cantidad: 1, elaborado: false }
      ]
    },
    {
      numero: 2,
      pedidos: [
        { id: 3, nombre: 'Hamburguesa', cantidad: 3, elaborado: false },
        { id: 4, nombre: 'Papas Fritas', cantidad: 1, elaborado: false }
      ]
    },
    {
      numero: 3,
      pedidos: [
        { id: 5, nombre: 'Tacos', cantidad: 5, elaborado: false },
        { id: 6, nombre: 'Bebida', cantidad: 3, elaborado: false }
      ]
    }
  ];

  // Función para marcar un pedido como elaborado
  marcarComoElaborado(pedidoId: number, numeroMesa: number) {
    const mesa = this.mesas.find(mesa => mesa.numero === numeroMesa);
    if (mesa) {
      const pedido = mesa.pedidos.find(p => p.id === pedidoId);
      if (pedido) {
        pedido.elaborado = true;
        alert(`Pedido ${pedido.nombre} marcado como elaborado.`);
      }
    }
  }

  // Función para confirmar los pedidos de la mesa
  confirmarElaborado(numeroMesa: number) {
    const mesa = this.mesas.find(mesa => mesa.numero === numeroMesa);
    if (mesa) {
      mesa.pedidos = mesa.pedidos.filter(pedido => !pedido.elaborado);
      alert(`Los pedidos de la Mesa ${numeroMesa} han sido confirmados.`);
    }
  }
}
