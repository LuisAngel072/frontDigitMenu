import { Component } from '@angular/core';
import { HeaderComponent } from '../comun-componentes/header/header.component';
import { CommonModule } from '@angular/common';
import { CrudEmpleadosComponent } from './crud-empleados/crud-empleados.component';
import { CrudProductosComponent } from './crud-productos/crud-productos.component';
import { CrudCategoriasComponent } from './crud-categorias/crud-categorias.component';
import { CrudIngredientesComponent } from './crud-ingredientes/crud-ingredientes.component';
import { MesasComponent } from './mesas/mesas.component';
import { VentasComponent } from './ventas/ventas.component';
import { Usuarios_has_roles } from '../../types';
import { UsuariosService } from '../../services/usuarios.service';
@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    CrudEmpleadosComponent,
    CrudProductosComponent,
    CrudCategoriasComponent,
    CrudIngredientesComponent,
    MesasComponent,
    VentasComponent,
  ],
  templateUrl: './administrador.component.html',
  styleUrl: './administrador.component.css',
})
export class AdministradorComponent {
  selectedSection: string = 'seccion1';

  public usuarios: Usuarios_has_roles[] = [];

  constructor(private readonly usuariosService: UsuariosService) {
    
  }
  filtrarUsuariosActivos() {
    this.usuarios = this.usuarios.filter((usuario) => usuario.usuario_id.activo === true);
  }

  async ngOnInit() {
    this.usuarios = await this.usuariosService.obtenerUsuariosYRoles();
    this.filtrarUsuariosActivos()
  }
  selectSection(section: string): void {
    this.selectedSection = section;
  }
}
