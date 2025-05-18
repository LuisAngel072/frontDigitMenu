export const environment = {
    production: false,
    ApiIP: "http://localhost:3000/api/",
    ApiUp: "http://localhost:3000/uploads/",

    /**
     * General
     */
    ApiLogin:"auth/login", //Post

    /**
     * Administrador
     */
    ApiEncontrarUsuario: "usuarios", //Get
    ApiCrearUsuario:"usuarios/registro", //Post
    ApiEncontrarUnUsuario: "usuarios/",
    ApiEncontrarRolesYUsuario: "roles/getUsuarios",
    ApiActualizarUsuario: "usuarios/actualizar/",
    ApiDesactivarUsuario: "usuarios/desactivar/",
    ApiReactivarUsuario: "usuarios/reactivar/",

    /**
     * Roles
     */
    ApiObtenerRoles: "roles", //GET

    /**
     * Categorias
     */
    ApiObtenerCategorias: "categorias",//GET
    ApiObtenerCategoria: "categorias/",//GET
    ApiRegistrarCategoria: "categorias/registrar",//POST
    ApiEditarCategoria: "categorias/actualizar/", //PATCH
    ApitEliminarCategoria: "categorias/eliminar/",//DELETE

    /**
     * SubCategorias
     */
    ApiObtenerSubCategorias: "sub-categorias",//GET
    ApiObtenerSubCategoria: "sub-categorias/",//GET
    ApiRegistrarSubCategoria: "sub-categorias/registrar",//POST
    ApiEditarSubCategoria: "sub-categorias/editar/", //PATCH
    ApitEliminarSubCategoria: "sub-categorias/eliminar/",//DELETE

    /**
     * Ingredientes
     */
    ApiObtenerIngredientes: "ingredientes", //GET
    ApiCrearIngrediente: "ingredientes/registrar", //POST
    ApiActualizarIngrediente: "ingredientes/actualizar/", //PATCH
    ApiEliminarIngrediente: "ingredientes/eliminar/", //DELETE

    /**
     * Extras
     */
    ApiObtenerExtras: "extras", //GET
    ApiObtenerExtra: "extras/", //GET
    ApiCrearExtra: "extras/registrar", //POST
    ApiActualizarExtra: "extras/actualizar/", //PATCH
    ApiEliminarExtra: "extras/eliminar/", //DELETE

    /**
     * Opciones
     */
    ApiObtenerOpciones: "opciones", //GET
    ApiObtenerOpcion: "opciones/", //GET
    ApiCrearOpcion: "opciones/registrar", //POST
    ApiActualizarOpcion: "opciones/actualizar/", //PATCH
    ApiEliminarOpcion: "opciones/eliminar/", //DELETE

    /**
     * Productos
     */
    ApiObtenerProductos: "productos", //GET
    ApiObtenerProducto: "productos/", // GET /:id_producto
    ApiObtenerExtrasDeProducto: "productos/extras/", //GET /:id_producto
    ApiObtenerOpcionesDeProducto: "productos/opciones/", //GET /:id_producto
    ApiObtenerIngredientesDeProducto: "productos/ingredientes/", //GET /:id_producto
    ApiRegistrarProducto: "productos/registrar", //POST
    ApiActualizarProducto: "productos/actualizar/", //PATCH /:id_producto
    ApiEliminarProducto: "productos/eliminar/", //DELETE /:id_producto
    ApiSubirImgProducto: "productos/subir-img_prod", //POST

      /**
   * Pedidos
   */
  ApiObtenerPedidos: "pedidos", // GET
  ApiObtenerProductosDePedido: "pedidos/productos/", // GET /:id_pedido
   ApiObtenerExtrasIngrProducto: "pedidos/productos/extrasIngrs", // GET /pedidos/productos/extrasIngrs/:p_h_pr_id
  ApiCrearPedido: "pedidos/registrar", // POST
  ApiAgregarProductoAlPedido: "pedidos/registrar/productos", // POST
  ApiActualizarPedido: "pedidos/actualizar/", // PATCH /:id_pedido
  ApiCambiarEstadoProducto: "pedidos/actualizar/", // PATCH /:pedido_prod_id
}
