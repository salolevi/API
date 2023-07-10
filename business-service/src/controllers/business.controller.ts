import { Request, Response, NextFunction} from 'express';
import { User } from '../models/User';
import jwt, {JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IncomingHttpHeaders } from 'http';

dotenv.config();


export const listFunction = async (req: Request, res : Response, next : NextFunction) => {
  const {authorization} : IncomingHttpHeaders = req.headers;
  const JWT_KEY : string = process.env.JWT_KEY ?? "";
  const domainLogin : string = `${process.env.DOMAIN_LOGIN}auth/listar` ?? "";
  const {origin} : IncomingHttpHeaders = req.headers;
  const validOrigin : boolean = (origin === domainLogin) || (origin?.startsWith('test') ?? false);

  const page : number = Number(req.query.page) || 0;
  const quantityPerPage = Number(req.query.quantity) || 50;
  const queryString: string = req.query.queryString as string || "";
  console.log({page, quantityPerPage, queryString});

  if (authorization && JWT_KEY && validOrigin) {
    try {
      const decodedToken = jwt.verify(authorization?.split(' ')[1], JWT_KEY) as JwtPayload;
      const { email } : JwtPayload = decodedToken;
      console.log(decodedToken);
      const user = await User.findOne({email});
      console.log(user);
      if (user) res.status(200).json({users: await User.find({email : {$regex: queryString, $options: 'i'}}).skip(page * quantityPerPage).limit(quantityPerPage)});
      else throw new Error("Usuario no encontrado");
    }catch (err) {
      console.log(err);
      res.status(401).json({error: "Acceso no autorizado"});
    }
  }
  else res.status(401).json({error: "Acceso no autorizado"});
}