import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import "dotenv/config";
import { Strategy } from "passport-discord";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy) {

  constructor() {
    super({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: [
        'identify',
        'guilds'
      ]
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    
    return done(null, profile);
  }

}