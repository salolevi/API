import express, {Express, Request, Response} from 'express';

const PORT: Number = 3000;

const app: Express = express();


app.get('/', (req: Request, res: Response) => {
  res.send(`Bueeenas`);
});


app.listen(PORT, () => {
  console.log(`Escuchando en puerto: ${PORT}`);
})