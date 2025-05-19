import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    ) { }

    /**
     *
     * @param data codigo y contrasena del usuario en un objeto { codigo, contrasena}
     * @returns Autenticacion exitosa o credenciales inválidas
     */
    async autenticar(data: any): Promise<boolean> {
      try {
        const response = await this.http.post<any>(environment.ApiIP + environment.ApiLogin, data).toPromise();
        const token = response.access_token;
        if (token) {
          localStorage.setItem('tok', token);
          return true;
        } else {
          return false;
        }
      } catch (error: any) {
        return false;
      }
    }

    getRol() {
      var token: any = localStorage.getItem('tok'),
        decodificado = this.jwtHelper.decodeToken(token);
      localStorage.setItem('rol', decodificado.rol);
      return decodificado.rol;

    }

    getId() {
      var token: any = localStorage.getItem('tok');
      var decodificado = this.jwtHelper.decodeToken(token);
      return decodificado.codigo;
    }

    getToken() {
      let token: any = localStorage.getItem('tok')?.toString()
      return token
    }

    getInfo() {
      var token: any = localStorage.getItem('tok'),
        decodificado = this.jwtHelper.decodeToken(token);
      localStorage.setItem('nombres', decodificado.nombres);
      localStorage.setItem('primer_apellido', decodificado.primer_apellido);
      localStorage.setItem('codigo', decodificado.codigo);
      localStorage.setItem('rol', decodificado.rol);
      return
    }


    cerrarSesion() {
      localStorage.clear();
      window.location.replace("/");
    }
}

export function tokenGetter() {
  return localStorage.getItem('tok');
}

