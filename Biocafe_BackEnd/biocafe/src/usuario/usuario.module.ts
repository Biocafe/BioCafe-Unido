import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuarioSchema } from './usuario.modelo';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Usuario', schema: UsuarioSchema }])],
  providers: [UsuarioService],
  controllers: [UsuarioController],
  exports: [UsuarioService], // necesario para que autenticador lo consuma
})
export class UsuarioModule {}
