import mongoose, { mongo } from 'mongoose';
const { model, Schema } = mongoose;


const UserSchema = new Schema({
  email: String,
  password: String,
  dateJoined: Date
});

// const newUser = new User({
//   email: "salolevi2@gmail.com",
//   password: 'salo123',
//   dateJoined: new Date()
// });

export const User = model('User', UserSchema);