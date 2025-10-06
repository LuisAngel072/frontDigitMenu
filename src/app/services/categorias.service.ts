import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment';
import { AuthService } from './auth.service';
import { lastValueFrom, Observable } from 'rxjs';
import { CategoriasDTO } from '../interfaces/dtos';
import { Categorias } from '../interfaces/types';

@Injectable({
  providedIn: 'root',
})
export class CategoriasService {
  constructor(
    private http: HttpClient,
    private readonly authService: AuthService
  ) {}

  async getCategorias(): Promise<Categorias[]> {
    try {
      const response = this.http.get<any>(environment.ApiIP + environment.ApiObtenerCategorias).toPromise()
      return response;
    } catch (error) {
      console.error('Error inesperado al intentar obtener las categorias -> getCategorias()', error)
      throw error;
    }
  }

  crearCategoria(body: CategoriasDTO): Observable<Categorias> {
    try {
      const response$ = this.http.post<any>(
        environment.ApiIP + environment.ApiRegistrarCategoria,
        body,
        {
          responseType: 'text' as 'json',
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      return response$;
    } catch (error) {
      console.error(
        'Error inesperado en categorias.service.ts -> crearCategoria()',
        error
      );
      throw error;
    }
  }

  upCategoria(id_cat: number, body: CategoriasDTO): Observable<any> {
    try {
      const response$ = this.http.patch<any>(
        environment.ApiIP + environment.ApiEditarCategoria + id_cat,
        body,
        {
          responseType: 'text' as 'json',
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      return response$;
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
  subirImg(file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file); // 'file' debe coincidir con el nombre del campo en el FileInterceptor
      // Construir la URL completa usando la variable de entorno
      const url = `${environment.ApiIP}categorias/subir-img_cat`;
      // Realizar la petición POST y devolver el Observable
      return this.http.post<any>(url, formData);
    } catch (error) {
      console.error(
        'Error al subir la imagen. ERROR -> categorias.service.ts -> subirImg()',
        error
      );
      throw error;
    }
  }
}
