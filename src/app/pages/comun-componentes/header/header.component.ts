import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Usuarios } from '../../../types';
import { UsuariosService } from '../../../services/usuarios.service';
import { environment } from '../../../../environment';
import { SharedService } from '../../../services/shared.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  public usuario: Usuarios | undefined;

  public username = localStorage.getItem('nombres') || '';
  public usercode = localStorage.getItem('codigo') || '';
  public img_ruta: string | undefined;
  public profileImageUrl: string = '';
  pagina = '';
  private subscriptions: Subscription = new Subscription();
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
    private readonly sharedService: SharedService,
  ) {
    console.log(this.username);
    console.log(this.usercode);
  }

  async ngOnInit() {
    this.usuario = await this.usuariosService.obtenerUnUsuario(String(this.usercode));
    this.profileImageUrl = environment.ApiUp + (this.usuario?.img_perfil.img_ruta || '');

    // Suscribirse a los cambios en la imagen de perfil
    const profileImgSubscription = this.sharedService.profileImg.subscribe((newProfileImg) => {
      if (newProfileImg) {
        this.profileImageUrl = newProfileImg;
      }
    });
    this.subscriptions.add(profileImgSubscription);
  }

  ngOnDestroy() {
    // Cancelar suscripciones al destruir el componente
    this.subscriptions.unsubscribe();
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}
