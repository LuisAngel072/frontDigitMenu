// cocina-gateway.service.ts (Frontend - Corregido)

import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environment'; // Asegúrate que la ruta sea correcta
import { Producto_extras_ingrSel } from '../interfaces/types'; // Importa la interfaz correcta

@Injectable({
  providedIn: 'root',
})
export class CocinaSocketService {
  private socket: Socket;
  private readonly serverUrl = environment.ApiIP.replace('/api/', ''); // Conecta a la URL base

  constructor() {
    this.socket = io(this.serverUrl);
    console.log(`🔌 CocinaSocketService conectando a: ${this.serverUrl}`);

    // Listeners básicos para depuración
    this.socket.on('connect', () =>
      console.log('Socket conectado:', this.socket.id)
    );
    this.socket.on('disconnect', (reason) =>
      console.log('Socket desconectado:', reason)
    );
    this.socket.on('connect_error', (err) =>
      console.error('Error de conexión Socket:', err)
    );
  }

  /**
   * Escucha el evento 'nuevoProducto' emitido por el backend.
   * @returns Un Observable que emite los datos del nuevo producto (Producto_extras_ingrSel).
   */
  onNuevoProducto(): Observable<Producto_extras_ingrSel> {
    return new Observable((subscriber) => {
      this.socket.on('nuevoProducto', (data: Producto_extras_ingrSel) => {
        console.log("📨 Socket recibió 'nuevoProducto':", data);
        subscriber.next(data);
      });
      // Limpieza al desuscribirse
      return () => {
        this.socket.off('nuevoProducto');
      };
    });
  }

  /**
   * Escucha el evento 'estadoActualizado' emitido por el backend.
   * @returns Un Observable que emite los datos del producto actualizado (Producto_extras_ingrSel).
   */
  onEstadoActualizado(): Observable<Producto_extras_ingrSel> {
    return new Observable((subscriber) => {
      this.socket.on('estadoActualizado', (data: Producto_extras_ingrSel) => {
        console.log("📨 Socket recibió 'estadoActualizado':", data);
        subscriber.next(data);
      });
      // Limpieza al desuscribirse
      return () => {
        this.socket.off('estadoActualizado');
      };
    });
  }

  /**
   * Desconecta el socket. Llamar en ngOnDestroy del componente.
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🔌 Socket desconectado manualmente.');
    }
  }
}
