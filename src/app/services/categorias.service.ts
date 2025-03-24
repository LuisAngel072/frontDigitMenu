import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';
import { CategoriasDTO } from '../dtos';

@Injectable({
  providedIn: 'root',
})
export class CategoriasService {
  constructor(
    private http: HttpClient,
    private readonly authService: AuthService
  ) {}

  async getCategorias() {
    try {
      const response$ = this.http.get<any>(
        environment.ApiIP + environment.ApiObtenerCategorias,
        { headers: { Authorization: `Bearer ${this.authService.getToken()}` } }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        'Error al obtener las categorías. ERROR -> getCategorias.service.ts -> obtenerCategorias()',
        error
      );
      throw error;
    }
  }

  async crearCategoria(body: CategoriasDTO) {
    try {
      const response$ = this.http.post<any>(
        environment.ApiIP + environment.ApiRegistrarCategoria,
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
        'Error inesperado en categorias.service.ts -> crearCategoria()',
        error
      );
      throw error;
    }
  }

  async upCategoria(id_cat: number, body: CategoriasDTO) {
    try {
      const response$ = this.http.patch<any>(
        environment.ApiIP + environment.ApiEditarCategoria + id_cat,
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
        'Error inesperado en categorias.service.ts -> upCategoria()',
        error
      );
      throw error;
    }
  }

  async delCategoria(id_cat: number) {
    try {
      const response$ = this.http.delete<any>(
        environment.ApiIP + environment.ApitEliminarCategoria + id_cat,
        {
          responseType: 'text' as 'json',
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      const response = await lastValueFrom(response$);
      return response; 
    } catch (error) {
      console.error(
        'Error inesperado en categorias.service.ts -> delCategoria()',
        error
      );
      throw error;
    }
  }
}
