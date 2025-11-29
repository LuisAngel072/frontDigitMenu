import { EstadoPedido, Extras, Ingredientes, Opciones } from "./types";
/**
 * Data Transfer Objects (DTOs) para la comunicación con la API.
 * Estos tipos definen la estructura de los datos que se envían y reciben
 * entre el frontend y el backend.
 * Cada DTO corresponde a una entidad o acción específica en el sistema.
 * Por ejemplo, UsuariosDTO define la estructura de los datos de un usuario,
 * incluyendo información personal, contacto, rol y estado.
 * Estos DTOs facilitan la validación y manipulación de datos en la aplicación.
 *
 * Los DTOs deben coincidir con los DTOs establecidos en el backend para asegurar
 * una comunicación correcta y evitar errores de desajuste de datos.
 */
export type UsuariosDTO = {
  codigo: string;
  nombres: string;
  primer_apellido: string;
  segundo_apellido: string;
  telefono_id: {
    telefono: string;
  };
  email_id: {
    email: string;
  };
  sexo: string; // Pienso en un ENUM: Masc, Fem, Otro
  rfc: {
    rfc: string;
  };
  nss: {
    nss: string;
  };
  domicilio: {
    calle: string;
    colonia: string;
    codigo_postal: string; //Solo 5 caracteres
    no_ext: string; //Solo 5 caracteres
    no_int?: string; //Opcional, posible undefined, no mas de 5 caracteres
    municipio: string;
  };
  img_perfil?: { img_ruta: string };
  rol: {
    id_rol: number;
    rol: string;
    descripcion: string;
  }[];
  contrasena: string;
  activo: boolean; //El valor es entre 1 y 0. 1 activo, 0 inactivo
};

export type IngredientesDTO = {
  nombre_ingrediente: string;
  precio: number;
};

export type ExtrasDTO = {
  nombre_extra: string;
  precio: number;
};

export type OpcionesDTO = {
  nombre_opcion: string;
  porcentaje: number;
};

export type CategoriasDTO = {
  nombre_cat: string;
  ruta_img: string;
};

export type SubcategoriasDTO = {
  nombre_subcat: string;
  categoria_id: number;
  ruta_img: string;
};

export type ProductosDto = {
  nombre_prod: string;
  descripcion: string;
  img_prod: string;
  precio: number;
  sub_cat_id: number;
  extras: Extras[];
  opciones: Opciones[];
  ingredientes: Ingredientes[];
}

//Solo manejar las llaves primarias
export type Pedidos_has_ProductosDto = {
  pedido_id: number;
  producto_id: number;
  precio: number;
  opcion_id: number;
  extras: number[]; //Llaves primarias de los extras
  ingr: number[]; //Llaves primarias de los ingredientes
}

export type CrPedidoDto = {
  no_mesa: number; //Para crear un pedido, crealo simplemente con el no. de mesa
  //donde se encuentran los clientes
}

export type UpPedidoDto = {
  total: number; //Actualiza el total del pedido, conforme se agregan productos al mismo
  estado: EstadoPedido; //Actualiza el estado del pedido, si este fue pagado/terminado
}

export type LogsDto = {
  usuario: string; //Se almacena directamente como texto, para evitar problemas si se elimina el usuario
  accion: string; //Acción realizada (Crear, Actualizar, Eliminar, Iniciar sesión, etc.)
  modulo: string; //Módulo donde se realizó la acción (Usuarios, Productos, Pedidos, etc.)
  descripcion?: string; //Opcional, puede ser undefined
}
