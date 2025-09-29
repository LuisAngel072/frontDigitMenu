export type Usuarios = {
  id_usuario: number;
  codigo: string;
  nombres: string;
  primer_apellido: string;
  segundo_apellido: string;
  telefono_id: Telefonos;
  email_id: Email;
  sexo: string; // Pienso en un ENUM: Masc, Fem, Otro
  rfc: RFC;
  nss: NSS;
  domicilio: Domicilios;
  img_perfil: Img_us;
  constrasena: string;
  activo: boolean; //El valor es entre 1 y 0. 1 activo, 0 inactivo
};

export type Telefonos = {
  id_telefono: number;
  telefono: string; //No mas de 12 caracteres
};
export type Domicilios = {
  id_dom: number;
  calle: string;
  colonia: string;
  codigo_postal: string; //Solo 5 caracteres
  no_ext: string; //Solo 5 caracteres
  no_int?: string; //Opcional, posible undefined, no mas de 5 caracteres
  municipio: string;
};

export type NSS = {
  id_nss: number;
  nss: string; //11 caracteres máximo
};

export type RFC = {
  id_rfc: number;
  rfc: string;
};

export type Email = {
  id_email: number;
  email: string;
};

export type Roles = {
  id_rol: number;
  rol: string;
  descripcion: string;
};

export type Img_us = {
  id_img: number;
  img_ruta: string; //Ruta de la imagen de no mas de 255 caracteres
};
export type Usuarios_has_roles = {
  id_us_rol: number;
  usuario_id: Usuarios;
  rol_id: Roles;
};

export type Productos = {
  id_prod: number;
  nombre_prod: string;
  descripcion: string;
  img_prod: string; //Ruta
  sub_cat_id: Sub_categorias;
  precio: number;
};

export type Sub_categorias = {
  id_subcat: number;
  nombre_subcat: string;
  categoria_id: Categorias;
  ruta_img?: string;
};

export type Categorias = {
  id_cat: number;
  nombre_cat: string;
  ruta_img?: string;
};

export type Ingredientes = {
  id_ingr: number;
  nombre_ingrediente: string;
  precio: number;
};

export type Extras = {
  id_extra: number;
  nombre_extra: string;
  precio: number;
};

export type Opciones = {
  id_opcion: number;
  nombre_opcion: string;
  porcentaje: number;
};

//Productos_has_extras
export type P_H_E = {
  producto_extra_id: number;
  precio: number;
  extra_id: Extras;
  producto_id?: Productos;
};

//Productos_has_opciones
export type P_H_O = {
  producto_opc_id: number;
  porcentaje: number;
  opcion_id: Opciones;
  producto_id?: Productos;
};

//Productos_has_ingredientes
export type P_H_I = {
  producto_ingr_id: number;
  precio: number;
  ingrediente_id: Ingredientes;
  producto_id?: Productos;
};

export enum EstadoPedido {
  iniciado = 'Iniciado',
  pagado = 'Pagado',
}

//Tabla pedidos
export type Pedidos = {
  id_pedido: number;
  no_mesa: Mesas;
  fecha_pedido: Date;
  total: number;
};
// Tabla mesas
export type Mesas = {
  id_mesa: number;
  no_mesa: number;
  qr_code_url: string;
};

// Datos de un producto sobre un pedido
export type Producto_extras_ingrSel = {
  pedido_prod_id: number;
  pedido_id: Pedidos;
  producto_id: Productos;
  estado: EstadoPedidoHasProductos;
  precio: number;
  opcion_id: Opciones;
  extras: Extras[];
  ingredientes: Ingredientes[];
};

//Tabla pedidos_has_productos
export type Pedidos_has_productos = {
  pedido_prod_id: number; //Llave primaria
  pedido_id: Pedidos; //Llave foránea a pedidos
  producto_id: Productos; //Llave foranea a productos
  estado: EstadoPedidoHasProductos; //Enum estado
  precio: number; //Precio calculado al escoger los ingr, extras y opcion del producto en el pedido
  opcion_id: Opciones; //Llave foranea de opciones, la opcion seleccionada que el cliente escogió
}

// Tabla pedidos_has_extrassel
export type Pedidos_has_extrassel = {
  pedido_extra_id: number; //Llave primaria
  precio: number; //Precio del extra registrado en el momento
  pedido_prod_id: Pedidos_has_productos; //Llave que referencia al producto del pedido que
  // se están seleccionando los extras
  extra_id: Extras; //Extra seleccionado
}
// Tabla pedidos_has_ingrsel
export type Pedidos_has_ingrsel = {
  ped_ingr_id: number;
  precio: number;
  pedido_prod_id: Pedidos_has_productos;
  ingrediente_id: Ingredientes; // ← Corregir esto también
}

export enum EstadoPedidoHasProductos {
  sin_preparar = 'Sin preparar',
  preparado = 'Preparado',
  entregado = 'Entregado',
  pagado = 'Pagado',
}
