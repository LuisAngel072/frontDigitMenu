import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../comun-componentes/header/header.component';
import { CommonModule } from '@angular/common';
import {
  Ingredientes,
  Roles,
  Usuarios_has_roles,
  Categorias,
  Extras,
  Opciones,
  Sub_categorias,
  Productos,
} from '../../interfaces/types';
import { UsuariosService } from '../../services/usuarios.service';
import { RolesService } from '../../services/roles.service';
import { CrudAgregarProductosComponent } from './crud-productos/crud-agregar-productos/crud-agregar-productos.component';
import { IngredientesService } from '../../services/ingredientes.service';
import { CategoriasService } from '../../services/categorias.service';
import { SubcategoriasService } from '../../services/subcategorias.service';
import { ExtrasService } from '../../services/extras.service';
import { OpcionesService } from '../../services/opciones.service';
import { ProductosService } from '../../services/productos.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    RouterModule
],
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css'],
})
export class AdministradorComponent implements OnInit {
  public usuarios: Usuarios_has_roles[] = [];
  public roles: Roles[] = [];
  public ingredientes: Ingredientes[] = [];
  public extras: Extras[] = [];
  public opciones: Opciones[] = [];
  public categorias: Categorias[] = [];
  public subcategorias: Sub_categorias[] = []; // Arreglo para almacenar las subcategorías
  public productos: Productos[] = [];

  constructor(
    private readonly rolesService: RolesService,
    private readonly ingredientesService: IngredientesService,
    private readonly extrasService: ExtrasService,
    private readonly opcionesService: OpcionesService,
    private readonly categoriasService: CategoriasService,
    private readonly subcategoriaService: SubcategoriasService,
    private readonly productosService: ProductosService
  ) {}

  async ngOnInit() {
    /**
     * Inicializa los datos necesarios para el componente de administrador.
     * Carga roles, ingredientes, extras, opciones, categorías, subcategorías y productos para
     * todos los demás componentes hijo.
     */
    this.roles = await this.rolesService.obtenerRoles();
    this.ingredientes = await this.ingredientesService.getIngredientes();
    this.extras = await this.extrasService.getExtras();
    this.opciones = await this.opcionesService.getOpciones();
    this.categorias = await this.categoriasService.getCategorias();
    this.subcategorias = await this.subcategoriaService.obtenerSubcategorias();
    // Inicializa las subcategorías
    this.subcategorias = await this.subcategoriaService.obtenerSubcategorias();
    this.productos = await this.productosService.obtenerProductos();
  }
}
