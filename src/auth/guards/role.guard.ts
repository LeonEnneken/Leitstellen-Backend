import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Payload } from "../auth.entity";

@Injectable()
export class RoleGuard implements CanActivate {

  constructor(private reflector: Reflector) {

  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const role = this.reflector.get<string>('role', context.getHandler()).toUpperCase();

    if(!(role))
      return true;
    const roles = ['USER', 'MODERATOR', 'ADMINISTRATOR'];

    const request = context.switchToHttp().getRequest();
    const user: Payload = request.user;

    if(!(roles.includes(role)))
      return false;
    return roles.indexOf(user.role) >= roles.indexOf(role);
  }
}