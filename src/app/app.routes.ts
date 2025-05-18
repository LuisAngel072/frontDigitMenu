import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdministradorComponent } from './pages/administrador/administrador.component';
import { MeserosComponent } from './pages/meseros/meseros.component';
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
        path: "meseros",
        component: MeserosComponent
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
        path: "cocinero", // Agregar ruta para el componente cocinero
        component: CocineroComponent
    }
];
