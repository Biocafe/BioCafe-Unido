import mongoose from "mongoose";

export const AutenticadorSchema = new mongoose.Schema(
    {
        usuario: String,
        password: String,
        token: String
    }
);

export interface IAutenticador extends mongoose.Document {
    usuario: string;
    password: string;
    token: string;
}
