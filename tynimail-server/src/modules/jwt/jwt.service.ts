import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const accessExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
    
    const token = await this.jwtService.signAsync(payload as Record<string, any>, {
      secret: accessSecret,
      expiresIn: accessExpiration as any,
    });

    return `Bearer ${token}`;
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    const token = await this.jwtService.signAsync(payload as Record<string, any>, {
      secret: refreshSecret,
      expiresIn: refreshExpiration as any,
    });
    return `Bearer ${token}`;
  }

  async generateTokenPair(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return {
      accessToken,
      refreshToken
    };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const tokenWithoutBearer = token.replace(/^Bearer\s/, '');
    return this.jwtService.verify(tokenWithoutBearer, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async decodeToken(token: string): Promise<any> {
    return this.jwtService.decode(token);
  }
}
