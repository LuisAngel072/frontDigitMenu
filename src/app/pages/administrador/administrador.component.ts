import { Component } from '@angular/core';
import { HeaderComponent } from '../comun-componentes/header/header.component';
import { CommonModule } from '@angular/common';
import { CrudEmpleadosComponent } from './crud-empleados/crud-empleados.component';
import { CrudProductosComponent } from './crud-productos/crud-productos.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { CrudIngredientesComponent } from './crud-ingredientes/crud-ingredientes.component';
import { MesasComponent } from './mesas/mesas.component';
import { VentasComponent } from './ventas/ventas.component';
import { Extras, Ingredientes, Opciones, Roles, Usuarios_has_roles } from '../../types';
import { UsuariosService } from '../../services/usuarios.service';
import { RolesService } from '../../services/roles.service';
import { CrudAgregarProductosComponent } from './crud-productos/crud-agregar-productos/crud-agregar-productos.component';
import { IngredientesService } from '../../services/ingredientes.service';
import { ExtrasService } from '../../services/extras.service';
import { OpcionesService } from '../../services/opciones.service';
@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    CrudEmpleadosComponent,
    CrudProductosComponent,
    CategoriasComponent,
    CrudIngredientesComponent,
    MesasComponent,
    VentasComponent,
    CrudAgregarProductosComponent,
  ],
  templateUrl: './administrador.component.html',
  styleUrl: './administrador.component.css',
})
export class AdministradorComponent {
  selectedSection: string = 'seccion1';

  cambiarComponente(componente: string) {
    this.selectedSection = componente;
  }

  public usuarios: Usuarios_has_roles[] = [];
  public roles: Roles[] = [];
  public ingredientes: Ingredientes[] = [];
  public extras: Extras[] = [];
  public opciones: Opciones[] = [];

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly rolesService: RolesService,
    private readonly ingredientesService: IngredientesService,
    private readonly extrasService: ExtrasService,
    private readonly opcionesService: OpcionesService,
  ) {}

  async ngOnInit() {
    this.roles = await this.rolesService.obtenerRoles();
    this.usuarios = await this.usuariosService.obtenerUsuariosYRoles();
    this.ingredientes = await this.ingredientesService.getIngredientes();
    this.extras = await this.extrasService.getExtras();
    this.opciones = await this.opcionesService.getOpciones();
  }

  selectSection(section: string): void {
    this.selectedSection = section;
  }
}
