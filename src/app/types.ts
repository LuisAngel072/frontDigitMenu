export type Usuarios = {
	id_usuario: number,
	codigo: string,
	nombres: string,
	primer_apellido: string,
	segundo_apellido: string,
	telefono_id: Telefonos
	email_id: Email,
	sexo: string, // Pienso en un ENUM: Masc, Fem, Otro
	rfc: RFC,
	nss: NSS,
	domicilio: Domicilios,
    img_perfil: Img_us,
    constrasena: string;
    activo: number, //El valor es entre 1 y 0. 1 activo, 0 inactivo
}	

export type Telefonos = {
    id_telefono: number,
    telefono: string, //No mas de 12 caracteres
}
export type Domicilios = {
    id_dom: number,
    calle: string,
    colonia: string,
    codigo_postal: string, //Solo 5 caracteres
    no_ext: string, //Solo 5 caracteres
    no_int?: string //Opcional, posible undefined, no mas de 5 caracteres
    municipio: string, 
}

export type NSS = {
    id_nss: number,
    nss: string, //11 caracteres máximo
}

export type RFC = {
    id_rfc: number,
    rfc: string,
}

export type Email = {
    id_email: number,
    email: string,
}

export type Roles = {
    id_rol: number,
    rol: string,
    descripcion: string,
}

export type Img_us = {
    id_img: number,
    img_ruta: string, //Ruta de la imagen de no mas de 255 caracteres
}
export type Usuarios_has_roles = {
    id_us_rol: number,
    usuario_id: Usuarios,
    rol_id: Roles,
}

export type Productos = {
	id_prod: number,
	nombre_prod: string,
	descripcion: string,
	img_prod: string, //Ruta
	subcat_id: Sub_categorias,
	precio: number,
}	

export type Sub_categorias = {
    id_subcat: number,
	nombre_subcat: string,
	categoria_id: Categorias,
}

export type Categorias = {
    id_cat: number,
	nombre_cat: string,
}

export type Ingredientes = {
	id_ing: number,
	nombre_ingrediente: string,
	precio: number,
}

export type Extras = {
    
}