// meseros.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaPedidosComponent } from '../comun-componentes/lista-pedidos/lista-pedidos.component';
import Swal from 'sweetalert2';
import { MesasService, Mesa } from '../../services/mesas.service';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-meseros',
  templateUrl: './meseros.component.html',
  styleUrls: ['./meseros.component.scss'],
  standalone: true,
  imports: [CommonModule, ListaPedidosComponent, QRCodeModule]
})
export class MeserosComponent implements OnInit {
  @ViewChild(ListaPedidosComponent) listaPedidos!: ListaPedidosComponent;
  
  mesas: Mesa[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private mesasService: MesasService) {}

  ngOnInit(): void {
    this.cargarMesas();
  }

  cargarMesas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.mesasService.obtenerMesas()
      .then(mesas => {
        this.mesas = mesas;
        console.log('Mesas cargadas:', mesas);
      })
      .catch(error => {
        console.error('Error al cargar mesas:', error);
        this.errorMessage = 'No se pudieron cargar las mesas. Por favor, intente nuevamente.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las mesas.',
        });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  // tieneOrdenesActivas(mesa: Mesa): boolean {
  //   // Para ahora, valor aleatorio
  //   return Math.random() > 0.5;
  // }

  verPedidos(mesa: Mesa): void {
    // Usar el método existente del componente padre para ir al pedido específico
    if (this.listaPedidos) {
      this.listaPedidos.goToOrder(mesa.no_mesa);
    }
  }

  crearPedido(mesa: Mesa): void {
    Swal.fire({
      title: 'Crear Pedido',
      text: `¿Deseas crear un nuevo pedido para la mesa ${mesa.no_mesa}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          '¡Pedido creado!',
          `Se ha iniciado un nuevo pedido para la mesa ${mesa.no_mesa}.`,
          'success'
        );
      }
    });
  }
}