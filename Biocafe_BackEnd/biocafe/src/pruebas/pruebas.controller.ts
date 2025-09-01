import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PruebasService } from './pruebas.service';
import { DatosDto } from '../datos/datos.dto';

/**
 * Controlador encargado de exponer las pruebas estadísticas:
 * - Shapiro
 * - Levene
 * - ANOVA
 * - Duncan
 */
@Controller('pruebas')
export class PruebasController {
  constructor(private readonly pruebasService: PruebasService) {}

  /**
   * 📊 Ruta POST para ejecutar cualquier prueba estadística.
   * Body esperado:
   * {
   *   tipo: "shapiro" | "levene" | "anova" | "duncan",
   *   datos: DatosDto[]
   * }
   */
  @Post()
  async ejecutarPrueba(@Body() body: { tipo: string; datos: DatosDto[] }) {
    const { tipo, datos } = body;

    // 🛑 Validación básica de estructura
    if (!tipo || !datos || !Array.isArray(datos) || datos.length === 0) {
      throw new BadRequestException('Debe enviar el tipo de prueba y un arreglo de datos válidos.');
    }

    // 🧪 Validar que el tipo de prueba sea uno de los soportados
    const tipoNormalizado = tipo.toLowerCase();
    const pruebasPermitidas = ['shapiro', 'levene', 'anova', 'duncan'];
    if (!pruebasPermitidas.includes(tipoNormalizado)) {
      throw new BadRequestException(`Tipo de prueba no soportado. Pruebas válidas: ${pruebasPermitidas.join(', ')}`);
    }

    // ✅ Ejecutar la prueba estadística
    const resultado = await this.pruebasService.ejecutar(tipoNormalizado, datos);

    // 📦 Retornar respuesta estructurada
    return {
      ok: true,
      metodo: tipoNormalizado.toUpperCase(),
      resultado,
    };
  }
}
