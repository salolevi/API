import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import './mongo';
import { User } from './models/User';
import mongoose from 'mongoose';
import { notFound } from './middlewares/notFound';
import businessController from './routes/business.routes'

const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).send("");
});

app.use('/business', businessController);

app.use(notFound);

export default app;