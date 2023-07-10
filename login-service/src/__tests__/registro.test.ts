import app from '../index'
import { registerFunction, loginFunction, listFunction } from "../controllers/login.controller";
import request from 'supertest';
import { User } from '../models/User';

describe('Endpoint de registro', () => {
  it('Deberia registrar un nuevo usuario', async () => {

    const TEST_EMAIL = "test@example.com";
    const TEST_PASSWORD = 'password123';

    await User.findOneAndDelete({email: TEST_EMAIL});

    const response = await request(app)
      .post('/auth/registro')
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('message', 'Usuario creado correctamente');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });
  
  it('Deberia retornar error de formato invalido', async () => {
    const response = await request(app)
      .post('/auth/registro')
      .send({
        email: 'emailinvalido',
        password: 'password123',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Formato de mail o contraseña invalido');
  });

  it('Deberia retornar un mensaje indicando que el usuario ya existe', async () => {
    const response = await request(app)
      .post('/auth/registro')
      .send({
        email: 'salolevi2@gmail.com',
        password: 'password123',
      });

    expect(response.statusCode).toBe(409);
    expect(response.body).toHaveProperty('error', 'El usuario ya se encuentra registrado');
  });

  it('Se envia una solicitud con el campo de contraseña vacio, deberia retornar un status 400', async () => {
    const response = await request(app)
    .post('/auth/registro')
    .send({
      email: 'salolevi2@gmail.com',
      password: '',
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Formato de mail o contraseña invalido');
  });
});