import { Request, Response} from 'express';


export const notFound = (req: Request, res: Response) => {
  res.status(404).json({error: "No encontrado"});
}

export const serverError = (req: Request, res: Response) => {
  res.status(500).json({error: `Ocurrio un error en el servicio de Autenticacion`});
}