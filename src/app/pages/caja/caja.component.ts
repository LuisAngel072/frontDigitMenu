import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../comun-componentes/header/header.component';
import { CajaVistaComponent } from './caja-vista/caja-vista.component';
import { VentasComponent } from './ventas/ventas.component';


@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    CajaVistaComponent,
    VentasComponent // 👈 agrégalos aquí
  ],
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.css']
})
export class CajaComponent {
  selectedSection = 'caja';

  selectSection(seccion: string) {
    this.selectedSection = seccion;
  }
}
