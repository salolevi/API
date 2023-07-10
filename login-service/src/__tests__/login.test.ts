import app from '../index'
import { registerFunction, loginFunction, listFunction } from "../controllers/login.controller";
import request from 'supertest';

describe('Endpoint de login', () => {
  it('Deberia ingresar correctamente', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test2@example.com',
        password: 'password123',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Credenciales validas');
    expect(response.body).toHaveProperty('token');
  });

  it('Deberia indicar que las credenciales son invalidas', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password1234',
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'El usuario o la contraseña son incorrectos');
  });

  it('Deberia indicarme que uno de los datos es incorrecto', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'emailinvalido',
        password: 'password123',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Formato de mail o contraseña invalido');
  });

  it('Deberia indicarme que uno de los datos es incorrecto', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'emailinvalido',
        password: '',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Formato de mail o contraseña invalido');
  });

});