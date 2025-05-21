import { Component } from '@angular/core';
import { HeaderComponent } from '../comun-componentes/header/header.component';
import { CommonModule } from '@angular/common';
import { CajaComponent } from './caja/caja.component';
import { VentasComponent } from '../administrador/ventas/ventas.component';

@Component({
  selector: 'app-cajero',
  standalone: true,
  imports: [HeaderComponent, CajaComponent, VentasComponent,CommonModule],
  templateUrl: './cajero.component.html',
  styleUrl: './cajero.component.css'
})
export class CajeroComponent {
  selectedSection = 'seccion1'

  constructor(){}

  selectSection(section: string): void {
    this.selectedSection = section;
  }
}
