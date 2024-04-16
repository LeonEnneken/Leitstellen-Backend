import { ApiProperty } from "@nestjs/swagger";

export class DepartmentBody {

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String, isArray: true })
  permissions: string[];

  @ApiProperty({ type: Object, required: false })
  data?: Object;

}

export class BackendDepartment {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String, isArray: true })
  permissions: string[];

  @ApiProperty({ type: Object, required: false })
  data?: Object;

  @ApiProperty({ type: Boolean, default: false })
  default: boolean;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}