import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environment';
import { lastValueFrom } from 'rxjs';
import { Opciones } from '../interfaces/types';
import { OpcionesDTO } from '../interfaces/dtos';

@Injectable({
  providedIn: 'root',
})
export class OpcionesService {
  constructor(
    private http: HttpClient,
    private readonly authService: AuthService
  ) {}

  async getOpciones(): Promise<Opciones[]> {
    try {
      const response$ = this.http.get<Opciones[]>(
        environment.ApiIP + environment.ApiObtenerOpciones,
        { headers: { Authorization: `Bearer ${this.authService.getToken()}` } }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        'Error al obtener las opciones. ERROR -> opciones.service.ts -> getOpciones()',
        error
      );
      throw error;
    }
  }

  async crearOpcion(body: OpcionesDTO): Promise<Opciones> {
    try {
      const response$ = this.http.post<Opciones>(
        environment.ApiIP + environment.ApiCrearOpcion,
        body,
        {
          responseType: 'text' as 'json',
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        'Error inesperado en opciones.service.ts -> crearOpcion()',
        error
      );
      throw error;
    }
  }

  async upOpcion(id_opcion: number, body: OpcionesDTO) {
    try {
      const response$ = this.http.patch<any>(
        environment.ApiIP + environment.ApiActualizarOpcion + id_opcion,
        body,
        {
          responseType: 'text' as 'json',
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        'Error inesperado en opciones.service.ts -> upOpcion()',
        error
      );
      throw error;
    }
  }

  async delOpcion(id_opcion: number) {
    try {
      const response$ = this.http.delete<any>(
        environment.ApiIP + environment.ApiEliminarOpcion + id_opcion,
        {
          responseType: 'text' as 'json',
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        'Error inesperado en opciones.service.ts -> delOpcion()',
        error
      );
      throw error;
    }
  }
}
