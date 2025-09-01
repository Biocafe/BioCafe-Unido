import mongoose from 'mongoose';

export const PruebaSchema = new mongoose.Schema(
  {
    tipoPrueba: { type: String, required: true },
    datos: [
      {
        Archivo: Buffer,
        tto: {
          nombre: { type: String, required: true },
          valor: { type: Number, required: true },
        },
        replica: {
          nombre: { type: String, required: true },
          valor: { type: Number, required: true },
        },
        resultado: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export interface IPrueba extends mongoose.Document {
  tipoPrueba: string;
  datos: {
    Archivo: Buffer;
    tto: { nombre: string; valor: number };
    replica: { nombre: string; valor: number };
    resultado: number;
  }[];
}
