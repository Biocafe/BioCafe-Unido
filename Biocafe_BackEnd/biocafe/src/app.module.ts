import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatosModule } from './datos/datos.module';
import { AutenticadorModule } from './autenticador/autenticador.module';
import { UsuarioModule } from './usuario/usuario.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PruebasModule } from './pruebas/pruebas.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb+srv://biocafe2025:BioCafe2025@cluster0.xww0m.mongodb.net/biocafe'),
    DatosModule, AutenticadorModule, UsuarioModule, PruebasModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
