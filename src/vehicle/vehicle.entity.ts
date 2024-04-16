import { ApiProperty } from "@nestjs/swagger";

export class VehicleBody {

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  licensePlate: string;

  @ApiProperty({ type: String, required: false })
  groupId?: string;

  @ApiProperty({ type: String, required: false })
  departmentId?: string;
}

export class BackendVehicle {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  licensePlate: string;

  @ApiProperty({ type: String, required: false })
  groupId?: string;

  @ApiProperty({ type: String, required: false })
  departmentId?: string;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}