import {Body,Controller,Delete, Get, Param, Patch, Post, UploadedFile,UseInterceptors,} from '@nestjs/common';
import { DatosService } from './datos.service';
import { DatosDto } from './datos.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('datos')
export class DatosController {
  constructor(private readonly datosService: DatosService) {}

  // 🔹 Crear un dato manualmente
  @Post()
  async crearDato(@Body() datosDto: DatosDto) {
    const respuesta = await this.datosService.CrearDato(datosDto);
    return {
      ok: true,
      mensaje: 'Dato creado exitosamente.',
      dato: respuesta,
    };
  }

  // 🔹 Consultar un dato por ID
  @Get('/:id')
  async consultarDato(@Param('id') id: string) {
    const dato = await this.datosService.BuscarPorId(id);
    return dato
      ? { ok: true, dato }
      : { ok: false, mensaje: 'Dato no encontrado.' };
  }

  // 🔹 Consultar todos los datos
  @Get()
  async consultarTodos() {
    const datos = await this.datosService.BuscarTodos();
    return {
      ok: true,
      total: datos.length,
      datos,
    };
  }

  // 🔹 Eliminar un dato por ID
  @Delete('/:id')
  async eliminar(@Param('id') id: string) {
    const eliminado = await this.datosService.EliminarDato(id);
    return eliminado
      ? { ok: true, mensaje: 'Dato eliminado exitosamente.' }
      : { ok: false, mensaje: 'El dato no existe o ya fue eliminado.' };
  }

  // 🔹 Actualizar un dato existente por ID
  @Patch('/:id')
  async actualizar(@Param('id') id: string, @Body() datosDto: DatosDto) {
    const datoActualizado = await this.datosService.ActualizarDato(id, datosDto);
    return datoActualizado
      ? { ok: true, mensaje: 'Dato actualizado correctamente.', datoActualizado }
      : { ok: false, mensaje: 'El dato no existe o no se pudo actualizar.' };
  }

  // 🔹 Cargar y validar un archivo Excel (sin guardar en DB aún)
  @Post('cargar-excel')
  @UseInterceptors(FileInterceptor('file'))
  async cargarDesdeExcel(@UploadedFile() file: Express.Multer.File) {
    const datos = await this.datosService.cargarDesdeExcel(file.buffer);
    return {
      ok: true,
      mensaje: `Archivo pro correctamente. Se identificaron ${datos.length} filas válidas.`,
      total: datos.length,
      datosLeidos: datos,
    };
  }
}