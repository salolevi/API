import app from '../index'
import request, {Response} from 'supertest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { HydratedDocument } from 'mongoose';
import { User, IUser } from '../models/User';

dotenv.config();

describe('Endpoint de listar | Servicio de negocio', () => {
  it('Deberia arrojar un error de acceso no autorizado al no indicar origen', async () => {

    const response = await request(app)
    .get(`/business/listar?page=0&quantity=Infinity&queryString=`)
    .set("Authorization", 'Bearer faketoken');

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Acceso no autorizado');
  });

  it('Deberia arrojar un error de acceso al proveer un origen inadecuado', async() => {
    const TEST_EMAIL = 'test@example.com'
    const token = jwt.sign({email: TEST_EMAIL}, process.env.JWT_KEY || "", {expiresIn: '1h'});
    const INVALID_ORIGIN = 'invalidorigin'

    const response = await request(app)
    .get(`/business/listar?page=0&quantity=Infinity&queryString=`)
    .set("Authorization", `Bearer ${token}`)
    .set('origin', INVALID_ORIGIN);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Acceso no autorizado');
  });

  it('Deberia mostrar todos los usuarios', async () => {
    const TEST_EMAIL = 'test@example.com'
    const token = jwt.sign({email: TEST_EMAIL}, process.env.JWT_KEY || "", {expiresIn: '1h'});
    const VALID_ORIGIN = 'test/auth/listar';

    const response = await request(app)
    .get(`/business/listar?page=0&quantity=Infinity&queryString=`)
    .set("Authorization", `Bearer ${token}`)
    .set('origin', VALID_ORIGIN);

    const users : Array<HydratedDocument<IUser>> = Array.from(response.body.users).map(user => new User(user));
    const responseTotalUsers : number = users.length;
    const totalUsers = (await User.find({})).length;
    expect(response.statusCode).toBe(200);
    expect(responseTotalUsers).toBe(totalUsers);
  });

  it('Deberia mostrar los sergundos tres usuarios ordenados por email', async () => {
    const TEST_EMAIL = 'test@example.com'
    const token = jwt.sign({email: TEST_EMAIL}, process.env.JWT_KEY || "", {expiresIn: '1h'});
    const USERS_PER_PAGE = 3;
    const PAGE = 1;
    const VALID_ORIGIN = 'test/auth/listar';

    const response = await request(app)
    .get(`/business/listar?page=${PAGE}&quantity=${USERS_PER_PAGE}&queryString=`)
    .set("Authorization", `Bearer ${token}`)
    .set('origin', VALID_ORIGIN);

    const threeUsersExpected : Array<HydratedDocument<IUser>> = await User.find({}).skip(USERS_PER_PAGE * PAGE).limit(USERS_PER_PAGE);
    const threeUsersResponse = Array.from(response.body.users).map(user => new User(user));

    const validateUsers = threeUsersExpected.every((user, index) => user.email === threeUsersResponse[index].email);
    expect(response.statusCode).toBe(200);
    expect(response.body.users.length).toBe(USERS_PER_PAGE);
    expect(validateUsers).toBeTruthy();
  });

  it('Deberia arrojar un error al recibir un token con un email que no esta registrado', async () => {
    const INVALID_EMAIL = 'invalidemail@example.com'
    const token = jwt.sign({email: INVALID_EMAIL}, process.env.JWT_KEY || "", {expiresIn: '1h'});
    const USERS_PER_PAGE = 3;
    const PAGE = 1;
    const VALID_ORIGIN = 'test/auth/listar';

    const response = await request(app)
    .get(`/business/listar?page=${PAGE}&quantity=${USERS_PER_PAGE}&queryString=`)
    .set("Authorization", `Bearer ${token}`)
    .set('origin', VALID_ORIGIN);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Acceso no autorizado');
  })
})