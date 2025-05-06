import { Injectable } from '@angular/core';
import { environment } from '../../environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  constructor(
    private http: HttpClient,
    private readonly authService: AuthService
  ) {}

  async obtenerRoles() {
    try {
      const response$ = this.http.get<any>(
        environment.ApiIP + environment.ApiObtenerRoles,
        { headers: { Authorization: `Bearer ${this.authService.getToken()}` } }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        'Error al obtener roles. ERROR -> roles.service.ts -> obtenerRoles()',
        error
      );
      throw error;
    }
  }
}
