import { Module } from '@nestjs/common';
import { AutenticadorController } from './autenticador.controller';
import { AutenticadorService } from './autenticador.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AutenticadorSchema } from './autenticador.modelo';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Autenticador', schema: AutenticadorSchema }]),
    EmailModule,
  ],
  controllers: [AutenticadorController],
  providers: [AutenticadorService]
})
export class AutenticadorModule {}
