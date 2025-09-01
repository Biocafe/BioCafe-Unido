import { Module } from '@nestjs/common';
import { DatosController } from './datos.controller';
import { DatosService } from './datos.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DatosSchema } from './datos.modelo';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Datos', schema: DatosSchema }]),
  ],
  controllers: [DatosController],
  providers: [DatosService],
})
export class DatosModule {}
