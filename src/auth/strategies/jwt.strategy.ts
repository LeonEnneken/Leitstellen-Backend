import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import "dotenv/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Payload } from "../auth.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET
    })
  }

  async validate(payload: Payload) {
    return {
      sub: payload.sub,
      role: payload.role,
      permissions: payload.permissions
    }
  }

}