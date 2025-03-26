import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment'; // Importa tus variables de entorno
import { AuthService } from './auth.service'; // Asegúrate de que el AuthService esté correctamente importado
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubcategoriaService {
  private baseUrl = environment.ApiIP;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Obtener todas las subcategorías de manera asincrónica.
   */
  async obtenerSubcategorias(): Promise<any> {
    try {
      const response$ = this.http.get<any>(
        `${this.baseUrl}${environment.ApiObtenerSubCategorias}`,
        {
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error('Error al obtener las subcategorías', error);
      throw error;
    }
  }

  /**
   * Obtener una subcategoría específica de manera asincrónica.
   */
  async obtenerSubcategoria(id: string): Promise<any> {
    try {
      const url = `${this.baseUrl}${environment.ApiObtenerSubCategoria.replace(':id_subcat', id)}`;
      const response$ = this.http.get<any>(url, {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` },
      });
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error('Error al obtener la subcategoría', error);
      throw error;
    }
  }

  /**
   * Registrar una nueva subcategoría de manera asincrónica.
   */
  async registrarSubcategoria(subcategoria: any): Promise<any> {
    try {
      const response$ = this.http.post<any>(
        `${this.baseUrl}${environment.ApiRegistrarSubCategoria}`,
        subcategoria,
        {
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error('Error al registrar la subcategoría', error);
      throw error;
    }
  }

  /**
   * Editar una subcategoría existente de manera asincrónica.
   */
  async editarSubcategoria(id_subcat: number, subcategoria: any): Promise<any> {
    try {
      const url = `${this.baseUrl}${environment.ApiEditarSubCategoria.replace(':id_subcat', id_subcat.toString())}`;
      const response$ = this.http.patch<any>(url, subcategoria, {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` },
      });
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error('Error al editar la subcategoría', error);
      throw error;
    }
  }

  /**
   * Eliminar una subcategoría de manera asincrónica.
   */
  async eliminarSubcategoria(id: number): Promise<any> {
    try {
      const url = `${this.baseUrl}${environment.ApitEliminarSubCategoria.replace(':id_subcat', id.toString())}`;
      const response$ = this.http.delete<any>(url, {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` },
      });
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error('Error al eliminar la subcategoría', error);
      throw error;
    }
  }
}
