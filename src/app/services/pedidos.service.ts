import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',  // Esto hace que el servicio esté disponible en toda la aplicación
})
export class PedidosService {
  private base = `${environment.ApiIP}/pedidos`;  // URL de la API

  constructor(private http: HttpClient) {}

  // Método para obtener los pedidos
  getPedidos(): Observable<any[]> {
    return this.http.get<any[]>(this.base);  // Llamada GET a la API
  }

  // Método para cambiar el estado de un producto en un pedido
  cambiarEstadoProducto(pedidoId: number, estado: any): Observable<any> {
    return this.http.patch(`${this.base}/actualizar/${pedidoId}`, estado);  // Llamada PATCH a la API
  }
}
