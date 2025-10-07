import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';
import { IngredientesDTO } from '../interfaces/dtos';
import { Ingredientes } from '../interfaces/types';

@Injectable({
  providedIn: 'root',
})
export class IngredientesService {
  constructor(
    private http: HttpClient,
    private readonly authService: AuthService
  ) {}

  async getIngredientes() {
    try {
      const response$ = this.http.get<any>(
        environment.ApiIP + environment.ApiObtenerIngredientes,
        { headers: { Authorization: `Bearer ${this.authService.getToken()}` } }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        'Error al obtener los ingredientes. ERROR -> getIngredientes.service.ts -> obtenerIngredientes()',
        error
      );
      throw error;
    }
  }

  async crearIngrediente(body: IngredientesDTO): Promise<Ingredientes> {
    try {
      console.log(body)
      const response$ = this.http.post<any>(
        environment.ApiIP + environment.ApiCrearIngrediente,
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
        'Error inesperado en ingredientes.service.ts -> crearIngrediente()',
        error
      );
      throw error;
    }
  }

  async upIngrediente(id_ingr: number, body: IngredientesDTO) {
    try {
      const response$ = this.http.patch<any>(
        environment.ApiIP + environment.ApiActualizarIngrediente + id_ingr,
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
        'Error inesperado en ingredientes.service.ts -> upIngrediente()',
        error
      );
      throw error;
    }
  }

  async delIngrediente(id_ingr: number) {
    try {
      const response$ = this.http.delete<any>(
        environment.ApiIP + environment.ApiEliminarIngrediente + id_ingr,
        {
          responseType: 'text' as 'json',
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        'Error inesperado en ingredientes.service.ts -> delIngrediente()',
        error
      );
      throw error;
    }

  }
}
