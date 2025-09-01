// src/services/notificaciones.service.ts (Frontend)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environment';

export interface Notificacion {
  id_notf: number;
  mensaje: string;
  mesa_id: number;
  creado_en: string;
  estado: string;
  encargado_por?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  constructor(private http: HttpClient) {}

  // Cliente crea notificación
  async crearNotificacion(mensaje: string, mesa_id: number): Promise<Notificacion> {
    try {
      return await firstValueFrom(
        this.http.post<Notificacion>(`${environment.ApiIP}${environment.ApiCrearNotificacion}`, {
          mensaje,
          mesa_id
        })
      );
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  }

  // Mesero consulta notificaciones de su mesa
  async obtenerPorMesa(mesaId: number): Promise<Notificacion[]> {
    try {
      return await firstValueFrom(
        this.http.get<Notificacion[]>(`${environment.ApiIP}${environment.ApiObtenerNotificacionesPorMesa}${mesaId}`)
      );
    } catch (error) {
      console.error('Error al obtener notificaciones por mesa:', error);
      throw error;
    }
  }

  // Mesero atiende notificación
  async atenderNotificacion(id: number): Promise<Notificacion> {
    try {
      return await firstValueFrom(
        this.http.patch<Notificacion>(`${environment.ApiIP}${environment.ApiAtenderNotificacion}${id}/atender`, {})
      );
    } catch (error) {
      console.error('Error al atender notificación:', error);
      throw error;
    }
  }
}
