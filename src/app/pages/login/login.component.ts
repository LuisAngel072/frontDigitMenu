import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SHA256 } from 'crypto-js';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  codigo: string = '';
  contrasena: string = '';
  falloAuth: Boolean = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  async onSubmit() {
    const data = {
      codigo: this.codigo,
      contrasena: this.contrasena,
    };
    Swal.fire({
      title: 'Cargando...',
      html: 'Por favor, espere mientras se procesa la información.',
      allowOutsideClick: false, // Evita que se pueda cerrar
      allowEscapeKey: false, // Evita que se cierre con la tecla Escape
      allowEnterKey: false, // Evita que se cierre con Enter
      didOpen: () => {
        Swal.showLoading(); // Muestra el spinner de carga
      },
    });
    this.authService
      .autenticar(data)
      .then((isSuccessful: boolean) => {
        if (!isSuccessful) {
          Swal.close();
          Swal.fire({
            title: 'Uy algo salió mal...',
            text: 'Credenciales inválidas o usuario desactivado',
            icon: 'warning',
            customClass: { confirmButton: 'btn btn-terc' },
          });
        } else {
          Swal.close();
          Swal.fire({
            title: 'Credenciales válidas',
            text: 'Iniciando sesión',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          });
          this.authService.getInfo();
          this.router.navigateByUrl('/' + this.authService.getRol());
        }
      })
      .catch((error) => {
        Swal.close();
        Swal.fire({
          title: 'Uy algo salió mal...',
          text: 'Credenciales inválidas o usuario desactivado',
          icon: 'warning',
          customClass: { confirmButton: 'btn btn-terc' },
        });
      });
  }
}
