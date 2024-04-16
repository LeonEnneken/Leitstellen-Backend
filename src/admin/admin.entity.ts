import { ApiProperty } from "@nestjs/swagger";

export class BackendAdminDetails {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: String, readOnly: true })
  firstName: string;

  @ApiProperty({ type: String, readOnly: true })
  lastName: string;

  @ApiProperty({ type: String, readOnly: true })
  phoneNumber: string;
}

export class BackendAdmin {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: BackendAdminDetails, readOnly: true })
  details: BackendAdminDetails;

  @ApiProperty({ type: Date, readOnly: true })
  updatedAt: Date;

  @ApiProperty({ type: Date, readOnly: true })
  createdAt: Date;
}

export class BackendConnectedUserUser {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: String, readOnly: true })
  firstName: string;
  
  @ApiProperty({ type: String, readOnly: true })
  lastName: string;
  
  @ApiProperty({ type: String, readOnly: true })
  phoneNumber: string;
  
  @ApiProperty({ type: String, enum: ['USER', 'MODERATOR', 'ADMINISTRATOR'], readOnly: true })
  role: 'USER' | 'MODERATOR' | 'ADMINISTRATOR';
  
  @ApiProperty({ type: String, enum: ['OFFLINE', 'OFF_DUTY', 'ON_DUTY'], readOnly: true })
  status: 'OFFLINE' | 'OFF_DUTY' | 'ON_DUTY';

  @ApiProperty({ type: String, readOnly: true })
  groupId: string;

  @ApiProperty({ type: String, isArray: true, readOnly: true })
  departmentIds: string[];

  @ApiProperty({ type: Boolean, readOnly: true })
  terminated: boolean;
}

export class BackendConnectedUser {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: String, readOnly: true })
  userId: string;

  @ApiProperty({ type: String, readOnly: true })
  socketId: string;

  @ApiProperty({ type: BackendConnectedUserUser, readOnly: true })
  user: BackendConnectedUserUser;

  @ApiProperty({ type: Date, readOnly: true })
  createdAt: Date;
}