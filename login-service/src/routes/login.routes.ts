import {Router} from 'express';
import { serverError, notFound } from '../middlewares/notFound';
import { registerFunction, loginFunction, listFunction } from '../controllers/login.controller';


const router: Router = Router();

//controlador de la ruta registro /auth/registro
router.post('/registro', registerFunction);

router.post('/login', loginFunction);

router.get('/listar', listFunction);

router.use(serverError);

export default router;