import { Component } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [QRCodeModule, CommonModule, HttpClientModule],
  templateUrl: './mesas.component.html',
  styleUrl: '../mesas/mesas.component.css',
})
export class MesasComponent {
  constructor(private http: HttpClient) {}
  mesas: { id: number; qrData: string }[] = [];

  agregarQR() {
    const nuevoId = this.mesas.length > 0 ? Math.max(...this.mesas.map(m => m.id)) + 1 : 1;
  
    Swal.fire({
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
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const mesaId = Number(result.value);
        const qrData = `http://localhost:4200/clientes-menu?mesa=${mesaId}`;
  
        // Lógica para insertar visualmente
        this.mesas.push({ id: mesaId, qrData });
  
        // Lógica para enviar al backend
        this.http.post('http://localhost:3000/api/mesas', {
          no_mesa: mesaId,
          qr_code_url: qrData
        }).subscribe({
          next: (res) => {
            console.log('✅ Mesa guardada en base de datos:', res);
          },
          error: (err) => {
            console.error('❌ Error al guardar mesa en DB:', err);
            Swal.fire('Error', 'No se pudo guardar la mesa en la base de datos.', 'error');
          }
        });
      }
    });
  }

  

  eliminarQR() {
    if (this.mesas.length === 0) {
      Swal.fire('Sin mesas', 'No hay mesas para eliminar.', 'info');
      return;
    }
  
    Swal.fire({
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
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const noMesa = Number(result.value);
  
        // Buscar si existe en el array local
        const index = this.mesas.findIndex(m => m.id === noMesa);
  
        if (index === -1) {
          Swal.fire('Error', `No se encontró la mesa ${noMesa}.`, 'error');
          return;
        }
  
        // Llamar al backend para eliminar
        this.http.delete(`http://localhost:3000/api/mesas/${noMesa}`).subscribe({
          next: () => {
            this.mesas.splice(index, 1); // Eliminar del array visualmente
            Swal.fire('Eliminado', `La mesa ${noMesa} fue eliminada.`, 'success');
          },
          error: (err) => {
            console.error('❌ Error al eliminar mesa:', err);
            Swal.fire('Error', 'No se pudo eliminar la mesa de la base de datos.', 'error');
          }
        });
      }
    });
  }
  
  
}
