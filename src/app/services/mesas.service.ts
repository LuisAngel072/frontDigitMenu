// src/services/mesas.service.ts (Frontend)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environment';

export interface Mesa {
  id_mesa: number;
  no_mesa: number;
  qr_code_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class MesasService {
  
  constructor(private http: HttpClient) { }

  async obtenerMesas(): Promise<Mesa[]> {
    console.log(`${environment.ApiIP}/mesas`);
    
    try {
      // Usando firstValueFrom para convertir el Observable a Promise
      return await firstValueFrom(this.http.get<Mesa[]>(`${environment.ApiIP}mesas`));
    } catch (error) {
      console.error('Error al obtener mesas:', error);
      throw error;
    }
  }

  async obtenerMesaPorNumero(noMesa: number): Promise<Mesa> {
    try {
      return await firstValueFrom(this.http.get<Mesa>(`${environment.ApiIP}/mesas/${noMesa}`));
    } catch (error) {
      console.error(`Error al obtener mesa ${noMesa}:`, error);
      throw error;
    }
  }

  async verificarPedidosActivos(noMesa: number): Promise<boolean> {
    try {
      // Esta es una llamada de ejemplo, ajusta según tu API real
      return await firstValueFrom(this.http.get<boolean>(`${environment.ApiIP}/pedidos/mesa/${noMesa}/activo`));
    } catch (error) {
      console.error(`Error al verificar pedidos activos de mesa ${noMesa}:`, error);
      // En caso de error, asumimos que no hay pedidos activos
      return false;
    }
  }
}