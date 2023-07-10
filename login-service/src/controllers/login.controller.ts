import express, {Router, Request, Response, NextFunction} from 'express';
import { normalizeText, validateEmail } from '../utils/utils';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import axios from 'axios';
import { IncomingHttpHeaders } from 'http';
import dotenv from 'dotenv';
dotenv.config(); //como en el archivo index.ts cargo la configuracion para poder utilizar las variables de entorno



export const registerFunction = async (req: Request, res: Response, next : NextFunction) : Promise<void> => {
  try {
    let {email, password} : {email: string, password: string} = req.body; //recupero las propiedades email y password del cuerpo de la solicitud
    email = normalizeText(email); //normalizo el email para sacarle mayusculas y tildes
    if (!validateEmail(email) || password === "") {
      res.status(400).json({error: "Formato de mail o contraseña invalido"});
      return; //corroboro que no exista un usuario con ese mail en el sistema
    };
    const userExists = (await User.find({email})).length > 0;
    if (userExists) {
      res.status(409).json({error: "El usuario ya se encuentra registrado"});
      return;
    } // de ser asi se envia un estado 409 que indica que existe un conflicto
    password = await bcrypt.hash(password, 10); // de no ser asi, encripto la contraseña para guardarla seguramente en la base de datos
    const newUser = new User({
      email,
      password,
      dateJoined: new Date()
    }); //creo un usuario utilizando el esquema del archivo User.ts

    const userSaved = await newUser.save(); //guardo la nueva instancia del usuario ya creado
    res.status(201).json({message: "Usuario creado correctamente", user: userSaved}); //envio codigo 201 (creado) y muestro la informacion del mismo
  } catch (err) { //si existe un error al intentar encriptar o guardar el nuevo usuario se indica de utilizar el siguiente middleware que muestra un error en el servidor o la solicitud
    next();
  }
}

export const loginFunction = async(req: Request, res: Response, next : NextFunction) : Promise<void> => {
  try {
    let {email, password} : {email: string; password: string} = req.body; //recupero las propiedades email y password del cuerpo de la solicitud
    email = normalizeText(email); //normalizo el email para sacarle mayusculas y tildes
    if (!validateEmail(email) || password === "") {
      res.status(400).json({error: "Formato de mail o contraseña invalido"});
      return;
    }
    const user = await User.findOne({email}); //busco y obtengo el usuario correspondiente a ese email
    const authorized : boolean = await bcrypt.compare(password, user?.password ?? ""); // comparo las dos contraseñas encriptadas para corroborar que sean las mismas
    if (!user || !authorized) {
      res.status(401).json({error: "El usuario o la contraseña son incorrectos"}); //en caso que el usuario o la autorizacion sean invalidas se envia un 401
      return;
      // para indicar que la solicitud no esta autorizada
    }
    const JWT_KEY : string = process.env.JWT_KEY ?? ""; //si no es el caso, obtengo la JWT key que guardamos en el archivo .env (esta sera la misma para los dos servicios)

    const token : string = jwt.sign({email}, JWT_KEY, {expiresIn: '1h'}); //genero un nuevo token firmandolo con el email del usuario que envio la solicitud y que expira en una hora

    res.status(200).json({token, message: "Credenciales validas"}); //devuelvo el token junto a un mensaje indicando el exito de la solicitud

  } catch (err) { //si existe un error al intentar encriptar o guardar el nuevo usuario se indica de utilizar el siguiente middleware que muestra un error en el servidor o la solicitud
    next();
  }
}

export const listFunction = async (req: Request, res : Response, next : NextFunction) => {
  const {authorization} : IncomingHttpHeaders = req.headers;
  const JWT_KEY : string | undefined = process.env.JWT_KEY;
  const visualizeAll : boolean = req.query.visualize === 'true'; 
  const page : number = !visualizeAll ? (Number(req.query.page) || 0) : 0;
  const USERS_PER_PAGE : number = visualizeAll ? Infinity : 3;
  const queryString: string = !visualizeAll ? (req.query.queryString as string || "") : "";
  const origin : string = process.env.NODE_ENV === 'test' ? 'test' : (req.headers.host ?? "");
  console.log(process.env.NODE_ENV);

  if (authorization && JWT_KEY) {
    try {
      const decodedToken = jwt.verify(authorization?.split(' ')[1], JWT_KEY) as JwtPayload;
      const { email } : JwtPayload = decodedToken;
      console.log(`---- Solicitando informacion al servicio de Negocios ----`);
      const {data} = await axios.get(`http://localhost:3001/business/listar?page=${page}&quantity=${USERS_PER_PAGE}&queryString=${queryString}`, {
        headers: {
          "Authorization" : authorization,
          "origin" : `${origin}/auth/listar`
        }
      });
      if (data) {
        console.log(`SOLICITUD EXIOTSA`);
        res.status(200).json(data.users);
      }
      else throw new Error("Error de autorizacion");
    }catch (err) {
      res.status(401).json({error: "Acceso no autorizado || problema al validar el token o al enviar la solicitud"});
    }
  }
  else res.status(401).json({error: "Acceso no autorizado || token incorrecta o problema con el servidor"});
}