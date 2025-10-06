import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { Logs } from '../../../interfaces/types';
import { LogsService } from '../../../services/logs.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css',
})
export class LogsComponent {
  pageSize: number = 7;
  currentPage: number = 0;

  logs: Logs[] = []; //Aquí se almacenan todos los logs
  logsFiltrados: Logs[] = []; //Aquí se almacenan los logs filtrados

  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

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

  filtrarLogs(event: any) {
    const valor = event.target.lowerCase();
    this.logsFiltrados = this.logs.filter((log) => {
      const usuario = log.usuario.toLowerCase() || '';
      const accion = log.accion.toLowerCase() || '';
      const modulo = log.modulo.toString().toLowerCase() || '';
      const ip = log.ip.toString().toLowerCase() || '';

      return (
        usuario.includes(valor) ||
        accion.includes(valor) ||
        modulo.includes(valor) ||
        ip.includes(valor)
      );
    });
  }

  /**
   *
   * FILTRADO POR FECHAS
   */

  actualizarFechaInicio(event: Event) {
    const fechaSeleccionada = event.target as HTMLSelectElement;
    this.fechaInicio = fechaSeleccionada.value
      ? new Date(fechaSeleccionada.value)
      : null;
    this.filtrarPorFechas();
  }
  actualizarFechaFin(event: Event) {
    const fechaSeleccionada = event.target as HTMLSelectElement;
    this.fechaFin = fechaSeleccionada.value
      ? new Date(fechaSeleccionada.value)
      : null;
    this.filtrarPorFechas();
  }
  // Filtra los tickets por el rango de fechas
  filtrarPorFechas() {
    if (!this.fechaInicio || !this.fechaFin) {
      const mensaje = !this.fechaInicio
        ? 'Por favor selecciona una fecha de inicio.'
        : 'Por favor selecciona una fecha de fin.';
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: mensaje,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    // Verifica el rango de fechas
    if (this.fechaInicio > this.fechaFin) {
      Swal.fire({
        icon: 'error',
        title: 'Error en las fechas',
        text: 'La fecha de inicio no puede ser mayor a la fecha de fin.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    // Filtrar logs
    if (
      this.fechaInicio !== null &&
      this.fechaFin !== null
    ) {
      this.logsFiltrados = this.logs.filter((log) => {
        const fechaAccion = new Date(log.fecha);
        return (
          fechaAccion >= this.fechaInicio! &&
          fechaAccion <= this.fechaFin!
        );
      });

      // Mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Filtrado exitoso',
        text: `Se encontraron ${this.logsFiltrados.length} registros en el rango seleccionado.`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
    }

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
          <p>${log.descripcion ? log.descripcion : 'No hay descripción disponible.'}</p>
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
