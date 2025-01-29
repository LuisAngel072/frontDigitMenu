// import { Component, OnInit } from '@angular/core';
// import { HeaderComponent } from '../../comun-componentes/header/header.component';


// export class CrudEmpleadosComponent implements OnInit {
//   agregarEmpleados() {

//   }

//   employees = [
//     { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Administrador' },
//     { id: 2, name: 'María López', email: 'maria@example.com', role: 'Usuario' },
//     { id: 3, name: 'Carlos Ruiz', email: 'carlos@example.com', role: 'Editor' },
//     { id: 4, name: 'Ana Torres', email: 'ana@example.com', role: 'Moderador' }
//   ];

//   constructor() {}

//   ngOnInit(): void {}
// }

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../comun-componentes/header/header.component';

@Component({
  selector: 'app-crud-empleados',
  standalone: true,
  imports: [HeaderComponent, CommonModule],
  templateUrl: './crud-empleados.component.html',
  styleUrl: './crud-empleados.component.css'
})
export class CrudEmpleadosComponent {
  agregarEmpleados() {

  }
  employees = [
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Administrador' },
    { id: 2, name: 'María López', email: 'maria@example.com', role: 'Usuario' },
    { id: 3, name: 'Carlos Ruiz', email: 'carlos@example.com', role: 'Editor' },
    { id: 4, name: 'Ana Torres', email: 'ana@example.com', role: 'Moderador' }
  ];
}
