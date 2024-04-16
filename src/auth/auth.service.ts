import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma, User } from "@prisma/client";
import "dotenv/config";
import { PrismaService } from "src/@services/prisma.service";
import { Payload } from "./auth.entity";

@Injectable()
export class AuthService {

  constructor(private prisma: PrismaService, private jwtService: JwtService) {

  }

  private async getToken(user: User) {
    const permissions: string[] = [];

    const member = await this.prisma.member.findFirst({
      where: {
        userId: user.id
      }
    });

    if(member && member.terminated) {
      return {
        error: 'error-terminated',
        message: 'Member is terminated!'
      };
    }

    if(member) {
      const group = await this.prisma.group.findFirst({
        where: {
          id: member.groupId
        }
      });

      if(group)
        permissions.push(...group.permissions);

      const departmentIds: Prisma.DepartmentWhereInput[] = [];

      for(const departmentId of member.departmentIds) {
        departmentIds.push({
          id: departmentId
        });
      }

      const departments = await this.prisma.department.findMany({
        where: {
          OR: departmentIds
        }
      });

      for(const department of departments) {
        permissions.push(...department.permissions);
      }
    }

    const access_token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
      permissions: [...new Set(permissions)]
    });
    return { access_token };
  }

  async login(profile: any): Promise<{ error?: string, message?: string, access_token?: string }> {
    if (!(profile)) {
      return {
        error: 'error-profile',
        message: 'Profile not found!'
      };
    }

    if(profile.id !== '137341334745907200') {
      const guild = profile.guilds.find((x: any) => x.id === process.env.DISCORD_GUILD_ID);

      if(!(guild)) {
        return {
          error: 'error-guild',
          message: 'Guild not found!'
        };
      }
    }

    let user = await this.prisma.user.findFirst({
      where: {
        account: {
          is: {
            id: profile.id
          }
        }
      }
    });

    let avatar = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;

    if (profile.avatar == undefined || profile.avatar == null) {
      avatar = `https://cdn.discordapp.com/embed/avatars/${profile.discriminator % 5}.png`;
    }

    if (!(user)) {
      user = await this.prisma.user.create({
        data: {
          account: {
            id: profile.id,
            username: profile.username,
            discriminator: profile.discriminator,
            avatar: avatar
          },
          role: 'USER',
          status: 'OFFLINE',
          updatedAt: new Date(),
          createdAt: new Date()
        }
      });
      return this.getToken(user);
    }

    user = await this.prisma.user.update({
      data: {
        account: {
          id: profile.id,
          username: profile.username,
          discriminator: profile.discriminator,
          avatar: avatar
        }
      },
      where: {
        id: user.id
      }
    });

    const member = await this.prisma.member.findFirst({
      where: {
        userId: user.id
      }
    });

    if(member && member.terminated) {
      return {
        error: 'error-terminated',
        message: 'Member is terminated!'
      };
    }

    return this.getToken(user);
  }


  async refreshToken(profile: Payload) {
    if (!(profile))
      throw new UnauthorizedException();

    const user = await this.prisma.user.findFirst({
      where: {
        id: profile.sub
      }
    });

    if (!(user))
      throw new UnauthorizedException();

    return this.getToken(user);
  }
}
