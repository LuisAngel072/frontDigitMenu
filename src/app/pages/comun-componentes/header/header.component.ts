import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  public username = localStorage.getItem('nombres');
  public usercode = localStorage.getItem('codigo');
  pagina = '';
  constructor(
    private readonly authService: AuthService,
  ){
    console.log(this.username)
    console.log(this.usercode)
  }
  
  ngOnInit(): void {
    this.pagina = window.location.pathname;
    console.log(this.pagina)
  }
  
  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}
