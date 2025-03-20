import { Component } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [QRCodeModule, CommonModule],
  templateUrl: './mesas.component.html',
  styleUrl: '../mesas/mesas.component.css',
})
export class MesasComponent {
  mesas: number[] = [1]; // Lista de mesas con el primer QR inicial

  agregarQR() {
    const nuevoId = this.mesas.length > 0 ? Math.max(...this.mesas) + 1 : 1;
    this.mesas.push(nuevoId);
  }

  eliminarQR() {
    if (this.mesas.length > 0) {
      this.mesas.pop(); // Elimina el último QR
    }
  }

  generarURL(mesa: number): string {
    return `http://localhost:4200/clientes?mesa=${mesa}`;
  }
}
