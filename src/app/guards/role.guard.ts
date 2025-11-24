// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // 1. Obtener el token
    const token = this.authService.getToken();

    // 2. Verificar si el token existe y si NO ha expirado
    if (!token || this.jwtHelper.isTokenExpired(token)) {
      this.router.navigate(['/']); // Redirigir al login
      return false;
    }

    // 3. Obtener el rol del usuario desde el token
    // Nota: Usamos el token directamente para mayor seguridad en el guard
    const decodedToken = this.jwtHelper.decodeToken(token);
    const userRole = decodedToken.rol;

    // 4. Obtener los roles esperados de la configuración de la ruta
    const expectedRoles = route.data['expectedRoles'] as string[];

    // 5. Validar si el rol del usuario está permitido
    if (expectedRoles && expectedRoles.length > 0) {
      // Compara ignorando mayúsculas/minúsculas por seguridad
      const hasRole = expectedRoles.some(r => r.toLowerCase() === userRole.toLowerCase());

      if (hasRole) {
        return true;
      } else {
        // Si no tiene permiso, mostrar alerta y redirigir
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para acceder a esta sección.',
          timer: 2000,
          showConfirmButton: false
        });
        this.router.navigate(['/']); // O redirigir a una página de "Home" genérica
        return false;
      }
    }

    // Si no hay roles definidos en la ruta pero está autenticado, permitir (o bloquear según tu lógica)
    return true;
  }
}
