import {Router, Request, Response, NextFunction} from 'express';
import { User } from '../models/User';
import { normalizeText } from '../utils/utils';
import bcrypt from 'bcrypt';
import { serverError, notFound } from '../middlewares/notFound';
import { Model } from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


const router: Router = Router();
dotenv.config();

router.post('/registro', async (req: Request, res: Response, next : NextFunction) : Promise<void> => {
  try {
    let {email, password} : {email: string, password: string} = req.body;
    email = normalizeText(email);

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
    let {email, password} : {email: string, password: string} = req.body;
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
})

router.use(serverError);

export default router;