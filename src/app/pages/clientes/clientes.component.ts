import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  mesaId: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Obtener el parámetro "mesa" de la URL
    this.route.queryParams.subscribe(params => {
      this.mesaId = params['mesa'];
    });
  }

  goToClientesMenu(): void {
    this.router.navigate(['/clientes-menu'], { queryParams: { mesa: this.mesaId } });
  }  
}