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
import { MesasComponent } from './pages/administrador/mesas/mesas.component';
import { CrudAgregarProductosComponent } from './pages/administrador/crud-productos/crud-agregar-productos/crud-agregar-productos.component';
import { CategoriasComponent } from './pages/administrador/categorias/categorias.component';
import { VentasComponent } from './pages/administrador/ventas/ventas.component';
import { CrudIngredientesComponent } from './pages/administrador/crud-ingredientes/crud-ingredientes.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'Administrador',
    component: AdministradorComponent,
    children: [
      { path: '', redirectTo: 'empleados', pathMatch: 'full' },
      {
        path: 'productos',
        component: CrudProductosComponent,
      },
      {
        path: 'productos/agregar',
        component: CrudAgregarProductosComponent,
      },
      {
        path: 'productos/editar/:id_prod',
        component: CrudAgregarProductosComponent,
      },
      { path: 'mesas', component: MesasComponent },
      {
        path: 'empleados',
        component: CrudEmpleadosComponent,
      },
      {
        path: 'categorias',
        component: CategoriasComponent,
      },
      {
        path: 'ventas',
        component: VentasComponent,
      },
      {
        path: 'ingredientes',
        component: CrudIngredientesComponent,
      },
    ],
  },
  // Redirección para asegurar case-sensitivity
  {
    path: 'administrador',
    redirectTo: '/Administrador',
    pathMatch: 'full',
  },
  {
    path: 'empleados',
    component: CrudEmpleadosComponent,
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
    path: 'Cocinero', // Ruta principal con mayúscula
    component: CocineroComponent,
  },
  // Redirección para asegurar case-sensitivity
  {
    path: 'cocinero',
    redirectTo: '/Cocinero',
    pathMatch: 'full',
  },
  {
    path: 'Mesero',
    component: MeserosComponent,
  },
  // Redirección para asegurar case-sensitivity - ESTE ES EL QUE TE IMPORTA
  {
    path: 'mesero',
    redirectTo: '/Mesero',
    pathMatch: 'full',
  },
  {
    path: 'Cajero',
    component: CajeroComponent,
  },
  // Redirección para asegurar case-sensitivity
  {
    path: 'cajero',
    redirectTo: '/Cajero',
    pathMatch: 'full',
  },
];
