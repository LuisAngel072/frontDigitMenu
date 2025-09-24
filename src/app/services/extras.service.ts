import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environment';
import { lastValueFrom } from 'rxjs';
import { ExtrasDTO } from '../interfaces/dtos';

@Injectable({
  providedIn: 'root',
})
export class ExtrasService {
  constructor(
    private http: HttpClient,
    private readonly authService: AuthService
  ) {}

  async getExtras() {
    try {
      const response$ = this.http.get<any>(
        environment.ApiIP + environment.ApiObtenerExtras,
        { headers: { Authorization: `Bearer ${this.authService.getToken()}` } }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        'Error al obtener los extras. ERROR -> getExtras.service.ts -> obtenerExtras()',
        error
      );
      throw error;
    }
  }

  async crearExtra(body: ExtrasDTO) {
    try {
      const response$ = this.http.post<any>(
        environment.ApiIP + environment.ApiCrearExtra,
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
        'Error inesperado en extras.service.ts -> crearExtra()',
        error
      );
      throw error;
    }
  }

  async upExtra(id_extra: number, body: ExtrasDTO) {
    try {
      const response$ = this.http.patch<any>(
        environment.ApiIP + environment.ApiActualizarExtra + id_extra,
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
        'Error inesperado en extras.service.ts -> upExtra()',
        error
      );
      throw error;
    }
  }

  async delExtra(id_extra: number) {
    try {
      const response$ = this.http.delete<any>(
        environment.ApiIP + environment.ApiEliminarExtra + id_extra,
        {
          responseType: 'text' as 'json',
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        'Error inesperado en extras.service.ts -> delExtra()',
        error
      );
      throw error;
    }
  }
}
