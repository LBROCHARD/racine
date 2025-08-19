import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest, UserPayload } from 'src/types/request.interface';
import { ConfigService } from '@nestjs/config';

const TOKEN_EXPIRED_STATUS = 498;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token: string | undefined = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET_KEY');

      const payload: UserPayload = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });

      // We're assigning the payload to the request object here so that we can access it in our route handlers
      request.user = {
        id: payload.id,
        username: payload.username,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch (e) {
      // Throw 498 if token is expired in any request
      if (e instanceof Error && e.name === 'TokenExpiredError') {
        throw new HttpException('Token has expired', TOKEN_EXPIRED_STATUS);
      }
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(
    request: AuthenticatedRequest,
  ): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
