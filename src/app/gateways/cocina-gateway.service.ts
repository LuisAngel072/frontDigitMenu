// cocina-socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Pedidos_has_productos } from '../interfaces/types';

@Injectable({
  providedIn: 'root',
})
export class CocinaSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000'); // URL del backend
  }

  onNuevoPedido(): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on('nuevoPedido', (data: Pedidos_has_productos) => {
        subscriber.next(data);
      });
    });
  }

  onPedidoActualizado(): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on('pedido_actualizado', (data) => {
        subscriber.next(data);
      });
    });
  }
}
