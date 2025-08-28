import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import {
  Extras,
  Ingredientes,
  Opciones,
  Sub_categorias,
} from '../../../../types';
import { AdministradorComponent } from '../../administrador.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ProductosService } from '../../../../services/productos.service';
import { ProductosDto } from '../../../../dtos';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-crud-agregar-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './crud-agregar-productos.component.html',
  styleUrl: './crud-agregar-productos.component.css'
})
export class CrudAgregarProductosComponent {
  form: FormGroup = this.fb.group({
    nombre_prod: ['', Validators.required],
    descripcion: ['', Validators.required],
    img_prod: [null, Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    sub_cat_id: [null, Validators.required]
  });
  selectedFile?: File;

  @Input() ingredientes: Ingredientes[] = [];
  @Input() extras: Extras[] = [];
  @Input() opciones: Opciones[] = [];
  @Input() sub_categorias: Sub_categorias[] = [];

  ingredientesFiltrados: Ingredientes[] = [];
  extrasFiltrados: Extras[] = [];
  opcionesFiltradas: Opciones[] = [];

  currentPageIngr: number = 1;
  currentPageExt: number = 1;
  currentPageOpc: number = 1;

  pageSize = 6;

  // Sets para manejar selecciones independientemente de la paginación
  selectedIngredientes = new Set<number>();
  selectedExtras = new Set<number>();
  selectedOpciones = new Set<number>();

  constructor(
    public readonly administradorComponent: AdministradorComponent,
    private readonly productosService: ProductosService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this.ingredientes = this.administradorComponent.ingredientes;
    this.extras = this.administradorComponent.extras;
    this.opciones = this.administradorComponent.opciones;
    this.sub_categorias = this.administradorComponent.subcategorias;

    this.ingredientesFiltrados = this.ingredientes;
    this.extrasFiltrados = this.extras;
    this.opcionesFiltradas = this.opciones;
  }

  // Métodos de paginación
  onPageChangeIngr(page: number) {
    this.currentPageIngr = page;
  }

  onPageChangeOpc(page: number) {
    this.currentPageOpc = page;
  }

  onPageChangeExt(page: number) {
    this.currentPageExt = page;
  }

  // Métodos para obtener elementos paginados
  getIngredientesPaginados(): Ingredientes[] {
    const startIndex = (this.currentPageIngr - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.ingredientesFiltrados.slice(startIndex, endIndex);
  }

  getExtrasPaginados(): Extras[] {
    const startIndex = (this.currentPageExt - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.extrasFiltrados.slice(startIndex, endIndex);
  }

  getOpcionesPaginadas(): Opciones[] {
    const startIndex = (this.currentPageOpc - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.opcionesFiltradas.slice(startIndex, endIndex);
  }

  // Métodos para verificar selecciones
  isIngredienteSelected(id: number): boolean {
    return this.selectedIngredientes.has(id);
  }

  isExtraSelected(id: number): boolean {
    return this.selectedExtras.has(id);
  }

  isOpcionSelected(id: number): boolean {
    return this.selectedOpciones.has(id);
  }

  // Métodos para manejar cambios en checkboxes
  onIngredienteChange(event: Event, id: number) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedIngredientes.add(id);
    } else {
      this.selectedIngredientes.delete(id);
    }
    // Actualizar validación del formulario
    this.updateFormValidation();
  }

  onExtraChange(event: Event, id: number) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedExtras.add(id);
    } else {
      this.selectedExtras.delete(id);
    }
  }

  onOpcionChange(event: Event, id: number) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedOpciones.add(id);
    } else {
      this.selectedOpciones.delete(id);
    }
  }

  // Actualizar validación personalizada
  private updateFormValidation() {
    // Puedes agregar validación personalizada aquí si necesitas
    // que el formulario sea inválido cuando no hay ingredientes seleccionados
  }

  // Métodos de filtrado
  filtrarIngredientes(event: any) {
    const valor = event.target.value.toLowerCase();
    this.ingredientesFiltrados = this.ingredientes.filter((ingrediente) => {
      const nombre_ingr = ingrediente.nombre_ingrediente.toLowerCase() || '';
      const precio = ingrediente.precio.toString().toLowerCase() || '';
      return nombre_ingr.includes(valor) || precio.includes(valor);
    });
    this.currentPageIngr = 1; // Reset a primera página al filtrar
  }

  filtrarOpciones(event: any) {
    const valor = event.target.value.toLowerCase();
    this.opcionesFiltradas = this.opciones.filter((opcion) => {
      const nombre_opcion = opcion.nombre_opcion.toLowerCase() || '';
      const porcentaje = opcion.porcentaje.toString().toLowerCase() || '';
      return nombre_opcion.includes(valor) || porcentaje.includes(valor);
    });
    this.currentPageOpc = 1; // Reset a primera página al filtrar
  }

  filtrarExtras(event: any) {
    const valor = event.target.value.toLowerCase();
    this.extrasFiltrados = this.extras.filter((extra) => {
      const nombre_extra = extra.nombre_extra.toLowerCase() || '';
      const precio = extra.precio.toString().toLowerCase() || '';
      return nombre_extra.includes(valor) || precio.includes(valor);
    });
    this.currentPageExt = 1; // Reset a primera página al filtrar
  }

  // Envío del formulario
  async onSubmit() {
    try {
      // Validación de ingredientes obligatorios
      if (this.selectedIngredientes.size === 0) {
        Swal.fire({
          title: 'Error',
          text: 'Por favor, seleccione al menos un ingrediente.',
          icon: 'error',
          timer: 2000,
        });
        return;
      }

      // Obtener objetos seleccionados usando los IDs de los Sets
      const extrasSeleccionadas: Extras[] = this.extras.filter(extra =>
        this.selectedExtras.has(extra.id_extra)
      );

      const opcionesSeleccionadas: Opciones[] = this.opciones.filter(opcion =>
        this.selectedOpciones.has(opcion.id_opcion)
      );

      const ingredientesSeleccionados: Ingredientes[] = this.ingredientes.filter(ingrediente =>
        this.selectedIngredientes.has(ingrediente.id_ingr)
      );

      // Subir imagen
      const res_img = await this.productosService.subirImg(this.selectedFile!);
      const img_prod = '/productos/' + String(res_img.ruta_img);

      // Construir DTO
      const dto: ProductosDto = {
        nombre_prod: this.form.value.nombre_prod,
        descripcion: this.form.value.descripcion,
        img_prod: String(img_prod),
        precio: this.form.value.precio,
        sub_cat_id: parseInt(this.form.value.sub_cat_id),
        extras: extrasSeleccionadas,
        opciones: opcionesSeleccionadas,
        ingredientes: ingredientesSeleccionados,
      };

      // Validaciones adicionales del formulario
      if (this.form.invalid) {
        if (!dto.nombre_prod) {
          Swal.fire({
            title: 'Error',
            text: 'Por favor, ingrese el nombre del producto.',
            icon: 'error',
            timer: 2000,
          });
          return;
        }

        if (!dto.descripcion) {
          Swal.fire({
            title: 'Error',
            text: 'Por favor, ingrese la descripción del producto.',
            icon: 'error',
            timer: 2000,
          });
          return;
        }

        if (!dto.sub_cat_id) {
          Swal.fire({
            title: 'Error',
            text: 'Por favor, seleccione una subcategoría.',
            icon: 'error',
            timer: 2000,
          });
          return;
        }

        if (!dto.precio) {
          Swal.fire({
            title: 'Error',
            text: 'Por favor, ingrese el precio.',
            icon: 'error',
            timer: 2000,
          });
          return;
        }
      }

      console.log(dto);

      // Confirmación
      const confirmacion = await Swal.fire({
        title: '¿Estás seguro de registrar este producto?',
        showDenyButton: true,
        confirmButtonText: 'Continuar',
        denyButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-terc',
          denyButton: 'btn btn-peligro',
        },
        icon: 'warning',
      });

      if (confirmacion.isConfirmed) {
        Swal.fire({
          title: 'Cargando...',
          html: 'Por favor, espere mientras se procesa la información.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Llamada al servicio
        await this.productosService.registrarProducto(dto);

        // Limpiar selecciones después del éxito
        this.resetSelections();

        Swal.fire('Éxito', 'Producto creado', 'success');
      }
    } catch (error) {
      console.error('Error al intentar registrar el producto', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al intentar registrar el producto.',
        icon: 'error',
        timer: 2000,
      });
      throw error;
    }
  }

  // Limpiar selecciones
  private resetSelections() {
    this.selectedIngredientes.clear();
    this.selectedExtras.clear();
    this.selectedOpciones.clear();
    this.form.reset();
  }

  // File input
  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile = input.files[0];
      this.form.patchValue({ img_prod: this.selectedFile.name });
    }
  }
}
