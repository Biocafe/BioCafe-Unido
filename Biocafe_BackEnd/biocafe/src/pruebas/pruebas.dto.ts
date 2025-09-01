import { DatosDto } from '../datos/datos.dto';

export class PruebaDto {
  tipoPrueba: string; // Tipo de prueba: 'shapiro', 'levene', 'anova', 'duncan'
  datos: DatosDto[]; 
}