import mongoose from 'mongoose';

export const DatosSchema = new mongoose.Schema(
  {
    Archivo: Buffer,
    nombretto: { type: String, required: true },
    valortto: { type: Number, required: true },
    prueba: { type: String, required: true },
    resultado: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export interface IDatos extends mongoose.Document {
  Archivo: Buffer;
  nombretto: string;
  valortto: number;
  prueba: string;
  resultado: number;
}
