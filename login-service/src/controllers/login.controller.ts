import express, {Router, Request, Response, NextFunction} from 'express';
import { User } from '../models/User';
import { normalizeText } from '../utils/utils';
import bcrypt from 'bcrypt';
import { serverError, notFound } from '../middlewares/notFound';
import { Model } from 'mongoose';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IncomingHttpHeaders } from 'http';
import axios from 'axios';
import { ParsedUrlQuery } from 'querystring';


const router: Router = Router();
dotenv.config(); //como en el archivo index.ts cargo la configuracion para poder utilizar las variables de entorno

//controlador de la ruta registro /auth/registro
router.post('/registro', async (req: Request, res: Response, next : NextFunction) : Promise<void> => {
  try {
    let {email, password} : {email: string, password: string} = req.body; //recupero las propiedades email y password del cuerpo de la solicitud
    email = normalizeText(email); //normalizo el email para sacarle mayusculas y tildes
    const userExists = (await User.find({email})).length > 0; //corroboro que no exista un usuario con ese mail en el sistema
    if (userExists) res.status(409).json({message: "El usuario ya se encuentra registrado"}); // de ser asi se envia un estado 409 que indica que existe un conflicto
    else {
      password = await bcrypt.hash(password, 10); // de no ser asi, encripto la contraseña para guardarla seguramente en la base de datos
      const newUser = new User({
        email,
        password,
        dateJoined: new Date()
      }); //creo un usuario utilizando el esquema del archivo User.ts

      const userSaved = await newUser.save(); //guardo la nueva instancia del usuario ya creado
      res.status(201).json({message: "Usuario creado correctamente", user: userSaved}); //envio codigo 201 (creado) y muestro la informacion del mismo
    };
  } catch (err) { //si existe un error al intentar encriptar o guardar el nuevo usuario se indica de utilizar el siguiente middleware que muestra un error en el servidor o la solicitud
    next();
  }
});

router.post('/login', async(req: Request, res: Response, next : NextFunction) : Promise<void> => {
  try {
    let {email, password} : {email: string; password: string} = req.body; //recupero las propiedades email y password del cuerpo de la solicitud
    email = normalizeText(email); //normalizo el email para sacarle mayusculas y tildes

    const user = await User.findOne({email}); //busco y obtengo el usuario correspondiente a ese email
    const authorized : boolean = await bcrypt.compare(password, user?.password ?? ""); // comparo las dos contraseñas encriptadas para corroborar que sean las mismas
    if (!user || !authorized) {
      res.status(401).json({message: "El usuario o la contraseña son incorrectos"}); //en caso que el usuario o la autorizacion sean invalidas se envia un 401
      // para indicar que la solicitud no esta autorizada
    }
    const JWT_KEY : string = process.env.JWT_KEY ?? ""; //si no es el caso, obtengo la JWT key que guardamos en el archivo .env (esta sera la misma para los dos servicios)

    const token : string = jwt.sign({email}, JWT_KEY, {expiresIn: '1h'}); //genero un nuevo token firmandolo con el email del usuario que envio la solicitud y que expira en una hora


    res.status(200).json({token, message: "Credenciales validas"}) //devuelvo el token junto a un mensaje indicando el exito de la solicitud

  } catch (err) { //si existe un error al intentar encriptar o guardar el nuevo usuario se indica de utilizar el siguiente middleware que muestra un error en el servidor o la solicitud
    next();
  }
});

router.get('/listar', async (req: Request, res : Response, next : NextFunction) => {
  const {authorization} : IncomingHttpHeaders = req.headers;
  const JWT_KEY : string | undefined = process.env.JWT_KEY;
  const visualizeAll : boolean = req.query.visualize === 'true'; 
  const page : number = !visualizeAll ? (Number(req.query.page) || 0) : 0;
  const USERS_PER_PAGE : number = visualizeAll ? 999999 : 3;
  const queryString: string = !visualizeAll ? (req.query.queryString as string || "") : "";

  if (authorization && JWT_KEY) {
    try {
      const decodedToken = jwt.verify(authorization?.split(' ')[1], JWT_KEY) as JwtPayload;
      const { email } : JwtPayload = decodedToken;
      console.log(`---- Solicitando informacion al servicio de Negocios ----`);
      const {data} = await axios.get(`http://localhost:3001/business/listar?page=${page}&quantity=${USERS_PER_PAGE}&queryString=${queryString}`, {
        headers: {
          "Authorization" : authorization,
          "origin" : `${req.headers.host}/auth/listar`
        }
      });
      if (data) {
        console.log(`SOLICITUD EXIOTSA`);
        res.status(200).json(data.users);
      }
      else throw new Error("Error de autorizacion");
    }catch (err) {
      console.log(err);
      res.status(401).json({error: "Acceso no autorizado"});
    }
  }
  else res.status(401).json({error: "Acceso no autorizado"});
})  

router.use(serverError);

export default router;