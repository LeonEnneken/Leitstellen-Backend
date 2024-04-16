import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Payload } from "../auth.entity";

@Injectable()
export class PermissionsGuard implements CanActivate {

  constructor(private reflector: Reflector) {

  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const permission = this.reflector.get<string>('permission', context.getHandler());

    if(!(permission))
      return true;
      
    const request = context.switchToHttp().getRequest();
    const user: Payload = request.user;

    if(user.role === 'ADMINISTRATOR')
      return true;
    if(user.permissions.includes('*'))
      return true;
    return user.permissions.includes(permission);
  }
}