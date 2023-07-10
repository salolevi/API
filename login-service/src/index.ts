import express, {Express, Request, Response} from 'express';
import cors from 'cors';
import './mongo'; //Establezco la conexion a la base de datos
import { User } from './models/User';
import mongoose from 'mongoose';
import { notFound } from './middlewares/notFound';
import loginRouter from './routes/login.routes';
// Cargo las variables de entorno del microservicio en el script
 //Obtengo el numero de puerto desde las variables de entorno, de no tener una configurada
//lo predetermino a utilizar el 8080
const app: Express = express(); //genero una instancia de applicacion express

//utilizo los middlewares para permitirs solicitudes cors y para parsear los cuerpos de las solicitudes a json
app.use(cors());
app.use(express.json());


//endpoint de prueba que devuelve todos los usuarios (no sigue logica de microservicios y es unicamente para verificacion mientras se desarrolla)
app.get('/', (req: Request, res: Response) => {
  User.find({})
    .then(result => res.json(result))
    .catch(err => {
      mongoose.connection.close();
      console.error(err);
    });
});


app.use('/auth', loginRouter); //utilizo un controlador personalizado con url base /auth destinado para el servicio de autenticacion y mantener el index limpio

app.use(notFound); // en caso de no encontrar las rutas express utilizara este middleware que indica que no se encontro el recurso solicitado

//le indicamos a la instancia de la aplicacion que comience a escuchar solicitudes en el puerto especificado
export default app;