import { ApiProperty } from "@nestjs/swagger";

export class ControlCenterBody {

  @ApiProperty({ type: String })
  label: string;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: String, required: false })
  color?: string;

  @ApiProperty({ type: Boolean })
  hasStatus: boolean;

  @ApiProperty({ type: Boolean })
  hasVehicle: boolean;

  @ApiProperty({ type: Number, format: 'int32' })
  maxMembers: number;
}

export class BackendControlCenter {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  label: string;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: String, required: false })
  color?: string;

  @ApiProperty({ type: Boolean })
  hasStatus: boolean;

  @ApiProperty({ type: String, required: false })
  status?: string;

  @ApiProperty({ type: Boolean })
  hasVehicle: boolean;

  @ApiProperty({ type: String, required: false })
  vehicle?: string;

  @ApiProperty({ type: String, isArray: true })
  members: string[];

  @ApiProperty({ type: Number, format: 'int32' })
  maxMembers: number;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}



export class BackendControlCenterMemberControlCenter {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  label: string;
}

export class BackendControlCenterMember {

  @ApiProperty({ type: String })
  id: string;
  
  @ApiProperty({ type: String })
  userId: string;
  
  @ApiProperty({ type: String })
  firstName: string;
  
  @ApiProperty({ type: String })
  lastName: string;
  
  @ApiProperty({ type: String })
  phoneNumber: string;
  
  @ApiProperty({ type: String })
  groupId: string;
  
  @ApiProperty({ type: String, isArray: true })
  departmentIds: string[];
  
  @ApiProperty({ type: BackendControlCenterMemberControlCenter })
  controlCenter: BackendControlCenterMemberControlCenter;
}