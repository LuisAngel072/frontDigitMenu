import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Usuarios } from '../../../types';
import { UsuariosService } from '../../../services/usuarios.service';
import { environment } from '../../../../environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  public usuario: Usuarios | undefined;

  public username = localStorage.getItem('nombres');
  public usercode = localStorage.getItem('codigo');
  public img_ruta: string | undefined;
  public profileImageUrl: string = '';
  pagina = '';
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService
  ) {
    console.log(this.username);
    console.log(this.usercode);
  }

  async ngOnInit() {
    this.pagina = window.location.pathname;
    this.img_ruta;
    this.usuario = await this.usuariosService.obtenerUnUsuario(String(this.usercode));
    this.img_ruta = this.usuario?.img_perfil.img_ruta;
    this.profileImageUrl = environment.ApiIP + this.img_ruta;
    console.log(this.profileImageUrl)
    console.log(this.pagina);
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}
