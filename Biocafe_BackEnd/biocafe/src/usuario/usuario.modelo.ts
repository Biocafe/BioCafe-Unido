import mongoose from 'mongoose';

export const UsuarioSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['admin', 'caficultor'], default: 'caficultor' },
  },
  {
    timestamps: true,
  }
);

export interface IUsuario extends mongoose.Document {
  email: string;
  password: string;
  rol: string;
}
