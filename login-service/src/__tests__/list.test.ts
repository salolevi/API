import app from '../index'
import request, {Response} from 'supertest';
import { User, IUser } from '../models/User';
import { HydratedDocument } from 'mongoose';
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
    const users : Array<any> = Array.from(await User.find({}));
    const totalUsers : number = users.length;
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
      expect(response.body).toHaveProperty('error', 'Acceso no autorizado || token incorrecto o problema al acceder al servidor');
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

  it('Deberia devolverme tres usuarios con emails que empiezan en "sa"', async () => {

    const queryString = 'sa';
    const tokenResponse : Response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test2@example.com',
        password: 'password123'
      });

    const {token} = tokenResponse.body;
    const response : Response = await request(app)
      .get(`/auth/listar?page=0&queryString=${queryString}`)
      .set('Authorization', `Bearer ${token}`);

    const validResponse : boolean = Array.from(response.body).length === 3 && Array.from(response.body).every((user) => {
      const newUser : HydratedDocument<IUser> = new User(user);
      return newUser.email.startsWith('sa')
    })
    expect(response.statusCode).toBe(200);
    expect(validResponse).toBeTruthy();
    // expect(response.body).
  })


});