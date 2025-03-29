import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl {

  override itemsPerPageLabel = 'Ítems por página';
  override nextPageLabel = '';
  override previousPageLabel = '';

  // Para el texto del rango, si deseas ocultarlo por completo, puedes retornar una cadena vacía:
  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return '';
    }
    // Para ocultar completamente el texto, simplemente retorna ''.
    return '';
  };

  
}
