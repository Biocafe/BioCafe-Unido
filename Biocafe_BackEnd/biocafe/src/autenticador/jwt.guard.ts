// Importación del decorador Injectable y del guardia base de Passport
import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Se declara un guardia personalizado que extiende el guardia de autenticación JWT de Passport
// Esto permite proteger rutas usando el decorador @UseGuards(JwtAuthGuard)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
