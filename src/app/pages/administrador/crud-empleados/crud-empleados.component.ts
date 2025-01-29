import { Component } from '@angular/core';
import { HeaderComponent } from '../../comun-componentes/header/header.component';

@Component({
  selector: 'app-crud-empleados',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './crud-empleados.component.html',
  styleUrl: './crud-empleados.component.css'
})
export class CrudEmpleadosComponent {

}
