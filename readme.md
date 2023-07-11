## API CONEXA  

# 1 Modulo de Login

La api contiene 3 endpoints

1) Endpoint de registro -> se debe enviar una solicitud post al endpoint /auth/registro con un cuerpo que tenga esta estructura: {"email": string, "password": string}. Si el email no se encuentra registrado se enviara un estado 201 indicando la creacion del nuevo usuario.
2) Endpoint de login -> se debe enviar una solicitud post al endpoint /auth/login con un cuerpo identico en estructura al del endpoint de registro. Si las credenciales son validas se genera un token jwt que expira dentro de la hora.
3) Endpoint de listar
4) -> Se envia una solicitud get al endpoint /auth/listar, en este se pueden añadir parametros como *page* que debe contener un valor numerico, *queryString* que sera el caracter por el cual se fitlran los usuarios a buscar, y por ultimo una flag llamada *visualize* que indica que se deben mostrar todos los usuarios sin hacer ningun tipo de paginacion.
5) -> Esta solicitud requiero un header llamado *Authorization* en el que se incluye el token generado en el endpoint de login, debe contar con un valor string que tenga esta estructura "Bearer {token}"

# 2 Modulo de Negocio
Solo contiene un endpoint, el de listar.
Se debe enviar una solicitud al endpoint /business/listar que debe contener 3 parametros *page*, y *queryString* mencionados previamente y otro mas llamado *quantity*, este indicara la cantidad de usuarios que se visualizaran por pagina.
De no enviarse un parametro se utilizan valores por default.

La manera de enviar las solicitudes al endpoint de listar en los dos servicios se define asi:
Endpoint de *Login*: /auth/listar?page={numero}(opcional)&queryString={string}(opcional)&visualize={boolean}(opcional)
Endpoint de *Negocio*: /business/listar?page={numero}(opcional)&queryString={string}(opcional)&quantity={numero}(opcional)
