import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import './mongo';
import { User } from './models/User';
import mongoose from 'mongoose';
import { notFound } from './middlewares/notFound';
import loginController from './controllers/login.controller';
dotenv.config();

const PORT: Number = Number(process.env.PORT) || 8080;
const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  User.find({})
    .then(result => res.json(result))
    .catch(err => {
      mongoose.connection.close();
      console.error(err);
    });
});

app.use('/auth', loginController);

app.use(notFound);

app.listen(PORT, () => {
  console.log(`Escuchando en puerto: ${PORT} || Servicio de autenticacion`);
})