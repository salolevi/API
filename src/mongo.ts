import mongoose, { mongo } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Aca establezco la conexion con la base de datos utilizando variables de entorno para no filtrar la contraseña.
const uri: string = process.env.MONGODB_URI || "";

mongoose.connect(uri)
  .then(() => {
    console.log('Conexion establecida correctamente a la base de datos');
  })
  .catch(error => {
    console.log(uri);
    console.error(error);
  });  