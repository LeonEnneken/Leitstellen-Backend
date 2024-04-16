import { HttpException, Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";
import { PrismaService } from "src/@services/prisma.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {

  constructor(private jwt: JwtService, private prisma: PrismaService) {

  }

  async use(req: Request, res: Response, next: NextFunction) {
    if(!(req.headers.authorization)) {
      next();
      return;
    }
    const decoded: any = this.jwt.decode(req.headers.authorization);

    if(decoded) {
      const user = await this.prisma.user.findFirst({
        where: {
          id: decoded.sub
        }
      });

      if(!(user))
        throw new HttpException('Unauthorized', 401);

      const member = await this.prisma.member.findFirst({
        where: {
          userId: user.id
        }
      });

      if(!(member)) {
        next();
        return;
      }

      if(member.terminated)
        throw new HttpException('Unauthorized', 401);
      next();
      return;
    }
    next();
  }
}