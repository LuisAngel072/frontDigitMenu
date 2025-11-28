import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { Logs } from '../../../interfaces/types';
import { LogsService } from '../../../services/logs.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

/**
 * Componente para la visualización y gestión de logs en la aplicación.
 * Permite filtrar logs por término de búsqueda y rango de fechas,
 * así como paginarlos para una mejor experiencia de usuario.
 */
@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css',
})
export class LogsComponent {
  pageSize: number = 7;
  currentPage: number = 0;

  logs: Logs[] = []; //Aquí se almacenan todos los logs
  logsFiltrados: Logs[] = []; //Aquí se almacenan los logs filtrados

  searchTerm: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(private readonly logsService: LogsService) {}

  async onPageChange(page: number) {
    this.currentPage = page;
  }

  async ngOnInit() {
    try {
      this.logs = await this.logsService.obtenerLogs();
      this.logsFiltrados = this.logs;
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los logs. Inténtalo de nuevo más tarde.',
        timer: 2000,
      });
    }
  }

  aplicarFiltros(): void {
    // Empezar con la lista original completa
    let logsTemp = this.logs;

    // 1. Filtrar por término de búsqueda
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      logsTemp = logsTemp.filter(
        (log) =>
          log.usuario.toLowerCase().includes(term) ||
          log.accion.toLowerCase().includes(term) ||
          log.modulo.toLowerCase().includes(term) ||
          (log.ip && log.ip.toLowerCase().includes(term))
      );
    }

    // 2. Filtrar por fecha de inicio
    if (this.fechaInicio) {
      // Se añade T00:00:00 para asegurar que se compare desde el inicio del día
      const inicio = new Date(this.fechaInicio + 'T00:00:00');
      logsTemp = logsTemp.filter((log) => new Date(log.fecha) >= inicio);
    }

    // 3. Filtrar por fecha de fin
    if (this.fechaFin) {
      // Se añade T23:59:59 para asegurar que se compare hasta el fin del día
      const fin = new Date(this.fechaFin + 'T23:59:59');
      logsTemp = logsTemp.filter((log) => new Date(log.fecha) <= fin);
    }

    // Asignar el resultado final
    this.logsFiltrados = logsTemp;

    // Reiniciar la paginación a la primera página
    this.currentPage = 1;
  }

  async verLog(id_log: number) {
    try {
      const log = this.logsFiltrados.find((log) => log.id_log === id_log);
      if (!log) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontro el log en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }

      Swal.fire({
        title: `Log ID: ${log.id_log}`,
        html: `
          <p><strong>Usuario:</strong> ${log.usuario}</p>
          <p><strong>Acción:</strong> ${log.accion}</p>
          <p><strong>Módulo:</strong> ${log.modulo}</p>
          <p><strong>Fecha:</strong> ${new Date(log.fecha).toLocaleString()}</p>
          <p><strong>IP:</strong> ${log.ip}</p>
          <p><strong>Descripción:</strong></p>
          <p>${
            log.descripcion ? log.descripcion : 'No hay descripción disponible.'
          }</p>
        `,
        confirmButtonText: 'Aceptar',
        customClass: {
          confirmButton: 'btn btn-prim',
          title: 'cocogoose-font',
        },
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el log. Inténtalo de nuevo más tarde.',
        timer: 2000,
      });
    }
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleString(); // Formatea la fecha a una cadena legible
  }
}
