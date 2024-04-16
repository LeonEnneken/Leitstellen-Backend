import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { JwtGuard } from "./guards/jwt.guard";
import { PermissionsGuard } from "./guards/permissions.guard";
import { RoleGuard } from "./guards/role.guard";

export function RoleAuth(role: 'USER' | 'MODERATOR' | 'ADMINISTRATOR', description?: string) {
  return applyDecorators(
    SetMetadata('role', role),
    UseGuards(JwtGuard, RoleGuard),
    ApiSecurity('apiKey'),
    ApiOperation({
      summary: `Required role: ${role}`,
      description: description
    }),
    ApiResponse({
      status: 404,
      description: 'Not found!'
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized!'
    }),
    ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  );
}

export function PermissionsAuth(permission: string, description?: string) {
  return applyDecorators(
    SetMetadata('permission', permission),
    UseGuards(JwtGuard, PermissionsGuard),
    ApiSecurity('apiKey'),
    ApiOperation({
      summary: `Required permission: ${permission}`,
      description: description
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized!'
    }),
    ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  );
}

export function UserAuth(description?: string) {
  return applyDecorators(
    UseGuards(JwtGuard),
    ApiSecurity('apiKey'),
    ApiOperation({
      summary: `Required authentication`,
      description: description
    }),
    ApiResponse({
      status: 404,
      description: 'Not found!'
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized!'
    }),
    ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  );
}

export function PaginationQuerys() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      description: 'Page count',
      required: false,
      schema: {
        type: 'Integer',
        format: 'int32',
        default: 0,
        minimum: 0
      }
    }),
    ApiQuery({
      name: 'per_page',
      description: 'Number of items per page',
      required: false,
      schema: {
        type: 'Integer',
        format: 'int32',
        default: 20,
        minimum: 1,
        maximum: 500
      }
    })
  );
}