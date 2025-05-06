import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdministradorComponent } from './pages/administrador/administrador.component';
import { CrudEmpleadosComponent } from './pages/administrador/crud-empleados/crud-empleados.component';
import { CrudProductosComponent } from './pages/administrador/crud-productos/crud-productos.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ClientesMenuComponent } from './pages/clientes/clientes-menu/clientes-menu.component';
import { CocineroComponent } from './pages/cocinero/cocinero.component';  // IMPORTAR AQUÍ

export const routes: Routes = [
    {
        path: "",
        component: LoginComponent
    },
    {
        path: "Administrador",
        component: AdministradorComponent
    },
    {
        path: "empleados",
        component: CrudEmpleadosComponent
    },
    {
        path: "productos",
        component: CrudProductosComponent
    },
    {
        path: "clientes",
        component: ClientesComponent
    },
    {
        path: "clientes-menu",
        component: ClientesMenuComponent
    },
    {
        path: '',
        redirectTo: '/cocinero',  // Esto redirige al componente del cocinero por defecto
        pathMatch: 'full'
      },
      {
        path: 'cocinero',  // Ruta para cargar el componente Cocinero
        component: CocineroComponent
      }
];
