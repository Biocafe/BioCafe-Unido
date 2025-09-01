import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatosDto } from './datos.dto';
import { IDatos } from './datos.modelo';
import * as XLSX from 'xlsx';

@Injectable()
export class DatosService {
  constructor(@InjectModel('Datos') private datosModel: Model<IDatos>) {}

  pruebaInicialGet(): string {
    return 'Este es el Get';
  }

  // ✅ Crear dato con normalización de decimales
  async CrearDato(datos: DatosDto): Promise<IDatos> {
    const datosNormalizados: DatosDto = {
      ...datos,
      valortto: this.normalizarNumero(datos.valortto),
      resultado: this.normalizarNumero(datos.resultado),
    };

    const nuevoDato = new this.datosModel(datosNormalizados);
    return await nuevoDato.save();
  }

  // ✅ Buscar dato por ID
  async BuscarPorId(id: string): Promise<IDatos | null> {
    try {
      return await this.datosModel.findById(id).exec();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // ✅ Buscar todos los datos
  async BuscarTodos(): Promise<IDatos[]> {
    return await this.datosModel.find().exec();
  }

  // ✅ Eliminar dato por ID
  async EliminarDato(id: string): Promise<any> {
    const respuesta = await this.datosModel.deleteOne({ _id: id }).exec();
    return respuesta.deletedCount === 1 ? respuesta : null;
  }

  // ✅ Actualizar dato con normalización
  async ActualizarDato(id: string, datosDto: DatosDto): Promise<IDatos | null> {
    try {
      const datosNormalizados: DatosDto = {
        ...datosDto,
        valortto: this.normalizarNumero(datosDto.valortto),
        resultado: this.normalizarNumero(datosDto.resultado),
      };

      return await this.datosModel
        .findOneAndUpdate({ _id: id }, datosNormalizados, { new: true })
        .exec();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // ✅ Cargar múltiples datos desde un archivo Excel (.xlsx)
  async cargarDesdeExcel(buffer: Buffer): Promise<DatosDto[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const hoja = workbook.Sheets[workbook.SheetNames[0]];
      const datosExcel = XLSX.utils.sheet_to_json<any>(hoja);

      const datosValidos: DatosDto[] = [];
      const tratamientosSet = new Set<string>();
      const replicasPorTratamiento: Record<string, number> = {};

      for (const fila of datosExcel) {
        const tratamiento = fila.tratamiento ?? fila.Tratamiento;
        const valorTratamiento = fila.valor_tratamiento ?? fila['valor tratamiento'] ?? fila.Valor;
        const resultado = fila.resultado ?? fila.Resultado;

        if (
          typeof tratamiento === 'string' &&
          !isNaN(Number(valorTratamiento)) &&
          !isNaN(Number(resultado))
        ) {
          tratamientosSet.add(tratamiento);
          replicasPorTratamiento[tratamiento] = (replicasPorTratamiento[tratamiento] || 0) + 1;

          datosValidos.push({
            Archivo: buffer,
            nombretto: tratamiento,
            valortto: this.normalizarNumero(valorTratamiento),
            prueba: 'excel_import',
            resultado: this.normalizarNumero(resultado),
          });
        } else {
          throw new BadRequestException(`Error en fila: ${JSON.stringify(fila)}`);
        }
      }

      // Verificaciones estadísticas mínimas (sin bloquear)
      if (tratamientosSet.size < 3) {
        console.warn("⚠️ Mínimo se requieren 3 tratamientos para un análisis ANOVA con significancia estadística.");
      }

      const replicaUnica = Object.values(replicasPorTratamiento).some((r) => r === 1);
      if (replicaUnica) {
        throw new BadRequestException("❌ No se puede hacer ANOVA con solo una réplica por tratamiento.");
      }

      if (Object.values(replicasPorTratamiento).some(r => r < 3)) {
        console.warn("⚠️ Se recomienda al menos 3 réplicas por tratamiento para mayor validez estadística.");
      }      

      return datosValidos;
    } catch (error) {
      throw new BadRequestException(`Error al procesar el archivo Excel: ${error.message}`);
    }
  }

  // ✅ Conversión segura de strings numéricos con punto o coma
  private normalizarNumero(valor: any): number {
    if (typeof valor === 'string') {
      return Number(valor.replace(',', '.'));
    }
    return Number(valor);
  }
}
