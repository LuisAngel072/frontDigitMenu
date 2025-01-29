import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdministradorComponent } from './pages/administrador/administrador.component';
import { CrudEmpleadosComponent } from './pages/administrador/crud-empleados/crud-empleados.component';

export const routes: Routes = [
    {
        path: "",
        component: LoginComponent
    },
    {
        path: "administrador",
        component: AdministradorComponent
    },
    {
        path: "empleados",
        component: CrudEmpleadosComponent
    }
];
