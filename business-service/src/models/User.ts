import mongoose, { mongo } from 'mongoose';
const { model, Schema } = mongoose;

interface IUser {
  email: string,
  password: string,
  dateJoined: Date
}


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

export const User = model<IUser>('User', UserSchema);