import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';  

export interface Pedido {
  id: number;
  nombre: string;
  cantidad: number;
  elaborado: boolean;
  ingredientes: string[];
  opciones: string[];
  extras: string[];
}

export interface Mesa {
  numero: number;
  pedidos: Pedido[];
  todosCompletados: boolean;
}

@Component({
  selector: 'app-cocinero',
  standalone: true,  
  templateUrl: './cocinero.component.html',
  styleUrls: ['./cocinero.component.css'],
  imports: [CommonModule, FormsModule]  
})
export class CocineroComponent {
  mesas = [
    { numero: 1, pedidos: [{ id: 1, nombre: 'Pizza', cantidad: 2, elaborado: false, ingredientes: ['Mushrooms', 'Cheese'], opciones: ['Large', 'Thin Crust'], extras: ['Extra cheese', 'Garlic sauce'] }], todosCompletados: false },
    { numero: 2, pedidos: [{ id: 2, nombre: 'Ensalada', cantidad: 1, elaborado: false, ingredientes: ['Lettuce', 'Tomato'], opciones: ['Small', 'Dressing on the side'], extras: ['Croutons'] }], todosCompletados: false },
    { numero: 3, pedidos: [{ id: 3, nombre: 'Tacos', cantidad: 3, elaborado: false, ingredientes: ['Beef', 'Lettuce'], opciones: ['Soft'], extras: ['Salsa'] }], todosCompletados: false },
    { numero: 4, pedidos: [{ id: 4, nombre: 'Sopa', cantidad: 1, elaborado: false, ingredientes: ['Broth', 'Vegetables'], opciones: ['Small'], extras: ['Lemon'] }], todosCompletados: false },
    // Más mesas pueden agregarse dinámicamente cuando se confirmen
  ];

  marcarComoElaborado(pedidoId: number, numeroMesa: number) {
    const mesa = this.mesas.find(m => m.numero === numeroMesa);
    if (mesa) {
      const pedido = mesa.pedidos.find(p => p.id === pedidoId);
      if (pedido) {
        pedido.elaborado = true;
      }
    }
  }

  confirmarElaborado(numeroMesa: number) {
    const mesa = this.mesas.find(m => m.numero === numeroMesa);
    if (mesa) {
      mesa.todosCompletados = mesa.pedidos.every(p => p.elaborado);
      if (mesa.todosCompletados) {
        this.agregarNuevoPedidoALaMesa();
      }
    }
  }

  agregarNuevoPedidoALaMesa() {
    const nuevaMesa: Mesa = {
      numero: this.mesas.length + 1,
      pedidos: [{ id: Date.now(), nombre: 'Nuevo Pedido', cantidad: 1, elaborado: false, ingredientes: ['Nuevo ingrediente'], opciones: ['Nueva opción'], extras: ['Nuevo extra'] }],
      todosCompletados: false
    };
    this.mesas.push(nuevaMesa);
  }

  checkAllPedidos(mesa: Mesa) {
    // Usamos el tipo Pedido para 'p'
    mesa.todosCompletados = mesa.pedidos.every((p: Pedido) => p.elaborado);  // Aquí estamos especificando que p es de tipo Pedido
  }
}
