import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clientes-menu',
  standalone: true,
  imports: [],
  templateUrl: './clientes-menu.component.html',
  styleUrl: './clientes-menu.component.css'
})
export class ClientesMenuComponent implements OnInit {
  mesaId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mesaId = params['mesa'];
      alert(this.mesaId);
    });
  }

  // aqui se puede editar 
  showProduct(productName: string) {
    Swal.fire({
      title: 'Producto seleccionado',
      text: `Has seleccionado: ${productName}`,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }
}