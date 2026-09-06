import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module.js";
import { AuthService } from "./auth.service.js";
import { AuthResolver } from "./auth.resolver.js";
import { JwtStrategy } from "./jwt.strategy.js";
import type { Env } from "../config/env.schema.js";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get("JWT_SECRET", { infer: true }),
        signOptions: { expiresIn: config.get("JWT_EXPIRES_IN", { infer: true }) }
      })
    })
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
