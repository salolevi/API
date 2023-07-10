import app from './index';
import dotenv from 'dotenv';

dotenv.config();

const PORT: Number = Number(process.env.PORT) || 8080;

app.listen(PORT, () => {
  console.log(`Escuchando en puerto: ${PORT} || Servicio de autenticacion`);
})