import { Component } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MesasService } from '../../../services/mesas.service';

/**
 * Componente para la gestión de mesas en el sistema.
 * Permite visualizar, agregar y eliminar mesas junto con sus códigos QR asociados.
 */
@Component({
<<<<<<< HEAD
    selector: 'app-mesas',
    standalone: true,
    imports: [QRCodeModule, CommonModule, HttpClientModule],
    templateUrl: './mesas.component.html',
    styleUrl: '../mesas/mesas.component.css'
=======
  selector: 'app-mesas',
  standalone: true,
  imports: [QRCodeModule, CommonModule, HttpClientModule],
  templateUrl: './mesas.component.html',
  styleUrl: '../mesas/mesas.component.css',
>>>>>>> main
})
export class MesasComponent {
  constructor(private mesasService: MesasService) {}
  mesas: { id: number; qrData: string }[] = [];

  ngOnInit() {
    this.obtenerMesas();
  }

<<<<<<< HEAD
  async obtenerMesas() {
    try {
      const data = await this.mesasService.obtenerMesas();
      this.mesas = data.map(mesa => ({
        id: mesa.no_mesa,
        qrData: mesa.qr_code_url
      }));
    } catch (error) {
      console.error('❌ Error al obtener mesas:', error);
      Swal.fire('Error', 'No se pudieron cargar las mesas.', 'error');
    }
  }

  async agregarQR() {
    const nuevoId = this.mesas.length > 0 ? Math.max(...this.mesas.map(m => m.id)) + 1 : 1;
=======
  obtenerMesas() {
    this.http.get<any[]>('http://localhost:3000/api/mesas').subscribe({
      next: (data) => {
        this.mesas = data.map((mesa) => ({
          id: mesa.no_mesa, // Ajusta según cómo tu backend regrese los datos
          qrData: mesa.qr_code_url,
        }));
        console.log('✅ Mesas cargadas:', this.mesas);
      },
      error: (error) => {
        console.error('❌ Error al obtener mesas:', error);
        Swal.fire('Error', 'No se pudieron cargar las mesas.', 'error');
      },
    });
  }

  agregarQR() {
    const nuevoId =
      this.mesas.length > 0 ? Math.max(...this.mesas.map((m) => m.id)) + 1 : 1;
>>>>>>> main

    const result = await Swal.fire({
      title: 'Ingrese el número de la mesa',
      input: 'number',
      inputLabel: 'Número de mesa',
      inputValue: nuevoId,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          return 'Ingrese un número válido';
        }
        return null;
<<<<<<< HEAD
=======
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const mesaId = Number(result.value);
        const qrData = `http://localhost:4200/clientes-menu?mesa=${mesaId}`;

        // Lógica para insertar visualmente
        this.mesas.push({ id: mesaId, qrData });

        // Lógica para enviar al backend
        this.http
          .post('http://localhost:3000/api/mesas', {
            no_mesa: mesaId,
            qr_code_url: qrData,
          })
          .subscribe({
            next: (res) => {
              console.log('✅ Mesa guardada en base de datos:', res);
            },
            error: (err) => {
              console.error('❌ Error al guardar mesa en DB:', err);
              Swal.fire(
                'Error',
                'No se pudo guardar la mesa en la base de datos.',
                'error'
              );
            },
          });
>>>>>>> main
      }
    });

    if (result.isConfirmed) {
      const mesaId = Number(result.value);
      const qrData = `http://18.191.20.158:4200/clientes-menu?mesa=${mesaId}`;

      this.mesas.push({ id: mesaId, qrData });

      try {
        await this.mesasService.crearMesa(mesaId, qrData);
      } catch (err) {
        console.error('❌ Error al guardar mesa en DB:', err);
        Swal.fire('Error', 'No se pudo guardar la mesa en la base de datos.', 'error');
      }
    }
  }

<<<<<<< HEAD
  async eliminarQR() {
=======
  eliminarQR() {
>>>>>>> main
    if (this.mesas.length === 0) {
      Swal.fire('Sin mesas', 'No hay mesas para eliminar.', 'info');
      return;
    }

    const result = await Swal.fire({
      title: 'Eliminar mesa',
      input: 'number',
      inputLabel: 'Ingrese el número de la mesa a eliminar',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          return 'Ingrese un número válido';
        }
        return null;
<<<<<<< HEAD
=======
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const noMesa = Number(result.value);

        // Buscar si existe en el array local
        const index = this.mesas.findIndex((m) => m.id === noMesa);

        if (index === -1) {
          Swal.fire('Error', `No se encontró la mesa ${noMesa}.`, 'error');
          return;
        }

        // Llamar al backend para eliminar
        this.http
          .delete(`http://localhost:3000/api/mesas/${noMesa}`)
          .subscribe({
            next: () => {
              this.mesas.splice(index, 1); // Eliminar del array visualmente
              Swal.fire(
                'Eliminado',
                `La mesa ${noMesa} fue eliminada.`,
                'success'
              );
            },
            error: (err) => {
              console.error('❌ Error al eliminar mesa:', err);
              Swal.fire(
                'Error',
                'No se pudo eliminar la mesa de la base de datos.',
                'error'
              );
            },
          });
>>>>>>> main
      }
    });

    if (result.isConfirmed) {
      const noMesa = Number(result.value);
      const index = this.mesas.findIndex(m => m.id === noMesa);

      if (index === -1) {
        Swal.fire('Error', `No se encontró la mesa ${noMesa}.`, 'error');
        return;
      }

      try {
        await this.mesasService.eliminarMesa(noMesa);
        this.mesas.splice(index, 1);
        Swal.fire('Eliminado', `La mesa ${noMesa} fue eliminada.`, 'success');
      } catch (err) {
        console.error('❌ Error al eliminar mesa:', err);
        Swal.fire('Error', 'No se pudo eliminar la mesa de la base de datos.', 'error');
      }
    }
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> main
