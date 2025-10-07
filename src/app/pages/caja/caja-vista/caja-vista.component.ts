import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-caja-vista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './caja-vista.component.html',
  styleUrls: ['./caja-vista.component.css']
})
export class CajaVistaComponent {
  modalAbierto = false;
  pedidoSeleccionado: any = null;

  pedidos = [
    {
      id: 1,
      mesa: 5,
      total: 280,
      productos: [
        { nombre: 'Hamburguesa', cantidad: 2, precio: 160 },
        { nombre: 'Refresco', cantidad: 2, precio: 120 }
      ]
    },
    {
      id: 2,
      mesa: 2,
      total: 100,
      productos: [
        { nombre: 'Papas', cantidad: 1, precio: 40 },
        { nombre: 'Agua', cantidad: 2, precio: 60 }
      ]
    }
  ];

  abrirModal(pedido: any) {
    this.pedidoSeleccionado = pedido;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.pedidoSeleccionado = null;
  }

  cobrar() {
    alert(`Cobrado el pedido #${this.pedidoSeleccionado?.id}`);
    this.cerrarModal();
  }
}
