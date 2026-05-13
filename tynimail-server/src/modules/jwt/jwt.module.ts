import { Global, Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from './jwt.service';

@Global()
@Module({
  imports: [
    NestJwtModule.register({}),
    ConfigModule,
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
