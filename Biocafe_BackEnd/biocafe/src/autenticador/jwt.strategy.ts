// Importaciones de NestJS, Passport y configuración del entorno
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Estrategia personalizada para manejar autenticación con JWT
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    // Configuración de la estrategia JWT: extrae el token del header y valida su firma
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del encabezado Authorization
      ignoreExpiration: false, // Rechaza tokens expirados
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secreto_seguro', // Clave secreta desde env o valor por defecto
    });
  }

  // Método que define qué información se incluirá en req.user después de validar el token
  async validate(payload: any) {
    return { id: payload.sub, rol: payload.rol }; // Este objeto estará disponible como req.user
  }
}
