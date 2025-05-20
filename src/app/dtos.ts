import { EstadoPedido, Extras, Ingredientes, Opciones } from "./types";

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
  img_perfil: { img_ruta: string };
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
