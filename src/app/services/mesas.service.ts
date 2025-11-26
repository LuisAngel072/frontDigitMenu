import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
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
    try {
      const response$ = this.http.get<Mesa[]>(
        `${environment.ApiIP}${environment.ApiObtenerMesas}`
      );
      return await lastValueFrom(response$);
    } catch (error) {
      console.error('Error al obtener mesas:', error);
      throw error;
    }
  }

  async crearMesa(noMesa: number, qrCodeUrl: string): Promise<Mesa> {
    try {
      const response$ = this.http.post<Mesa>(
        `${environment.ApiIP}${environment.ApiCrearMesa}`,
        { no_mesa: noMesa, qr_code_url: qrCodeUrl }
      );
      return await lastValueFrom(response$);
    } catch (error) {
      console.error('Error al crear mesa:', error);
      throw error;
    }
  }

  async eliminarMesa(noMesa: number): Promise<any> {
    try {
      const response$ = this.http.delete<any>(
        `${environment.ApiIP}${environment.ApiEliminarMesa}${noMesa}`
      );
      return await lastValueFrom(response$);
    } catch (error) {
      console.error('Error al eliminar mesa:', error);
      throw error;
    }
  }
}