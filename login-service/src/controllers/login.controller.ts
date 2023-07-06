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
dotenv.config();

router.post('/registro', async (req: Request, res: Response, next : NextFunction) : Promise<void> => {
  try {
    let {email, password} : {email: string, password: string} = req.body;
    email = normalizeText(email);
    console.log();
    const userExists = (await User.find({email})).length > 0;
    if (userExists) res.status(409).json({message: "El usuario ya se encuentra registrado"});
    else {
      password = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        password,
        dateJoined: new Date()
      });

      const userSaved = await newUser.save();
      res.status(201).json({message: "Usuario creado correctamenre", user: userSaved});
    };
  } catch (err) {
    next();
  }
});

router.post('/login', async(req: Request, res: Response, next : NextFunction) : Promise<void> => {
  try {
    let {email, password} : {email: string; password: string} = req.body;
    email = normalizeText(email);

    const user = await User.findOne({email});
    const authorized : boolean = await bcrypt.compare(password, user?.password ?? "");
    if (!user || !authorized) {
      res.status(401).json({message: "El usuario o la contraseña son incorrectos"});
    }
    const JWT_KEY : string = process.env.JWT_KEY ?? "";

    const token : string = jwt.sign({email}, JWT_KEY, {expiresIn: '1h'});


    res.status(200).json({token, message: "Credenciales validas"})
    // const passwordIsCorrect = await bcrypt.compare(password, user.password);

  } catch (err) {
    next();
  }
});

router.get('/listar', async (req: Request, res : Response, next : NextFunction) => {
  const {authorization} : IncomingHttpHeaders = req.headers;
  const JWT_KEY : string | undefined = process.env.JWT_KEY;
  const page : number = Number(req.query.page) || 0;
  const USERS_PER_PAGE : number = 3;
  const queryString: string = req.query.queryString as string || "";

  if (authorization && JWT_KEY) {
    try {
      const decodedToken = jwt.verify(authorization?.split(' ')[1], JWT_KEY) as JwtPayload;
      const { email } : JwtPayload = decodedToken;
      const {data} = await axios.get(`http://localhost:3001/business/listar?page=${page}&quantity=${USERS_PER_PAGE}&queryString=${queryString}`, {
        headers: {
          "Authorization" : authorization,
          "origin" : `${req.headers.host}/auth/listar`
        }
      });
      if (data) res.status(200).json(data.users);
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