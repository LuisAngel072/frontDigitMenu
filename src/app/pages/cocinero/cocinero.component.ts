import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Para usar ngModel

// Modelo de Pedido
export interface Pedido {
  id: number;
  nombre: string;
  cantidad: number;
  elaborado: boolean;
  ingredientes: string[]; // Ingredientes seleccionados
  opciones: string[];     // Opciones seleccionadas (por ejemplo, tamaño, tipo de preparación)
  extras: string[];       // Extras seleccionados (por ejemplo, aderezos, salsas)
}

// Modelo de Mesa
export interface Mesa {
  numero: number;
  pedidos: Pedido[];
  todosCompletados: boolean;
}

@Component({
  selector: 'app-cocinero',
  standalone: true,  // Esto asegura que el componente sea independiente
  templateUrl: './cocinero.component.html',
  styleUrls: ['./cocinero.component.css'],
  imports: [CommonModule, FormsModule]  // Asegúrate de agregar CommonModule y FormsModule
})
export class CocineroComponent {
  mesas: Mesa[] = [
    { 
      numero: 1, 
      pedidos: [
        { 
          id: 1, 
          nombre: 'Pizza', 
          cantidad: 2, 
          elaborado: false,
          ingredientes: ['Mushrooms', 'Cheese'],
          opciones: ['Large', 'Thin Crust'],
          extras: ['Extra cheese', 'Garlic sauce']
        }
      ],
      todosCompletados: false
    },
    { 
      numero: 2, 
      pedidos: [
        { 
          id: 2, 
          nombre: 'Ensalada', 
          cantidad: 1, 
          elaborado: false,
          ingredientes: ['Lettuce', 'Tomato'],
          opciones: ['Small', 'Dressing on the side'],
          extras: ['Croutons']
        }
      ],
      todosCompletados: false
    },
    { 
      numero: 3, 
      pedidos: [
        { 
          id: 3, 
          nombre: 'Tacos', 
          cantidad: 3, 
          elaborado: false,
          ingredientes: ['Beef', 'Lettuce'],
          opciones: ['Soft'],
          extras: ['Salsa']
        }
      ],
      todosCompletados: false
    },
    { 
      numero: 4, 
      pedidos: [
        { 
          id: 4, 
          nombre: 'Sopa', 
          cantidad: 1, 
          elaborado: false,
          ingredientes: ['Broth', 'Vegetables'],
          opciones: ['Small'],
          extras: ['Lemon']
        }
      ],
      todosCompletados: false
    },
    { 
      numero: 5, 
      pedidos: [
        { 
          id: 5, 
          nombre: 'Hamburguesa', 
          cantidad: 2, 
          elaborado: false,
          ingredientes: ['Lettuce', 'Tomato', 'Cheese'],
          opciones: ['Large'],
          extras: ['Ketchup', 'Mustard']
        }
      ],
      todosCompletados: false
    },
    { 
      numero: 6, 
      pedidos: [
        { 
          id: 6, 
          nombre: 'Papitas Fritas', 
          cantidad: 3, 
          elaborado: false,
          ingredientes: ['Potatoes', 'Salt'],
          opciones: ['Medium'],
          extras: ['Ketchup']
        }
      ],
      todosCompletados: false
    }
  ];

  // Lógica para marcar todos los pedidos como elaborados
  marcarComoElaborado(numeroMesa: number) {
    const mesa = this.mesas.find(m => m.numero === numeroMesa);
    if (mesa) {
      // Marca todos los pedidos como realizados
      mesa.pedidos.forEach(pedido => pedido.elaborado = true);
      this.checkAllPedidos(mesa);
    }
  }

  // Confirmar si todos los pedidos están elaborados y agregar nueva mesa
  confirmarElaborado(numeroMesa: number) {
    const mesa = this.mesas.find(m => m.numero === numeroMesa);
    if (mesa) {
      mesa.todosCompletados = mesa.pedidos.every(p => p.elaborado);
      if (mesa.todosCompletados) {
        // Una vez todos los pedidos son confirmados, eliminamos la mesa de la vista.
        this.removerMesa(mesa.numero);
      }
    }
  }

  // Función para remover la mesa una vez que todos los pedidos están realizados
  removerMesa(numeroMesa: number) {
    this.mesas = this.mesas.filter(mesa => mesa.numero !== numeroMesa);
  }

  // Función para agregar nuevas mesas (cuando todas las anteriores son completadas)
  agregarNuevoPedidoALaMesa() {
    if (this.mesas.length >= 4) {
      this.mesas.shift(); // Eliminar la primera mesa si ya hay 4 mesas
    }
    const nuevaMesa: Mesa = {
      numero: this.mesas.length + 1,
      pedidos: [{ 
        id: Date.now(),
        nombre: 'Nuevo Pedido', 
        cantidad: 1, 
        elaborado: false,
        ingredientes: ['Nuevo ingrediente'],
        opciones: ['Nueva opción'],
        extras: ['Nuevo extra']
      }],
      todosCompletados: false
    };
    this.mesas.push(nuevaMesa); // Agrega la nueva mesa al final
  }

  // Verifica si todos los pedidos de la mesa están realizados
  checkAllPedidos(mesa: Mesa) {
    mesa.todosCompletados = mesa.pedidos.every((p: Pedido) => p.elaborado);
  }
}
