import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import './mongo';
import { User } from './models/User';
import mongoose from 'mongoose';
import { notFound } from './middlewares/notFound';
import businessController from './routes/business.routes'

const app: Express = express();

//utilizo los middlewares para permitirs solicitudes cors y para parsear los cuerpos de las solicitudes a json
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).send("Servicio de Negocio");
});

app.use('/business', businessController); //utilizo un controlador personalizado con url base /business destinado para el servicio de negocio y mantener el index limpio

app.use(notFound);

export default app;