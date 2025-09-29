import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environment';
import { lastValueFrom, Observable } from 'rxjs';
import { SubcategoriasDTO } from '../interfaces/dtos';

@Injectable({
  providedIn: 'root',
})
export class SubcategoriasService {
  constructor(
    private http: HttpClient,
    private readonly authService: AuthService
  ) {}

  async obtenerSubcategorias() {
    try {
      const response$ = this.http.get<any>(
        environment.ApiIP + environment.ApiObtenerSubCategorias,
        {
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        'Error al obtener las categorías. ERROR -> getSubCategorias.service.ts -> obtenerSubCategorias()',
        error
      );
      throw error;
    }
  }

  registrarSubCategoria(body: SubcategoriasDTO): Observable<any> {
    try {
      const response$ = this.http.post<any>(
        environment.ApiIP + environment.ApiRegistrarSubCategoria,
        body,
        {
          responseType: 'text' as 'json',
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      return response$;
    } catch (error) {
      console.error(
        'Error inesperado en subcategorias.service.ts -> registrarCategoria()',
        error
      );
      throw error;
    }
  }

  editarSubCategoria(
    id_subcat: number,
    body: SubcategoriasDTO
  ): Observable<any> {
    try {
      const response$ = this.http.patch<any>(
        environment.ApiIP + environment.ApiEditarSubCategoria + id_subcat,
        body,
        {
          responseType: 'text' as 'json',
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      return response$;
    } catch (error) {
      console.error(
        'Error inesperado en subcategorias.service.ts -> editarSubCategoria()',
        error
      );
      throw error;
    }
  }

  async eliminarSubCategoria(id_subcat: number) {
    try {
      const response$ = this.http.delete<any>(
        environment.ApiIP + environment.ApitEliminarSubCategoria + id_subcat,
        {
          responseType: 'text' as 'json',
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        'Error inesperado en subcategorias.service.ts -> eliminarSubCategoria()',
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
      const url = `${environment.ApiIP}sub-categorias/subir-img_subcat`;
      // Realizar la petición POST y devolver el Observable
      return this.http.post<any>(url, formData);
    } catch (error) {
      console.error(
        'Error al subir la imagen. ERROR -> subcategorias.service.ts -> subirImg()',
        error
      );
      throw error;
    }
  }
}
