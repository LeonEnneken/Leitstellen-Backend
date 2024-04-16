import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import "dotenv/config";
import { PrismaModule } from "src/@services/prisma.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { DiscordStrategy } from "./strategies/discord.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports:[
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: {
        expiresIn: '7d'
      }
    })
  ],
  providers: [
    AuthService,
    DiscordStrategy,
    JwtStrategy
  ],
  controllers: [
    AuthController
  ]
})
export class AuthModule {

}