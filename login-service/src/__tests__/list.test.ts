import app from '../index'
import { registerFunction, loginFunction, listFunction } from "../controllers/login.controller";
import request, {Response} from 'supertest';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

describe('Endpoint de listar', () => {
  it('Deberia listar todos los usuarios', async () => {

    const tokenResponse : Response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test2@example.com',
        password: 'password123'
      });

    const {token} = tokenResponse.body;
    const totalUsers : number = Array.from(await User.find({})).length;
    const response = await request(app)
      .get('/auth/listar?visualize=true')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(totalUsers);
  });

  it('Deberia arrojar un error de autenticacion ya que no se envia un token', async() => {
    const response : Response = await request(app)
      .get('/auth/listar?visualize=true');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error', 'Acceso no autorizado || token incorrecta o problema con el servidor');
  });

  it('Deberia arrojar un error de autenticacion ya que no se envia un token', async() => {
    const NON_EXISTENT_EMAIL = 'test3@example.com';
    const fakeToken = jwt.sign({email: NON_EXISTENT_EMAIL}, 'fake_key', {expiresIn: '1h'});

    const response : Response = await request(app)
      .get('/auth/listar?visualize=true')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Acceso no autorizado || problema al validar el token o al enviar la solicitud');
  });
});