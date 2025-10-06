import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Logs } from '../interfaces/types';
import { environment } from '../../environment';
import { lastValueFrom } from 'rxjs';
import { LogsDto } from '../interfaces/dtos';

@Injectable({
  providedIn: 'root',
})
export class LogsService {
  constructor(
    private http: HttpClient,
    private readonly authService: AuthService
  ) {}

  async obtenerLogs(): Promise<Logs[]> {
    try {
      const response = await lastValueFrom(
        this.http.get<Logs[]>(environment.ApiIP + environment.ApiObtenerLogs, {
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        })
      );
      return response;
    } catch (error) {
      console.error(
        'Error al obtener los logs. ERROR -> logs.service.ts -> obtenerLogs()',
        error
      );
      throw error;
    }
  }

  async obtenerLog(id_log: number): Promise<Logs> {
    try {
      const response = await lastValueFrom(
        this.http.get<Logs>(environment.ApiIP + environment.ApiObtenerLog + id_log, {
          headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        })
      );
      return response;
    } catch (error) {
      console.error(
        'Error al obtener el log. ERROR -> logs.service.ts -> obtenerLog()',
        error
      );
      throw error;
    }
  }

  async crearLog(body: LogsDto): Promise<Logs> {
    try {
      const response = await lastValueFrom(
        this.http.post<Logs>(
          environment.ApiIP + environment.ApiCrearLog,
          body,
          {
            responseType: 'text' as 'json',
            headers: { Authorization: `Bearer ${this.authService.getToken()}` },
          }
        )
      );
      return response;
    } catch (error) {
      console.error(
        'Error al crear el log. ERROR -> logs.service.ts -> crearLog()',
        error
      );
      throw error;
    }
  }
}
