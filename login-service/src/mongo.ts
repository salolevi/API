import mongoose, { mongo } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Aca establezco la conexion con la base de datos utilizando variables de entorno para no filtrar la contraseña.
const uri: string = process.env.MONGODB_URI || "";

// Establezco la conexion utilizando la URI, en caso de fallar se muestra el error en la consola del servidor
mongoose.connect(uri)
  .then(() => {
    console.log('Conexion establecida correctamente a la base de datos');
  })
  .catch(error => {
    console.error(error);
  });  