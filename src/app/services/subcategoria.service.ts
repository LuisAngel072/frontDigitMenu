import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment'; // Importa tus variables de entorno

@Injectable({
  providedIn: 'root',
})
export class SubcategoriaService {
  private baseUrl = environment.ApiIP;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las subcategorías de manera asincrónica.
   */
  async obtenerSubcategorias(): Promise<any> {
    try {
      const response = await this.http.get(`${this.baseUrl}${environment.ApiObtenerSubCategorias}`).toPromise();
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
      const response = await this.http.get(url).toPromise();
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
      const response = await this.http.post(`${this.baseUrl}${environment.ApiRegistrarSubCategoria}`, subcategoria).toPromise();
      return response;
    } catch (error) {
      console.error('Error al registrar la subcategoría', error);
      throw error;
    }
  }

  /**
   * Editar una subcategoría existente de manera asincrónica.
   */
// En SubcategoriaService, cambiar el tipo de id_subcat a number
async editarSubcategoria(id_subcat: number, subcategoria: any): Promise<any> {
  try {
    const url = `${this.baseUrl}${environment.ApiEditarSubCategoria.replace(':id_subcat', id_subcat.toString())}`;
    const response = await this.http.patch(url, subcategoria).toPromise();
    return response;
  } catch (error) {
    console.error('Error al editar la subcategoría', error);
    throw error;
  }
}

  /**
   * Eliminar una subcategoría de manera asincrónica.
   */
// En SubcategoriaService, cambiar el tipo de id_subcat a number
async eliminarSubcategoria(id: number): Promise<any> {
  try {
    const url = `${this.baseUrl}${environment.ApitEliminarSubCategoria.replace(':id_subcat', id.toString())}`;  // Convertir a string para la URL
    const response = await this.http.delete(url).toPromise();
    return response;
  } catch (error) {
    console.error('Error al eliminar la subcategoría', error);
    throw error;
  }
}

}
