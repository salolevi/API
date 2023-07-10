import { Request, Response, NextFunction} from 'express';
import { User, IUser } from '../models/User';
import jwt, {JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IncomingHttpHeaders } from 'http';
import { HydratedDocument } from 'mongoose';

dotenv.config(); //cargo las variables de entorno en el script

export const listFunction = async (req: Request, res : Response, next : NextFunction) => {
  const {authorization} : IncomingHttpHeaders = req.headers; //obtengo el token jwt desde el header de autorizacion
  const JWT_KEY : string = process.env.JWT_KEY ?? ""; // capturo la clave privada de jwt compartida entre los dos microservicios
  const domainLogin : string = `${process.env.DOMAIN_LOGIN}auth/listar` ?? ""; //obtengo el dominio del servicio de autenticacion
  const {origin} : IncomingHttpHeaders = req.headers; //capturo el origen de la solicitud desde los headers
  const validOrigin : boolean = (origin === domainLogin) || (origin?.startsWith('test') ?? false); //verifico que el origen de la solicud sea el que se definio en las variables de entorno para cersiorarme que el origen sea del endpoint adecuado

  // capturo los parametros de la solicitud y de no existir les asigno numeros predeterminados
  const page : number = Number(req.query.page) || 0; 
  const quantityPerPage = Number(req.query.quantity) || 50;
  const queryString: string = req.query.queryString as string || "";

  if (authorization && JWT_KEY && validOrigin) { // en caso que el token este presente, la clave haya podido ser capturada y el origen sea valido, se procede a validar el token y retornar los usuarios
    try {
      const decodedToken = jwt.verify(authorization?.split(' ')[1], JWT_KEY) as JwtPayload; //verifico el token con la clave privada
      const { email } : JwtPayload = decodedToken; //obtengo el email que ingrese a la hora de firmar el token cuando se autentico el usuario
      const user : HydratedDocument<IUser> | null = await User.findOne({email}); //busco que exista un usuario con ese mail
      //de ser asi, se devuelven los usuarios encontrados que correspondan a la query, salteando las paginas indicadas y mostrando la pagina correcta con el numero de usuarios que vino en la solicitud
      if (user) res.status(200).json({users: await User.find({email : {$regex: queryString, $options: 'i'}}).skip(page * quantityPerPage).limit(quantityPerPage)});
      else throw new Error("Usuario no encontrado"); // si no se encuentra el usuario se arroja 401
    }catch (err) { // en caso que haya un error al veriricar el token tambien se envia 401
      console.log(err);
      res.status(401).json({error: "Acceso no autorizado"});
    }
  }
  else res.status(401).json({error: "Acceso no autorizado"}); // y en caso de no tener el token, la clave privad o que el origen sea invalido se envia nuevamente un estado 401
}