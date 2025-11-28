import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import {
  Extras,
  Ingredientes,
  Opciones,
  Pedidos_has_extrassel,
  Pedidos_has_ingrsel,
  Pedidos_has_productos,
  Productos,
  Sub_categorias,
} from '../../../../interfaces/types';
import { AdministradorComponent } from '../../administrador.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ProductosService } from '../../../../services/productos.service';
import { ProductosDto } from '../../../../interfaces/dtos';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute } from '@angular/router';
import { LogsService } from '../../../../services/logs.service';
import { LogsDto } from '../../../../interfaces/dtos';
import { IngredientesService } from '../../../../services/ingredientes.service';
import { ExtrasService } from '../../../../services/extras.service';
import { OpcionesService } from '../../../../services/opciones.service';
import { SubcategoriasService } from '../../../../services/subcategorias.service';
/**
 * Componente para agregar o editar productos en el sistema de administración.
 * Permite la creación y modificación de productos, incluyendo la selección
 * de ingredientes, extras y opciones asociadas.
 *
 * Este componente SÍ fue un dolor de huevos, haciendo el rol de administración
 * uno de los más complejos de la aplicación web.
 */
@Component({
  selector: 'app-crud-agregar-productos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './crud-agregar-productos.component.html',
  styleUrl: './crud-agregar-productos.component.css',
})
export class CrudAgregarProductosComponent implements OnInit {

  /**
   * Todo este componente se trata de un formulario reactivo para agregar o editar productos,
   * con funcionalidades de paginación y filtrado para ingredientes, extras y opciones.
   * También maneja la carga de imágenes y la validación del formulario.
   *
   * Se utilizan servicios para interactuar con la API y registrar logs de acciones.
   *
   * El Formulario se compone de las siguientes librerías indispensables:
   * FormBuilder
   * FormGroup
   * Validators
   * FormsModule
   * ReactiveFormsModule
   *
   * Estas manejas los NgModel, NgModelChange y NgModelOptions en la vista HTML.
   */

  // Propiedades para manejar el modo de edición y el ID del producto
  id_prod?: number;
  modoEdicion: boolean = false;

  form: FormGroup = this.fb.group({
    nombre_prod: ['', Validators.required],
    descripcion: ['', Validators.required],
    img_prod: [null, ''],
    precio: [0, [Validators.required, Validators.min(0)]],
    sub_cat_id: [null, Validators.required],
  });
  selectedFile?: File;

  @Input() ingredientes: Ingredientes[] = [];
  @Input() extras: Extras[] = [];
  @Input() opciones: Opciones[] = [];
  @Input() sub_categorias: Sub_categorias[] = [];

  //Producto a editar
  producto: Productos | undefined = undefined;

  /**
   * Objetos principales para manejar los datos filtrados de ingredientes, extras y opciones.
   */
  ingredientesFiltrados: Ingredientes[] = [];
  extrasFiltrados: Extras[] = [];
  opcionesFiltradas: Opciones[] = [];

  /**
   * Propiedades para manejar la paginación de ingredientes, extras y opciones.
   */
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
    private readonly logsService: LogsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ingredientesService: IngredientesService,
    private extrasService: ExtrasService,
    private opcionesService: OpcionesService,
    private subCategoriasService: SubcategoriasService
  ) {}

  async ngOnInit() {
    /**
     * Carga inicial de ingredientes, extras, opciones y
     * subcategorías desde sus respectivos servicios.
     */
    this.ingredientes = await this.ingredientesService.getIngredientes();
    this.extras = await this.extrasService.getExtras();
    this.opciones = await this.opcionesService.getOpciones();
    this.sub_categorias =
      await this.subCategoriasService.obtenerSubcategorias();

    console.log(this.ingredientes);
    console.log(this.extras);
    console.log(this.opciones);
    console.log(this.sub_categorias);
    this.ingredientesFiltrados = this.ingredientes;
    this.extrasFiltrados = this.extras;
    this.opcionesFiltradas = this.opciones;

    this.cdr.detectChanges();
    /**
     * Suscripción a los parámetros de la ruta para determinar si se está
     * en modo edición y cargar el producto correspondiente.
     * También se fuerza la detección de cambios para actualizar la vista.
     */
    this.route.paramMap.subscribe(async (params) => {
      const idParam = params.get('id_prod');
      if (idParam) {
        this.id_prod = +idParam;
        this.modoEdicion = true;
        await this.cargarProducto(this.id_prod);
        this.cdr.detectChanges();
      }
    });
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

  // Método genérico para obtener elementos paginados
  getPaginados<T>(items: T[], currentPage: number): T[] {
    const startIndex = (currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return items.slice(startIndex, endIndex);
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
  onIngredienteChange(isChecked: boolean, id: number) {
    if (isChecked) {
      this.selectedIngredientes.add(id);
    } else {
      this.selectedIngredientes.delete(id);
    }

  }

  onExtraChange(isChecked: boolean, id: number) {
    if (isChecked) {
      this.selectedExtras.add(id);
    } else {
      this.selectedExtras.delete(id);
    }
  }

  onOpcionChange(isChecked: boolean, id: number) {
    if (isChecked) {
      this.selectedOpciones.add(id);
    } else {
      this.selectedOpciones.delete(id);
    }
  }
  /**
   * Obtiene y carga los datos de un producto específico para edición.
   * @param id Id del producto a editar.
   */
  async cargarProducto(id: number) {
    this.producto = await this.productosService.obtenerProducto(id);
    console.log(this.producto);
    // Rellenar el formulario con los datos del producto
    this.form.patchValue({
      nombre_prod: this.producto.nombre_prod,
      descripcion: this.producto.descripcion,
      img_prod: this.producto.img_prod,
      precio: this.producto.precio,
      sub_cat_id: this.producto.sub_cat_id.id_subcat,
    });

    // Limpiar selecciones previas para evitar estados inconsistentes
    this.selectedIngredientes.clear();
    this.selectedExtras.clear();
    this.selectedOpciones.clear();

    // Cargar ingredientes, extras y opciones seleccionadas
    const [ingredientesProd, extrasProd, opcionesProd] = await Promise.all([
      this.productosService.obtenerIngredientesDeProducto(id),
      this.productosService.obtenerExtrasDeProducto(id),
      this.productosService.obtenerOpcionesDeProducto(id),
    ]);
    /**
     * Recorrer los ingredientes, extras y opciones del producto
     * y agregarlos a los sets de selección correspondientes.
     */
    ingredientesProd.forEach((ing: Pedidos_has_ingrsel) =>
      this.selectedIngredientes.add(ing.ingrediente_id.id_ingr)
    );
    extrasProd.forEach((ext: Pedidos_has_extrassel) =>
      this.selectedExtras.add(ext.extra_id.id_extra)
    );
    opcionesProd.forEach((opc: Pedidos_has_productos) =>
      this.selectedOpciones.add(opc.opcion_id.id_opcion)
    );
    console.log([ingredientesProd, extrasProd, opcionesProd]);
    // Asignar los datos a las propiedades que usa la vista AHORA que todo está cargado
    this.ingredientesFiltrados = [...this.ingredientes];
    this.extrasFiltrados = [...this.extras];
    this.opcionesFiltradas = [...this.opciones];

    console.log(this.selectedIngredientes);
    console.log(this.selectedExtras);
    console.log(this.selectedOpciones);
    // Forzar la detección de cambios para que la vista se actualice
    this.cdr.detectChanges();
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

  /**
   * Esta función maneja el envío del formulario para crear o actualizar un producto.
   * Realiza validaciones, muestra confirmaciones y utiliza servicios para interactuar
   * con la API y registrar logs de acciones.
   * Esta función se ejecuta al presionar el botón de enviar en el formulario.
   * @returns Producto creado/actualizado
   */
  async onSubmit() {
    try {
      if (this.form.invalid) {
        Swal.fire({
          title: 'Error',
          text: 'Por favor, complete todos los campos obligatorios.',
          icon: 'error',
          timer: 2000,
        });
        return;
      }

      if (this.selectedIngredientes.size === 0) {
        Swal.fire(
          'Error',
          'Por favor, seleccione al menos un ingrediente.',
          'error'
        );
        return;
      }

      const title = this.modoEdicion
        ? '¿Estás seguro de actualizar este producto?'
        : '¿Estás seguro de registrar este producto?';

      const confirmacion = await Swal.fire({
        title: title,
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

        let img_prod: string | undefined;
        if (this.selectedFile) {
          const res_img = await this.productosService.subirImg(
            this.selectedFile
          );
          img_prod = '/productos/' + String(res_img.ruta_img);
        }

        const dto: Partial<ProductosDto> = {
          nombre_prod: this.form.value.nombre_prod,
          descripcion: this.form.value.descripcion,
          precio: parseFloat(this.form.value.precio),
          sub_cat_id: parseInt(this.form.value.sub_cat_id, 10),
          extras: this.extras.filter((extra) =>
            this.selectedExtras.has(extra.id_extra)
          ),
          opciones: this.opciones.filter((opcion) =>
            this.selectedOpciones.has(opcion.id_opcion)
          ),
          ingredientes: this.ingredientes.filter((ingrediente) =>
            this.selectedIngredientes.has(ingrediente.id_ingr)
          ),
        };

        if (img_prod) {
          dto.img_prod = img_prod;
        }

        if (this.modoEdicion && this.id_prod) {
          console.log(dto);
          await this.productosService.actualizarProducto(
            this.id_prod,
            dto as ProductosDto
          );
          Swal.fire('Éxito', 'Producto actualizado', 'success');
          const log: LogsDto = {
            usuario:
              localStorage.getItem('codigo') +
              ' ' +
              localStorage.getItem('nombres'),
            accion: 'Editar producto',
            modulo: 'Productos',
            descripcion: `Se actualizó el producto ${
              this.producto?.nombre_prod ?? ''
            }`,
          };
          await this.logsService.crearLog(log);
          this.resetSelections();
          this.form.reset();
          this.administradorComponent.productos =
            await this.productosService.obtenerProductos();
          this.router.navigate(['/Administrador/productos']);
        } else {
          console.log(dto);
          await this.productosService.registrarProducto(
            dto as ProductosDto
          );

          Swal.fire('Éxito', 'Producto creado', 'success');

          const log: LogsDto = {
            usuario:
              localStorage.getItem('codigo') +
              ' ' +
              localStorage.getItem('nombres'),
            accion: 'Crear producto',
            modulo: 'Productos',
            descripcion: `Se creó el producto ${dto.nombre_prod ?? ''}`,
          };
          await this.logsService.crearLog(log);
        }

        this.resetSelections();
        this.form.reset();
        this.administradorComponent.productos =
          await this.productosService.obtenerProductos();
      }
    } catch (error) {
      if (this.modoEdicion) {
        console.error('Error al intentar editar el producto', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al intentar editar el producto.',
          icon: 'error',
          timer: 2000,
        });
        throw error;
      } else {
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
