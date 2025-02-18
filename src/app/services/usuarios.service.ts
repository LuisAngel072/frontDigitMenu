import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import {
  Domicilios,
  Email,
  Img_us,
  NSS,
  RFC,
  Roles,
  Telefonos,
} from '../types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  constructor(
    private http: HttpClient,
    private readonly authService: AuthService
  ) {}

  async obtenerUnUsuario(codigo: string) {
    try {
      const response = this.http.get<any>(
        environment.ApiIP + environment.ApiEncontrarUsuario + codigo,
        {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error(
        'Error al obtener un usuario. ERROR -> usuarios.service.ts -> obtenerUsuario()',
        error
      );
      throw error;
    }
  }

  async obtenerUsuariosYRoles() {
    try {
      const response$ = this.http.get<any>(
        environment.ApiIP + environment.ApiEncontrarRolesYUsuario,
        { headers: { Authorization: `Bearer ${this.authService.getToken()}` } }
      );
      const response = await lastValueFrom(response$);
      console.log(response);
      return response;
    } catch (error) {
      console.error(
        'Error al obtener usuarios. ERROR -> usuarios.service.ts -> obtenerUsuariosYRoles()',
        error
      );
      throw error;
    }
  }

  async actualizarUsuario(
    id_usuario: number,
    body: {
      codigo: string;
      nombres: string;
      primer_apellido: string;
      segundo_apellido: string;
      telefono_id: Telefonos;
      email_id: Email;
      sexo: string;
      rfc: RFC;
      nss: NSS;
      domicilio: Domicilios;
      constrasena: string;
      img_perfil: Img_us;
      rol: Roles[];
    }
  ) {
    try {
      const response = await this.http
        .patch<any>(
          environment.ApiIP + environment.ApiActualizarUsuario + id_usuario,
          body,
          {
            headers: { Authorization: `Bearer ${this.authService.getToken()}` },
          }
        )
        .toPromise();
      if (response !== null || response !== undefined) {
        return response;
      } else return undefined;
    } catch (error) {
      console.error(
        'Error al actualizar al usuario. ERROR -> usuarios.service.ts -> actualizarUsuario()',
        error
      );
      throw error;
    }
  }
  async desactivarUsuario(id_usuario: number) {
    try {
      const response = await this.http
        .patch<any>(
          environment.ApiIP + environment.ApiDesactivarUsuario + id_usuario,
          {},
          {
            headers: { Authorization: `Bearer ${this.authService.getToken()}` },
          }
        )
        .toPromise();
      if (response !== null || response !== undefined) {
        return response;
      } else return undefined;
    } catch (error) {
      console.error(
        'Error al desactivar al usuario. ERROR -> usuarios.service.ts -> desactivarUsuario()',
        error
      );
      throw error;
    }
  }
  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(environment.ApiIP + "usuarios/registro", usuario);
  }

  subirImg(file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file); // 'file' debe coincidir con el nombre del campo en el FileInterceptor
      // Construir la URL completa usando la variable de entorno
      const url = `${environment.ApiIP}img-us/subir-img`;
      // Realizar la petición POST y devolver el Observable
      return this.http.post<any>(url, formData);
    } catch (error) {
      console.error(
        'Error al subir la imagen. ERROR -> usuarios.service.ts -> subirImg()',
        error
      );
      throw error;
    }
      
  }
}