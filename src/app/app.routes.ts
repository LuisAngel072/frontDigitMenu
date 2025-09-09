import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdministradorComponent } from './pages/administrador/administrador.component';
import { MeserosComponent } from './pages/meseros/meseros.component';
import { CrudProductosComponent } from './pages/administrador/crud-productos/crud-productos.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ClientesMenuComponent } from './pages/clientes/clientes-menu/clientes-menu.component';
import { CocineroComponent } from './pages/cocinero/cocinero.component'; // Importar CocineroComponent
import { CrudEmpleadosComponent } from './pages/administrador/crud-empleados/crud-empleados.component';
import { CajeroComponent } from './pages/caja/cajero.component';
import { CrudAgregarProductosComponent } from './pages/administrador/crud-productos/crud-agregar-productos/crud-agregar-productos.component';
import { CategoriasComponent } from './pages/administrador/categorias/categorias.component';
import { CrudIngredientesComponent } from './pages/administrador/crud-ingredientes/crud-ingredientes.component';
import { MesasComponent } from './pages/administrador/mesas/mesas.component';
import { VentasComponent } from './pages/administrador/ventas/ventas.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'Administrador',
    component: AdministradorComponent,
    children: [
      { path: '', redirectTo: 'empleados', pathMatch: 'full' }, // Ruta por defecto
      { path: 'empleados', component: CrudEmpleadosComponent },
      { path: 'productos', component: CrudProductosComponent },
      { path: 'productos/agregar', component: CrudAgregarProductosComponent },
      {
        path: 'productos/editar/:id_prod',
        component: CrudAgregarProductosComponent,
      },
      { path: 'categorias', component: CategoriasComponent },
      { path: 'ingredientes', component: CrudIngredientesComponent },
      { path: 'mesas', component: MesasComponent },
      { path: 'ventas', component: VentasComponent },
    ],
  },
  {
    path: 'clientes',
    component: ClientesComponent,
  },
  {
    path: 'clientes-menu',
    component: ClientesMenuComponent,
  },
  {
    path: 'Cocinero', // Agregar ruta para el componente cocinero
    component: CocineroComponent,
  },
  {
    path: 'Mesero',
    component: MeserosComponent,
  },
  {
    path: 'Cajero',
    component: CajeroComponent,
  }
];
