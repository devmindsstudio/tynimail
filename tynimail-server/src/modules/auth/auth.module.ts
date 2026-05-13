import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "@/modules/users";
import { JwtModule } from "@/modules/jwt";
import { MetadataModule } from "@/modules/metadata";
import { PostmarkModule } from '../postmark';

@Module({
  imports: [UsersModule, JwtModule, MetadataModule, PostmarkModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}