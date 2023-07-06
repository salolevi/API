import {Router, Request, Response, NextFunction} from 'express';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import { serverError, notFound } from '../middlewares/notFound';
import { Model } from 'mongoose';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IncomingHttpHeaders } from 'http';
import { normalizeText } from '../utils/utils';
import { BlobOptions } from 'buffer';


const router: Router = Router();
dotenv.config();

router.get('/listar', async (req: Request, res : Response, next : NextFunction) => {
  const {authorization} : IncomingHttpHeaders = req.headers;
  const JWT_KEY : string = process.env.JWT_KEY ?? "";
  const domainLogin : string = `${process.env.DOMAIN_LOGIN}auth/listar` ?? "";
  const {origin} : IncomingHttpHeaders = req.headers;
  const validOrigin : boolean = origin === domainLogin;

  const page : number = Number(req.query.page) || 0;
  const quantityPerPage = Number(req.query.quantity) || 50;
  const queryString: string = req.query.queryString as string || "";

  if (authorization && JWT_KEY && validOrigin) {
    try {
      const decodedToken = jwt.verify(authorization?.split(' ')[1], JWT_KEY) as JwtPayload;
      const { email } : JwtPayload = decodedToken;
      const user = await User.findOne({email});
      if (user) res.status(200).json({users: await User.find({email : {$regex: queryString, $options: 'i'}}).skip(page * quantityPerPage).limit(quantityPerPage)}) 
      else throw new Error("error");
    }catch (err) {
      res.status(401).json({error: "Acceso no autorizado"});
    }
  }
  else res.status(401).json({error: "Acceso no autorizado"});
})  

router.use(serverError);

export default router;