import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environment';
import { lastValueFrom } from 'rxjs';
import { ProductosDto } from '../dtos';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  constructor(
    private http: HttpClient,
    private readonly authService: AuthService
  ) {}

  async obtenerProductos() {
    try {
      const response$ = this.http.get<any>(
        environment.ApiIP + environment.ApiObtenerProductos,
        {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      );
      const response = lastValueFrom(response$);
      console.log(response);
      return response;
    } catch (error) {
      console.error(
        'Error al obtener un usuario. ERROR -> usuarios.service.ts -> obtenerUsuario()',
        error
      );
      throw error;
    }
  }

  async obtenerProducto(id_prod: number) {
    try {
      const response$ = this.http.get<any>(
        environment.ApiIP + environment.ApiObtenerProducto + id_prod,
        {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      );
      const response = lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        `Error al obtener el producto con id ${id_prod} en productos.service`,
        error
      );
      throw error;
    }
  }

  async obtenerExtrasDeProducto(id_prod: number) {
    try {
      const response$ = this.http.get<any>(
        environment.ApiIP +
          environment.ApiObtenerExtrasDeProducto +
          id_prod,
        {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      );
      const response = lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        `Error al obtener extras del producto con id ${id_prod} en productos.service`,
        error
      );
      throw error;
    }
  }

  async obtenerOpcionesDeProducto(id_prod: number) {
    try {
      const response$ = this.http.get<any>(
        environment.ApiIP +
          environment.ApiObtenerOpcionesDeProducto +
          id_prod,
        {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      );
      const response = lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        `Error al obtener opciones del producto con id ${id_prod} en productos.service`,
        error
      );
      throw error;
    }
  }

  async obtenerIngredientesDeProducto(id_prod: number) {
    try {
      const response$ = this.http.get<any>(
        environment.ApiIP +
          environment.ApiObtenerIngredientesDeProducto +
          id_prod,
        {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      );
      const response = lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        `Error al obtener ingredientes del producto con id ${id_prod} en productos.service`,
        error
      );
      throw error;
    }
  }

  async registrarProducto(body: ProductosDto) {
    try {
      const response$ = this.http.post<any>(
        environment.ApiIP + environment.ApiRegistrarProducto,
        body,
        {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      );
      const response = lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        `Error al registrar producto con body: ${body} en productos.service`,
        error
      );
      throw error;
    }
  }

  async actualizarProducto(id_prod: number, body: ProductosDto) {
    try {
      const response$ = this.http.patch<any>(
        environment.ApiIP + environment.ApiActualizarProducto + id_prod,
        body,
        {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      );
      const response = lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        `Error al actualizar producto con id: ${id_prod} y con body: ${body} en productos.service`,
        error
      );
      throw error;
    }
  }

  async eliminarProducto(id_prod: number) {
    try {
      const response$ = this.http.delete<any>(
        environment.ApiIP + environment.ApiEliminarProducto + id_prod,
        {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      );
      const response = lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        `Error al eliminar el producto con id: ${id_prod}`,
        error
      );
      throw error;
    }
  }

 async subirImg(file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file); // 'file' debe coincidir con el nombre del campo en el FileInterceptor
      // Construir la URL completa usando la variable de entorno
      const url = `${environment.ApiIP + environment.ApiSubirImgProducto}`;
      // Realizar la petición POST y devolver el Observable
      return await lastValueFrom(this.http.post<any>(url, formData));
    } catch (error) {
      console.error(
        'Error al subir la imagen. ERROR -> productos.service.ts -> subirImg()',
        error
      );
      throw error;
    }
  }
}
