import { Component } from '@angular/core';
import { HeaderComponent } from '../comun-componentes/header/header.component';
import { CommonModule } from '@angular/common';
import { CrudEmpleadosComponent } from './crud-empleados/crud-empleados.component';
import { CrudProductosComponent } from './crud-productos/crud-productos.component';
import { CategoriasComponent } from '../../pages/administrador/categorias/categorias.component';
import { CrudIngredientesComponent } from './crud-ingredientes/crud-ingredientes.component';
import { MesasComponent } from './mesas/mesas.component';
import { VentasComponent } from './ventas/ventas.component';
import { Ingredientes, Roles, Usuarios_has_roles, Categorias, Extras, Opciones } from '../../types';
import { UsuariosService } from '../../services/usuarios.service';
import { RolesService } from '../../services/roles.service';
import { CrudAgregarProductosComponent } from './crud-productos/crud-agregar-productos/crud-agregar-productos.component';
import { IngredientesService } from '../../services/ingredientes.service';
import { CategoriasService } from '../../services/categorias.service';
import { SubcategoriaService } from '../../services/subcategoria.service'; // Asegúrate de importar el servicio de subcategorías
import { OpcionesService } from '../../services/opciones.service';
import { ExtrasService } from '../../services/extras.service';

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
  styleUrls: ['./administrador.component.css'],
})
export class AdministradorComponent {
  selectedSection: string = 'seccion1';

  public usuarios: Usuarios_has_roles[] = [];
  public roles: Roles[] = [];
  public ingredientes: Ingredientes[] = [];
  public extras: Extras[] = [];
  public opciones: Opciones[] = [];
  categorias: Categorias[] = [];
  subcategorias: any[] = [];  // Arreglo para almacenar las subcategorías

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly rolesService: RolesService,
    private readonly ingredientesService: IngredientesService,
    private readonly opcionesService: OpcionesService,
    private readonly extrasService: ExtrasService,
    private readonly categoriasService: CategoriasService,
    private readonly subcategoriaService: SubcategoriaService,  
  ) {}
  cambiarComponente(componente:string) {
    this.selectedSection = componente;
  }
  async ngOnInit() {
    this.roles = await this.rolesService.obtenerRoles();
    this.usuarios = await this.usuariosService.obtenerUsuariosYRoles();
    this.ingredientes = await this.ingredientesService.getIngredientes();
    this.opciones = await this.opcionesService.getOpciones();
    this.extras = await this.extrasService.getExtras();
    this.categorias = await this.categoriasService.getCategorias(); 

    // Inicializa las subcategorías
    this.subcategorias = await this.subcategoriaService.obtenerSubcategorias();
  }

  selectSection(section: string): void {
    this.selectedSection = section;
  }
}
