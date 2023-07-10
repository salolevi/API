import { Router } from 'express';
import { serverError } from '../middlewares/notFound';
import { listFunction } from '../controllers/business.controller';


const router: Router = Router();

router.get('/listar', listFunction);

export default router;