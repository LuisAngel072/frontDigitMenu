import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubcategoriaService {
  private baseUrl = environment.ApiIP;

  constructor(private http: HttpClient) {}

  obtenerSubcategorias(): Observable<any> {
    return this.http.get(`${this.baseUrl}${environment.ApiObtenerSubCategorias}`);
  }

  obtenerSubcategoria(id: string): Observable<any> {
    const url = `${this.baseUrl}${environment.ApiObtenerSubCategoria.replace(':id_subcat', id)}`;
    return this.http.get(url);
  }

  registrarSubcategoria(subcategoria: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${environment.ApiRegistrarSubCategoria}`, subcategoria);
  }

  editarSubcategoria(id: string, subcategoria: any): Observable<any> {
    const url = `${this.baseUrl}${environment.ApiEditarSubCategoria.replace(':id_subcat', id)}`;
    return this.http.patch(url, subcategoria);
  }

  eliminarSubcategoria(id: string): Observable<any> {
    const url = `${this.baseUrl}${environment.ApitEliminarSubCategoria.replace(':id_subcat', id)}`;
    return this.http.delete(url);
  }
}
