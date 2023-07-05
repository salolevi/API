import {Router, Request, Response} from 'express';
import { User } from '../models/User';
import { normalizeText } from '../utils/utils';

const router: Router = Router();

router.post('/registro', async (req: Request, res: Response) : Promise<void> => {
  try {
    let {email, password} : {email: string, password: string} = req.body;
    email = normalizeText(email);
    password = normalizeText(password);

    const userExists = (await User.find({email})).length > 0;
    if (userExists) res.status(409).json({message: "El usuario ya se encuentra registrado"});
    else {
      const newUser = new User({
        email,
        password,
        dateJoined: new Date()
      });

      const userSaved = await newUser.save();
      res.status(201).json({message: "Usuario creado correctamenre", user: userSaved});
    };
  } catch (err) {
    res.status(500).json({error: `Ocurrio un error en el servicio de Autenticacion || Error: ${err}`});
  }
})

export default router;