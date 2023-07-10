import mongoose, { mongo } from 'mongoose';
const { model, Schema } = mongoose;

// implemento interfaz para definir estructura del usuario

export interface IUser {
  email: string,
  password: string,
  dateJoined: Date
}

//creo un esquema de mongoose a partir de la interfaz y explicito que valores son obligatorios a la hora de crear un usuario
const UserSchema = new Schema<IUser>({
  email: {type: String, required: true},
  password: {type: String, required: true},
  dateJoined: {type: Date, required: true}
});

// const newUser = new User({
//   email: "salolevi2@gmail.com",
//   password: 'salo123',
//   dateJoined: new Date()
// });

export const User = model<IUser>('User', UserSchema); //exporto el modelo que va a permitir la generacion de nuevos usuarios y busquedas en la base de datos