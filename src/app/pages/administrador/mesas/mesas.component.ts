import { Component } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [QRCodeModule, CommonModule],
  templateUrl: './mesas.component.html',
  styleUrl: '../mesas/mesas.component.css',
})
export class MesasComponent {
  mesas: { id: number; qrData: string }[] = [{ id: 1, qrData: 'http://localhost:4200/clientes-menu?mesa=1' }];

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
        this.mesas.push({ id: mesaId, qrData });
      }
    });
  }

  eliminarQR() {
    if (this.mesas.length > 0) {
      this.mesas.pop();
    }
  }
}
