import { Controller, Get, Req, Response, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import "dotenv/config";
import { Request } from "express";
import { SentryInterceptor } from "src/@interceptors/sentry.interceptor";
import { UserAuth } from "./auth.decorator";
import { Payload } from "./auth.entity";
import { AuthService } from "./auth.service";
import { DiscordGuard } from "./guards/discord.guard";

@UseInterceptors(SentryInterceptor)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {
    
  }

  @UseGuards(DiscordGuard)
  @Get()
  @ApiOperation({
    summary: 'Discord user login'
  })
  @ApiOkResponse({
    description: 'OK'
  })
  async login() {

  }

  @UseGuards(DiscordGuard)
  @Get('callback')
  @ApiOperation({
    summary: 'Discord user login (callback)'
  })
  @ApiOkResponse({
    description: 'OK'
  })
  async loginCallback(@Req() req: Request, @Response() res: any) {
    const token = await this.authService.login(req.user);

    const redirect = process.env.REDIRECT;

    if(token == null) {
      res.redirect(302, `${redirect}?error=not-permitted`);
      return;
    }
    if(token.error) {
      res.redirect(302, `${redirect}?error=${token.error}`);
      return;
    }
    res.redirect(302, `${redirect}?access_token=${token.access_token}`);
  }

  @UserAuth('Refresh authentication token')
  @Get('refresh_token')
  @ApiOkResponse({
    description: 'OK'
  })
  async refreshToken(@Req() req: Request) {
    return this.authService.refreshToken(req.user as Payload);
  }

}
